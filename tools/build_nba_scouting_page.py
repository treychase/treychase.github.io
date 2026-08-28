"""Build the NBA scouting page from the nba-stats repo's committed data.

Reads the tracking, possession and shot chart pulls, plus the archetype
clustering, the impact metrics and the star tiers from that repo, and writes
one self-contained HTML page: pick a team, pick a player, and get their
headshot, shot chart, shooting and touch profiles against league percentiles,
their box plus/minus and win shares, the archetype they cluster into and the
tier they land in.

    python tools/build_nba_scouting_page.py \
        --repo <nba-stats repo> \
        --out projects/nba-scouting.html

Everything on the page is season aggregate: no play-by-play, no game logs.
The only thing the page fetches at view time is the headshot itself, straight
from the NBA's own CDN by player id; a portrait that does not load falls
through to a monogram in the player's team colour.
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path

import numpy as np
import pandas as pd

SEASON = "2025-26"

# Hex lattice over the offensive half court, in the NBA's own tenths-of-a-foot
# coordinates: the rim sits at (0, 0), the arc at roughly y = 237.
HEX_DX = 26.0
HEX_DY = HEX_DX * math.sqrt(3) / 2
X_MIN, X_MAX = -250.0, 250.0
Y_MIN, Y_MAX = -52.0, 430.0

# Minimum attempts before a shooting split is ranked. Below these a percentile
# is noise dressed up as a ranking.
SHOOTING_METRICS = [
    ("rim", "Rim FG%", 40),
    ("mid", "Mid-range FG%", 25),
    ("three", "3-point %", 50),
    ("efg", "Effective FG%", 100),
]
TOUCH_AREAS = [("paint", "Paint"), ("post", "Post"), ("elbow", "Elbow")]

# (column, label, format on the page, what the number means)
IMPACT_METRICS = [
    ("BPM", "Box +/-", "signed1", "points per 100 possessions, over average"),
    ("OBPM", "Offensive box +/-", "signed1", "the offensive half of it"),
    ("DBPM", "Defensive box +/-", "signed1", "the defensive half"),
    ("WS48", "Win shares / 48", "fixed3", "an average player earns 0.100"),
    ("WS", "Win shares", "fixed1", "wins on the season so far"),
]

MIN_SHOTS = 20        # below this a shot chart is a scatter of accidents


def percentiles(series: pd.Series) -> pd.Series:
    """Rank within the qualified players only, as 0-100."""
    return series.rank(pct=True) * 100


def shooting_table(shots: pd.DataFrame) -> pd.DataFrame:
    """Per-player rim, mid-range, 3-point and effective FG%, with attempts."""
    zone = shots["SHOT_ZONE_BASIC"]
    three = shots["SHOT_TYPE"].str.startswith("3")
    frame = pd.DataFrame({
        "PLAYER_ID": shots["PLAYER_ID"],
        "made": shots["SHOT_MADE_FLAG"].astype(float),
        "rim": zone.eq("Restricted Area"),
        "mid": zone.eq("Mid-Range"),
        "three": three,
    })
    frame["points"] = frame["made"] * np.where(three, 3.0, 2.0)

    grouped = frame.groupby("PLAYER_ID")
    out = pd.DataFrame(index=grouped.size().index)
    for key in ("rim", "mid", "three"):
        attempts = grouped[key].sum()
        makes = grouped.apply(
            lambda g, k=key: g.loc[g[k], "made"].sum(), include_groups=False)
        out[f"{key}_a"] = attempts
        out[f"{key}_v"] = np.where(attempts > 0, makes / attempts.replace(0, np.nan), np.nan)
    out["efg_a"] = grouped.size()
    out["efg_v"] = grouped["points"].sum() / (2 * out["efg_a"])

    for key, _label, floor in SHOOTING_METRICS:
        qualified = out[f"{key}_v"].where(out[f"{key}_a"] >= floor)
        out[f"{key}_p"] = percentiles(qualified)
    return out


def touch_table(possessions: pd.DataFrame) -> pd.DataFrame:
    """Share of a player's touches taken in the paint, post and elbow."""
    out = pd.DataFrame(index=possessions["PLAYER_ID"])
    touches = possessions["TOUCHES"].to_numpy(dtype=float)
    for key, column in (("paint", "PAINT_TOUCHES"), ("post", "POST_TOUCHES"),
                        ("elbow", "ELBOW_TOUCHES")):
        count = possessions[column].to_numpy(dtype=float)
        out[f"{key}_n"] = count
        out[f"{key}_v"] = np.where(touches > 0, count / np.where(touches > 0, touches, np.nan), np.nan)
    for key, _label in TOUCH_AREAS:
        out[f"{key}_p"] = percentiles(out[f"{key}_v"].where(possessions["TOUCHES"].to_numpy() >= 100))
    return out


def hex_bins(shots: pd.DataFrame) -> tuple[list[list[float]], dict[int, list[int]]]:
    """Bin every shot onto one hex lattice; return the lattice and per-player counts.

    One lattice shared by every player is what makes the payload small: a
    player's chart is a list of (cell, attempts, makes) into the same grid, so
    the geometry is stored once rather than 450 times.
    """
    rows = int((Y_MAX - Y_MIN) / HEX_DY) + 1
    cols = int((X_MAX - X_MIN) / HEX_DX) + 2
    centres: list[list[float]] = []
    index: dict[tuple[int, int], int] = {}
    for row in range(rows):
        y = Y_MIN + row * HEX_DY
        offset = (HEX_DX / 2) if row % 2 else 0.0
        for col in range(cols):
            x = X_MIN - HEX_DX / 2 + offset + col * HEX_DX
            if x < X_MIN - HEX_DX or x > X_MAX + HEX_DX:
                continue
            index[(row, col)] = len(centres)
            centres.append([round(x, 1), round(y, 1)])

    inside = shots.loc[
        shots["LOC_X"].between(X_MIN, X_MAX) & shots["LOC_Y"].between(Y_MIN, Y_MAX)
    ]
    # Nearest lattice point: try the two candidate rows, since a hex's owner is
    # not always the row the y coordinate rounds to.
    x = inside["LOC_X"].to_numpy(dtype=float)
    y = inside["LOC_Y"].to_numpy(dtype=float)
    best_cell = np.full(len(inside), -1)
    best_dist = np.full(len(inside), np.inf)
    for row_delta in (0, 1):
        row = np.clip(np.floor((y - Y_MIN) / HEX_DY).astype(int) + row_delta, 0, rows - 1)
        offset = np.where(row % 2 == 1, HEX_DX / 2, 0.0)
        col = np.rint((x - X_MIN + HEX_DX / 2 - offset) / HEX_DX).astype(int)
        col = np.clip(col, 0, cols - 1)
        cell = np.array([index.get((int(r), int(c)), -1) for r, c in zip(row, col)])
        valid = cell >= 0
        centre = np.array(centres)
        dist = np.full(len(inside), np.inf)
        dist[valid] = np.hypot(x[valid] - centre[cell[valid], 0],
                               y[valid] - centre[cell[valid], 1])
        closer = dist < best_dist
        best_cell[closer] = cell[closer]
        best_dist[closer] = dist[closer]

    binned = pd.DataFrame({
        "PLAYER_ID": inside["PLAYER_ID"].to_numpy(),
        "cell": best_cell,
        "made": inside["SHOT_MADE_FLAG"].to_numpy(dtype=float),
    })
    binned = binned.loc[binned["cell"] >= 0]
    counts = binned.groupby(["PLAYER_ID", "cell"]).agg(
        attempts=("made", "size"), makes=("made", "sum")).reset_index()

    charts: dict[int, list[int]] = {}
    for player_id, group in counts.groupby("PLAYER_ID"):
        flat: list[int] = []
        for _, row in group.iterrows():
            flat += [int(row["cell"]), int(row["attempts"]), int(row["makes"])]
        charts[int(player_id)] = flat
    return centres, charts


def league_hex_rates(centres, charts) -> list[float | None]:
    """League FG% in each hex, so a player's chart can be read against it."""
    attempts = np.zeros(len(centres))
    makes = np.zeros(len(centres))
    for flat in charts.values():
        for i in range(0, len(flat), 3):
            attempts[flat[i]] += flat[i + 1]
            makes[flat[i]] += flat[i + 2]
    return [round(float(m / a), 4) if a >= 200 else None for a, m in zip(attempts, makes)]


def build(repo: Path) -> dict:
    sys.path.insert(0, str(repo))
    from advanced_metrics import (
        AVERAGE_WS48, MIN_MINUTES, STAR_TIER,
        build_box_panel, build_tier_features, fit_star_tiers, impact_metrics,
    )
    from archetypes import FEATURE_NAMES, build_archetype_features, fit_archetypes
    from player_media import TEAM_COLORS

    data = repo / "data"
    tracking = pd.read_csv(data / f"nba_tracking_combined_{SEASON}.csv")
    possessions = pd.read_csv(data / f"tracking_possessions_{SEASON}.csv")
    shots = pd.read_csv(data / f"nba_shot_chart_{SEASON}.csv")
    box_path = data / f"nba_player_box_{SEASON}.csv"
    box = pd.read_csv(box_path) if box_path.exists() else None

    model = fit_archetypes(build_archetype_features(tracking))
    impact = impact_metrics(build_box_panel(shots, possessions, tracking, box=box))
    tiers = fit_star_tiers(build_tier_features(impact.table))
    impact_rows = impact.table.set_index("PLAYER_ID")
    tier_of = tiers.table.set_index("PLAYER_ID")["TIER"].to_dict()
    tier_index = {name: i for i, name in enumerate(
        tiers.names[cluster] for cluster in tiers.order)}
    shooting = shooting_table(shots)
    touch = touch_table(possessions)
    centres, charts = hex_bins(shots)

    team_names = (shots[["TEAM_ID", "TEAM_NAME"]].drop_duplicates()
                  .set_index("TEAM_ID")["TEAM_NAME"].to_dict())
    # similar_players answers in names; the page keys everything by id. Names
    # happen to be unique this season, but two players have shared one before.
    duplicated = model.table["PLAYER_NAME"].duplicated(keep=False)
    name_to_id = (model.table.loc[~duplicated]
                  .set_index("PLAYER_NAME")["PLAYER_ID"].to_dict())

    players: dict[str, dict] = {}
    teams: dict[str, dict] = {}
    for _, row in possessions.iterrows():
        player_id = int(row["PLAYER_ID"])
        tricode = str(row["TEAM_ABBREVIATION"])
        team_id = int(row["TEAM_ID"])
        entry = {
            "n": str(row["PLAYER_NAME"]),
            "t": tricode,
            "gp": int(row["GP"]),
            "min": round(float(row["MIN"])),
            "pts": int(row["POINTS"]),
            "tch": int(row["TOUCHES"]),
        }

        if player_id in shooting.index:
            line = shooting.loc[player_id]
            entry["sh"] = [
                [None if pd.isna(line[f"{k}_v"]) else round(float(line[f"{k}_v"]), 4),
                 int(line[f"{k}_a"]),
                 None if pd.isna(line[f"{k}_p"]) else round(float(line[f"{k}_p"]))]
                for k, _label, _floor in SHOOTING_METRICS
            ]
        if player_id in touch.index:
            line = touch.loc[player_id]
            if isinstance(line, pd.DataFrame):
                line = line.iloc[0]
            entry["tp"] = [
                [None if pd.isna(line[f"{k}_v"]) else round(float(line[f"{k}_v"]), 4),
                 int(line[f"{k}_n"]),
                 None if pd.isna(line[f"{k}_p"]) else round(float(line[f"{k}_p"]))]
                for k, _label in TOUCH_AREAS
            ]
        if player_id in charts:
            entry["hx"] = charts[player_id]

        if player_id in impact_rows.index:
            line = impact_rows.loc[player_id]
            entry["im"] = [
                [round(float(line[column]), 4),
                 None if pd.isna(line[f"{column}_PCTILE"])
                 else round(float(line[f"{column}_PCTILE"]))]
                for column, _label, _fmt, _meaning in IMPACT_METRICS
            ]
            # The two halves in points, for the split bar under the table.
            entry["ha"] = [round(float(line["OFF_POINTS_ADDED"])),
                           round(float(line["DEF_POINTS_ADDED"]))]
        tier = tier_of.get(player_id)
        if tier is not None:
            entry["ti"] = tier_index[tier]

        label = model.label_of(player_id)
        if label is not None:
            profile = model.profile_of(player_id)
            cluster = int(model.table.loc[model.table["PLAYER_ID"] == player_id,
                                          "CLUSTER"].iloc[0])
            entry["a"] = cluster
            entry["z"] = [round(float(v), 3) for v in profile]
            similar = model.similar_players(player_id, 6)
            entry["sim"] = [
                [int(name_to_id[name]), round(float(distance), 2)]
                for name, distance in zip(similar["PLAYER_NAME"], similar["Distance"])
                if name in name_to_id
            ]

        players[str(player_id)] = entry
        teams.setdefault(tricode, {
            "name": team_names.get(team_id, tricode),
            "color": TEAM_COLORS.get(tricode, "#1D428A"),
            "players": [],
        })["players"].append(player_id)

    for team in teams.values():
        team["players"].sort(key=lambda pid: players[str(pid)]["n"])

    archetypes = []
    for cluster_id in sorted(model.names):
        centre = model.centroids.loc[cluster_id]
        top = model.distinguishing(cluster_id, 4)
        archetypes.append({
            "name": model.names[cluster_id],
            "n": int((model.table["CLUSTER"] == cluster_id).sum()),
            "centre": [round(float(v), 3) for v in centre],
            "top": [[str(k), round(float(v), 2)] for k, v in top.items()],
        })

    tier_table = tiers.summary()
    tier_payload = [
        {
            "name": str(row["TIER"]),
            "n": int(row["PLAYERS"]),
            "bpm": round(float(row["BPM"]), 2),
            "ws48": round(float(row["WS48"]), 3),
            "mpg": round(float(row["MPG"]), 1),
            "ppg": round(float(row["PTS_PG"]), 1),
            "defines": str(row["DEFINES"]),
            "star": bool(row["TIER"] == STAR_TIER),
        }
        for _, row in tier_table.iterrows()
    ]
    stars = tiers.stars
    star_payload = [
        [int(row["PLAYER_ID"]), round(float(row["BPM"]), 2),
         round(float(row["WS48"]), 3), round(float(row["WS"]), 1),
         round(float(row["PTS_PG"]), 1), round(float(row["MPG"]), 1)]
        for _, row in stars.iterrows()
        if str(int(row["PLAYER_ID"])) in players
    ]

    return {
        "season": SEASON,
        "impact": {
            "metrics": [[label, fmt, meaning]
                        for _c, label, fmt, meaning in IMPACT_METRICS],
            "pace": round(float(impact.pace), 1),
            "ppp": round(float(impact.points_per_possession), 3),
            "estimated": bool(impact.turnovers_estimated),
            "floor": int(MIN_MINUTES),
            "average_ws48": AVERAGE_WS48,
        },
        "tiers": tier_payload,
        "stars": star_payload,
        "tierK": tiers.k,
        "tierSilhouette": round(float(tiers.silhouette), 3),
        "tierClustered": int(len(tiers.table)),
        "teams": dict(sorted(teams.items(), key=lambda kv: kv[1]["name"])),
        "players": players,
        "features": list(FEATURE_NAMES),
        "archetypes": archetypes,
        "k": model.k,
        "silhouette": round(float(model.silhouette), 3),
        "clustered": int(len(model.table)),
        "shooting": [[label, floor] for _k, label, floor in SHOOTING_METRICS],
        "areas": [label for _k, label in TOUCH_AREAS],
        "hex": {"centres": centres, "dx": HEX_DX, "dy": HEX_DY,
                "league": league_hex_rates(centres, charts)},
    }


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--repo", type=Path, required=True, help="path to the nba-stats repo")
    ap.add_argument("--template", type=Path,
                    default=Path("tools/nba_scouting_template.html"))
    ap.add_argument("--out", type=Path, default=Path("projects/nba-scouting.html"))
    args = ap.parse_args()

    payload = build(args.repo)
    html = args.template.read_text(encoding="utf-8")
    args.out.write_text(
        html.replace('"__DATA__"', json.dumps(payload, separators=(",", ":"))),
        encoding="utf-8")
    print(f"{args.out}: {args.out.stat().st_size / 1024:.0f} KB, "
          f"{len(payload['players'])} players, {len(payload['teams'])} teams, "
          f"k={payload['k']} (silhouette {payload['silhouette']}), "
          f"{len(payload['hex']['centres'])} hexes, "
          f"{len(payload['tiers'])} tiers with {len(payload['stars'])} stars")


if __name__ == "__main__":
    main()

"""Build the projected true shooting page from the nba-stats repo.

Imports that repo's own reconstruction, calibration and pooling rather than
reimplementing any of it, and writes one self-contained HTML page: what every
player shot, what the model projects, how far each was pulled and why, and the
held-out evidence that pooling helps.

    python tools/build_shooting_projection_page.py \
        --repo <nba-stats repo> \
        --out projects/true-shooting-projection.html

Season aggregates only - no play-by-play, no game logs. Headshots come from the
NBA's CDN by player id, stacked over an inline monogram, the same as the
scouting page.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd

SEASON = "2025-26"

# First-half attempt bands for the held-out comparison. The story is that the
# gain is concentrated on the left, so the bands have to be fine enough there
# to show it and coarse enough on the right not to be noise.
BUCKETS = [(0, 100), (100, 200), (200, 350), (350, 10 ** 9)]
BUCKET_LABELS = ["Under 100", "100–200", "200–350", "350+"]


def bucketed_error(calibration: dict) -> list[dict]:
    """Held-out error by first-half volume, his own number alone versus pooled."""
    paired = calibration["players"]
    league, k = calibration["league_rate"], calibration["k"]
    attempts = paired["FGA_early"].to_numpy(dtype=float)
    observed = paired["PPA_early"].to_numpy(dtype=float)
    actual = paired["PPA_late"].to_numpy(dtype=float)
    pooled = (attempts * observed + k * league) / (attempts + k)

    rows = []
    for (low, high), label in zip(BUCKETS, BUCKET_LABELS):
        mask = (attempts >= low) & (attempts < high)
        if mask.sum() < 5:
            continue
        raw_rmse = float(np.sqrt(np.mean((observed[mask] - actual[mask]) ** 2)))
        pooled_rmse = float(np.sqrt(np.mean((pooled[mask] - actual[mask]) ** 2)))
        rows.append({
            "label": label,
            "n": int(mask.sum()),
            "raw": round(raw_rmse, 4),
            "pooled": round(pooled_rmse, 4),
            "gain": round(1 - pooled_rmse / raw_rmse, 4),
        })
    return rows


def build(repo: Path) -> dict:
    sys.path.insert(0, str(repo))
    from archetypes import build_archetype_features, fit_archetypes
    from player_media import TEAM_COLORS
    from true_shooting import build_shooting_panel, fit_shrinkage, project_true_shooting

    data = repo / "data"
    shots = pd.read_csv(data / f"nba_shot_chart_{SEASON}.csv",
                        usecols=["PLAYER_ID", "GAME_DATE", "SHOT_MADE_FLAG", "SHOT_TYPE"])
    possessions = pd.read_csv(data / f"tracking_possessions_{SEASON}.csv")
    tracking = pd.read_csv(data / f"nba_tracking_combined_{SEASON}.csv")

    panel = build_shooting_panel(shots, possessions, tracking)
    calibration = fit_shrinkage(shots)
    archetypes = fit_archetypes(build_archetype_features(tracking))
    groups = archetypes.table.set_index("PLAYER_ID")["ARCHETYPE"]
    projection = project_true_shooting(panel, k=calibration["k"], groups=groups,
                                       calibration=calibration)

    names = [row["ARCHETYPE"] for _, row in projection.groups.iterrows()]
    index_of = {name: i for i, name in enumerate(names)}

    team_names = (pd.read_csv(data / f"nba_shot_chart_{SEASON}.csv",
                              usecols=["TEAM_ID", "TEAM_NAME"])
                  .drop_duplicates().set_index("TEAM_ID")["TEAM_NAME"].to_dict())
    team_of = possessions.set_index("PLAYER_ID")["TEAM_ID"].to_dict()

    players: dict[str, dict] = {}
    teams: dict[str, dict] = {}
    for _, row in projection.table.iterrows():
        player_id = int(row["PLAYER_ID"])
        tricode = str(row["TEAM_ABBREVIATION"])
        entry = {
            "n": str(row["PLAYER_NAME"]),
            "t": tricode,
            "gp": int(row["GP"]),
            "min": round(float(row["MIN"])),
            "pts": int(row["POINTS"]),
            "fga": int(row["FGA"]),
            "fta": round(float(row["FTA"])),
            "ftp": round(float(row["FT_PCT"]), 4),
            "tsa": round(float(row["TSA"]), 1),
            "ts": round(float(row["TS_PCT"]), 4),
            "pr": round(float(row["PROJECTED_TS"]), 4),
            "se": round(float(row["SE"]), 4),
            "w": round(float(row["WEIGHT"]), 4),
            "g": round(float(row["GROUP_TS"]), 4),
        }
        archetype = row["ARCHETYPE"]
        if isinstance(archetype, str):
            entry["a"] = index_of[archetype]
        players[str(player_id)] = entry
        teams.setdefault(tricode, {
            "name": team_names.get(team_of.get(player_id), tricode),
            "color": TEAM_COLORS.get(tricode, "#1D428A"),
            "players": [],
        })["players"].append(player_id)

    for team in teams.values():
        team["players"].sort(key=lambda pid: players[str(pid)]["n"])

    groups_payload = [
        {"name": str(row["ARCHETYPE"]), "players": int(row["PLAYERS"]),
         "ts": round(float(row["GROUP_TS"]), 4)}
        for _, row in projection.groups.iterrows()
    ]

    # The calibration curve is 160 points at 5-attempt steps; thin it for the
    # page, keeping the minimum itself so the marked point is the real one.
    curve = [[k, round(rmse, 5)] for k, rmse in calibration["curve"]
             if k % 20 == 0 or abs(k - calibration["k"]) < 1e-9]

    return {
        "season": SEASON,
        "k": calibration["k"],
        "league": round(projection.league, 4),
        "tau": round(projection.tau, 4),
        "ftLeague": round(float(panel.attrs["ft_league_rate"]), 4),
        "ftPrior": round(float(panel.attrs["ft_prior_attempts"]), 1),
        "teams": dict(sorted(teams.items(), key=lambda kv: kv[1]["name"])),
        "players": players,
        "groups": groups_payload,
        "calibration": {
            "cut": calibration["cut"].strftime("%B %-d"),
            "n": calibration["n_players"],
            "rmse": round(calibration["rmse"], 4),
            "raw": round(calibration["rmse_unpooled"], 4),
            "full": round(calibration["rmse_fully_pooled"], 4),
            "curve": curve,
            "buckets": bucketed_error(calibration),
        },
    }


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--repo", type=Path, required=True, help="path to the nba-stats repo")
    ap.add_argument("--template", type=Path,
                    default=Path("tools/shooting_projection_template.html"))
    ap.add_argument("--out", type=Path,
                    default=Path("projects/true-shooting-projection.html"))
    args = ap.parse_args()

    payload = build(args.repo)
    html = args.template.read_text(encoding="utf-8")
    args.out.write_text(
        html.replace('"__DATA__"', json.dumps(payload, separators=(",", ":"))),
        encoding="utf-8")
    gain = payload["calibration"]
    print(f"{args.out}: {args.out.stat().st_size / 1024:.0f} KB, "
          f"{len(payload['players'])} players, k={payload['k']:.0f}, "
          f"rmse {gain['raw']} -> {gain['rmse']} "
          f"({100 * (1 - gain['rmse'] / gain['raw']):.0f}% better)")


if __name__ == "__main__":
    main()

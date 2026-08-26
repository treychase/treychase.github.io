"""Build the standalone skater-tracking dashboard from a player-tracking feed.

Reads one period of one game out of the `games/*.parquet` files in the tracking
analysis repo and writes a single self-contained HTML page that replays it:
skaters and the puck moving in real time on a regulation rink, with play/pause,
a scrub bar, playback speed, and optional velocity arrows.

    python tools/build_skater_dashboard.py \
        --games-dir <tracking repo>/games \
        --out projects/skater-tracking-dashboard.html

Nothing is fetched at view time. Positions are embedded as integers in tenths
of a foot, which is the resolution the feed itself carries, and the page draws
them on a canvas rather than shipping a plotting library.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import pandas as pd

# The rink, matching viz_functions.py in the tracking analysis repo so the web
# rink and the matplotlib one are the same rink.
RINK = {
    "length": 200.0, "width": 85.0, "corner": 28.0,
    "blueLine": 25.0, "goalLine": 89.0, "circleR": 15.0,
    "spotX": 69.0, "spotY": 22.0, "neutralX": 20.0, "creaseR": 6.0,
}
COLORS = {
    "ice": "#f7f9fb", "board": "#33383d", "red": "#c8102e", "blue": "#0033a0",
    "crease": "#b9d9eb", "home": "#1f3b73", "away": "#b03a2e", "puck": "#111111",
    "carrier": "#f2c200",
}

SECONDS_COL = "PeriodSecondsElapsed"
PUCK_TYPE = "Puck"


def load_period(games_dir: Path, game: int, period: int) -> pd.DataFrame:
    """One period of one game, as it comes off the feed."""
    path = games_dir / f"game_{game:02d}.parquet"
    df = pd.read_parquet(path)
    df = df[df["Period"] == period].copy()
    if df.empty:
        raise SystemExit(f"no rows for game {game} period {period} in {path}")
    return df


def sample_grid(df: pd.DataFrame, stride: int) -> np.ndarray:
    """Every `stride`-th frame of the feed, as period seconds elapsed."""
    times = np.sort(df[SECONDS_COL].unique())
    return times[::stride]


def to_tenths(values: pd.Series) -> np.ndarray:
    """Feet to integer tenths of a foot, the resolution the feed is rounded to."""
    return np.rint(values.to_numpy(dtype="float64") * 10.0).astype("int32")


def segments(idx: np.ndarray, xs: np.ndarray, ys: np.ndarray) -> list:
    """Split one entity's samples into runs of consecutive sample indices.

    A skater is on the ice for a handful of shifts, so storing runs rather than
    a full-length array with a hole for every second he is on the bench keeps
    the page a fraction of the size.
    """
    out, start = [], 0
    for i in range(1, len(idx) + 1):
        if i == len(idx) or idx[i] != idx[i - 1] + 1:
            run = list(range(start, i))
            coords = []
            for j in run:
                coords.append(int(xs[j]))
                coords.append(int(ys[j]))
            out.append([int(idx[start]), coords])
            start = i
    return out


def build_payload(df: pd.DataFrame, times: np.ndarray, game: int, period: int,
                  stride: int) -> dict:
    """Everything the page needs, and nothing it does not."""
    dt = float(np.round(np.median(np.diff(times)), 4))
    slot = {round(float(t), 2): i for i, t in enumerate(times)}
    keep = df[df[SECONDS_COL].round(2).isin(slot)].copy()
    keep["_i"] = keep[SECONDS_COL].round(2).map(slot).astype("int32")

    is_puck = keep["EntityType"].astype(str).str.strip().str.casefold() == PUCK_TYPE.casefold()

    puck_rows = keep[is_puck].sort_values("_i")
    puck = segments(puck_rows["_i"].to_numpy(), to_tenths(puck_rows["Location_X"]),
                    to_tenths(puck_rows["Location_Y"]))

    skaters = []
    home_team = keep.loc[keep["VisOrHome"] == "Home", "Team"].iloc[0]
    for entity, rows in keep[~is_puck].groupby("EntityId", sort=True):
        rows = rows.sort_values("_i")
        skaters.append({
            "id": int(entity),
            "home": int(rows["Team"].iloc[0] == home_team),
            "segs": segments(rows["_i"].to_numpy(), to_tenths(rows["Location_X"]),
                             to_tenths(rows["Location_Y"])),
        })

    # possession and strength change rarely, so run-length encode them: one
    # pair per change rather than one value per sample.
    def rle(series: pd.Series) -> list:
        by_slot = (keep.drop_duplicates("_i").sort_values("_i")
                   .set_index("_i")[series.name].reindex(range(len(times))).ffill())
        out, last = [], object()
        for i, v in enumerate(by_slot.tolist()):
            v = "" if pd.isna(v) else str(v)
            if v != last:
                out.append([i, v])
                last = v
        return out

    return {
        "game": game, "period": period, "dt": dt, "n": len(times),
        "t0": float(times[0]), "stride": stride,
        "homeTeam": str(home_team),
        "awayTeam": str(keep.loc[keep["VisOrHome"] == "Visitor", "Team"].iloc[0]),
        "puck": puck, "skaters": skaters,
        "possession": rle(keep["TeamInPossession"]),
        "rink": RINK, "colors": COLORS,
    }


def render(payload: dict, template: Path) -> str:
    html = template.read_text(encoding="utf-8")
    return html.replace('"__DATA__"', json.dumps(payload, separators=(",", ":")))


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--games-dir", type=Path, required=True,
                    help="the games/ directory of the tracking analysis repo")
    ap.add_argument("--game", type=int, default=1)
    ap.add_argument("--period", type=int, default=1)
    ap.add_argument("--stride", type=int, default=2,
                    help="keep every Nth frame of the 25 Hz feed (2 = 12.5 Hz)")
    ap.add_argument("--template", type=Path,
                    default=Path("tools/skater_dashboard_template.html"))
    ap.add_argument("--out", type=Path,
                    default=Path("projects/skater-tracking-dashboard.html"))
    args = ap.parse_args()

    df = load_period(args.games_dir, args.game, args.period)
    times = sample_grid(df, args.stride)
    payload = build_payload(df, times, args.game, args.period, args.stride)
    args.out.write_text(render(payload, args.template), encoding="utf-8")

    size = args.out.stat().st_size / 1e6
    print(f"{args.out}: {size:.2f} MB, {payload['n']} samples at "
          f"{1 / payload['dt']:.1f} Hz, {len(payload['skaters'])} skaters")


if __name__ == "__main__":
    main()

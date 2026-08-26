"""Build the run value matrix page from the college run-value table.

Reads `master_run_values.rds` — the run value of each outcome by count, outs and
base state — and writes a single self-contained HTML page that shows it as a
diverging heatmap. Output only: no code from the app, and nothing player,
game or date level. The table carries 13 outcome categories against 8 base
states and, for balls and strikes, all 12 counts.

    python tools/build_run_values_page.py \
        --rds <run values repo>/master_run_values.rds \
        --out projects/run-value-matrix.html
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import pyreadr

# Read left to right the way a scoreboard does, not the order the file happens
# to store them in.
BASES = ["Empty", "1st", "2nd", "3rd", "1st&2nd", "1st&3rd", "2nd&3rd", "Loaded"]
COUNTS = ["0-0", "0-1", "0-2", "1-0", "1-1", "1-2", "2-0", "2-1", "2-2",
          "3-0", "3-1", "3-2", "All"]


def load(rds: Path) -> dict:
    frame = list(pyreadr.read_r(str(rds)).values())[0]
    missing = [b for b in BASES if b not in frame.columns]
    if missing:
        raise SystemExit(f"missing base states in {rds}: {missing}")

    cells = {}
    for _, row in frame.iterrows():
        cat = str(row["RunValueCat"])
        count = str(row["Count"])
        outs = int(row["Outs"])
        cells.setdefault(cat, {}).setdefault(str(outs), {})[count] = [
            None if row[b] != row[b] else round(float(row[b]), 3) for b in BASES
        ]

    values = [v for cat in cells.values() for outs in cat.values()
              for rowv in outs.values() for v in rowv if v is not None]
    cats = sorted(cells, key=lambda c: (len(cells[c]["0"]) < 2, c))
    return {
        "bases": BASES,
        "counts": COUNTS,
        "categories": cats,
        "cells": cells,
        "min": round(min(values), 3),
        "max": round(max(values), 3),
        "n": len(values),
    }


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--rds", type=Path, required=True,
                    help="master_run_values.rds from the run values repo")
    ap.add_argument("--template", type=Path,
                    default=Path("tools/run_values_template.html"))
    ap.add_argument("--out", type=Path, default=Path("projects/run-value-matrix.html"))
    args = ap.parse_args()

    payload = load(args.rds)
    html = args.template.read_text(encoding="utf-8")
    args.out.write_text(html.replace('"__DATA__"', json.dumps(payload, separators=(",", ":"))),
                        encoding="utf-8")
    print(f"{args.out}: {args.out.stat().st_size / 1024:.0f} KB, "
          f"{len(payload['categories'])} categories, {payload['n']} values, "
          f"range {payload['min']} to {payload['max']}")


if __name__ == "__main__":
    main()

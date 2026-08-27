"""Build the NFL receiver and coverage scouting page.

Reads the dashboard payload exported by the NFL_big_data_bowl_2026 repo and
folds it, the page template and the page's script into one self-contained
HTML file that needs nothing at view time.

    # in the NFL repo
    python -m nfl_scouting build
    python -m nfl_scouting export --out /tmp/nfl_dashboard.json

    # here
    python tools/build_nfl_scouting_page.py \
        --data /tmp/nfl_dashboard.json \
        --out projects/nfl-scouting.html

The payload carries every targeted pass of the season with its tracking
geometry, which is a lot of numbers; it arrives with the numeric columns
already packed as base64 typed arrays and the repeated text interned, and
this script does not unpack any of it. It only checks that the shape is
what the page expects, so a truncated or stale export fails here rather
than as a blank panel in somebody's browser.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

TOOLS = Path(__file__).resolve().parent
TEMPLATE = TOOLS / "nfl_scouting_template.html"
SCRIPT = TOOLS / "nfl_scouting_app.js"

DATA_TOKEN = "/*__DATA__*/"
SCRIPT_TOKEN = "/*__SCRIPT__*/"

# Every top-level key the page reads. Listed rather than inferred so that a
# payload built by an older version of the exporter fails loudly.
REQUIRED_KEYS = (
    "meta", "plays", "receivers", "defenders",
    "routeCoverage", "coverageType", "model", "strings",
)
REQUIRED_META = (
    "season", "weeks", "nPlays", "nGames", "nReceivers", "nDefenders",
    "completionRate", "meanSeparationThrow", "meanSeparationArrival",
    "openThreshold",
)


def validate(payload: dict) -> None:
    """Fail on a payload the page cannot draw, naming what is missing."""
    missing = [k for k in REQUIRED_KEYS if k not in payload]
    if missing:
        raise SystemExit(f"payload is missing top-level keys: {missing}")

    missing_meta = [k for k in REQUIRED_META if k not in payload["meta"]]
    if missing_meta:
        raise SystemExit(f"payload meta is missing: {missing_meta}")

    plays = payload["plays"]
    for key in ("n", "int16", "f32"):
        if key not in plays:
            raise SystemExit(f"payload plays block is missing '{key}'")
    if plays["n"] <= 0:
        raise SystemExit("payload contains no plays")

    for key in ("scores", "calibration", "importance", "baselines"):
        if key not in payload["model"]:
            raise SystemExit(f"payload model block is missing '{key}'")

    geometry = payload.get("geometry")
    if geometry is not None:
        if len(geometry["offsets"]) != plays["n"]:
            raise SystemExit(
                f"geometry has {len(geometry['offsets'])} offsets for "
                f"{plays['n']} plays")
        drawable = sum(1 for o in geometry["offsets"] if o >= 0)
        if not drawable:
            raise SystemExit("geometry is present but no play can be drawn from it")


def build(data_path: Path, out_path: Path) -> Path:
    payload = json.loads(data_path.read_text())
    validate(payload)

    template = TEMPLATE.read_text()
    script = SCRIPT.read_text()
    for token, name in ((DATA_TOKEN, "data"), (SCRIPT_TOKEN, "script")):
        if token not in template:
            raise SystemExit(f"template has no {name} placeholder ({token})")

    # The payload goes into a JSON script tag, so the only thing that can
    # break out of it is the closing tag itself.
    blob = json.dumps(payload, separators=(",", ":")).replace("</", "<\\/")

    page = template.replace(DATA_TOKEN, blob).replace(SCRIPT_TOKEN, script)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(page)
    return out_path


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--data", type=Path, required=True,
                        help="dashboard_data.json exported from the NFL repo")
    parser.add_argument("--out", type=Path,
                        default=TOOLS.parent / "projects" / "nfl-scouting.html")
    args = parser.parse_args(argv)

    if not args.data.exists():
        raise SystemExit(f"no payload at {args.data}; run the export in the NFL repo first")

    out = build(args.data, args.out)
    payload_mb = args.data.stat().st_size / 1e6
    page_mb = out.stat().st_size / 1e6
    meta = json.loads(args.data.read_text())["meta"]
    print(f"wrote {out} ({page_mb:.2f} MB page from a {payload_mb:.2f} MB payload)")
    print(f"  {meta['nPlays']:,} targets, {meta['nGames']} games, "
          f"{meta['season']} weeks {meta['weeks'][0]}-{meta['weeks'][-1]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

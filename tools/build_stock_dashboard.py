"""Build the stock forecast dashboard from the Bayesian time-series project.

Fits the project's own local-level DLM to every ticker in its bundled sample
price file and writes a single self-contained HTML page: price history with the
one-week posterior-predictive fan for whichever ticker you pick, plus the
projected top and bottom movers.

    python tools/build_stock_dashboard.py \
        --repo <stock time series repo> \
        --out projects/stock-forecast-dashboard.html

The model is the project's, imported rather than reimplemented: each horizon is
a separate call to `predict_interval` with the same seed, so day 1 through day 5
come from the same posterior draws and the band widens the way the model says
it does. Fitting a hundred tickers takes a few minutes, so the forecasts are
cached in JSON next to the output and reused unless --refit is passed.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import pandas as pd

HISTORY_DAYS = 252     # one trading year on the chart
HORIZON = 5            # trading days: one week
LEVEL = 0.95


def fit(repo: Path, horizon: int, level: float) -> dict:
    sys.path.insert(0, str(repo / "src"))
    from stockts.bayesian import predict_interval  # noqa: E402

    prices = pd.read_csv(repo / "data" / "sample_prices.csv", index_col=0, parse_dates=True)
    out = {"asOf": str(prices.index[-1].date()), "horizon": horizon, "level": level,
           "dates": [d.strftime("%Y-%m-%d") for d in prices.index[-HISTORY_DAYS:]],
           "tickers": {}}

    for n, ticker in enumerate(prices.columns, 1):
        series = prices[ticker].dropna()
        if series.size < 30 or (series <= 0).any():
            continue
        arr = series.to_numpy()
        fan = []
        for h in range(1, horizon + 1):
            # same seed every step: one posterior, propagated further each time
            pi = predict_interval(arr, horizon=h, level=level, seed=610)
            fan.append([round(pi.lower, 2), round(pi.point, 2), round(pi.upper, 2)])
        out["tickers"][ticker] = {
            "history": [round(float(v), 2) for v in arr[-HISTORY_DAYS:]],
            "fan": fan,
            "last": round(float(arr[-1]), 2),
            "ret": round(float(fan[-1][1] / arr[-1] - 1) * 100, 2),
        }
        print(f"  [{n:3d}] {ticker:6s} {out['tickers'][ticker]['ret']:+.2f}%", flush=True)
    return out


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--repo", type=Path, required=True,
                    help="the stock time-series repo (needs src/ and data/sample_prices.csv)")
    ap.add_argument("--template", type=Path, default=Path("tools/stock_dashboard_template.html"))
    ap.add_argument("--cache", type=Path, default=Path("tools/.stock_forecasts.json"))
    ap.add_argument("--out", type=Path, default=Path("projects/stock-forecast-dashboard.html"))
    ap.add_argument("--refit", action="store_true", help="ignore the cache and refit")
    args = ap.parse_args()

    if args.cache.exists() and not args.refit:
        payload = json.loads(args.cache.read_text())
        print(f"reusing {args.cache} ({len(payload['tickers'])} tickers)")
    else:
        payload = fit(args.repo, HORIZON, LEVEL)
        args.cache.write_text(json.dumps(payload, separators=(",", ":")))

    html = args.template.read_text(encoding="utf-8")
    args.out.write_text(html.replace('"__DATA__"', json.dumps(payload, separators=(",", ":"))),
                        encoding="utf-8")
    print(f"{args.out}: {args.out.stat().st_size / 1024:.0f} KB, "
          f"{len(payload['tickers'])} tickers, as of {payload['asOf']}")


if __name__ == "__main__":
    main()

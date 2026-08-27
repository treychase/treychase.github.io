"""Build the stock forecast dashboard from the Bayesian time-series project.

Fits the project's two-state Markov-switching DLM — a hidden Markov model with
a local-level DLM in each regime — to every ticker in its bundled sample price
file, and writes a single self-contained HTML page: the price history with the
fitted level over it, the regime the model thinks each period was in, and the
seven-day posterior-predictive fan, plus the projected top and bottom movers.

    python tools/build_stock_dashboard.py \
        --repo <stock time series repo> \
        --out projects/stock-forecast-dashboard.html

The model is the project's, imported rather than reimplemented: one call to
`predict_fan` per ticker returns every horizon from one day to seven out of a
single posterior, along with the fitted level and the smoothed probability of
the volatile regime at each point in the history. Fitting a hundred tickers
takes several minutes, so the results are cached in JSON next to the output and
reused unless --refit is passed.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import pandas as pd

HISTORY_DAYS = 252     # one trading year on the chart
HORIZON = 7            # trading days of forecast
LEVEL = 0.95
N_ITER, BURN_IN = 1000, 300


def fit(repo: Path, horizon: int, level: float) -> dict:
    sys.path.insert(0, str(repo / "src"))
    from stockts.hmm import predict_fan  # noqa: E402

    prices = pd.read_csv(repo / "data" / "sample_prices.csv", index_col=0, parse_dates=True)
    out = {"asOf": str(prices.index[-1].date()), "horizon": horizon, "level": level,
           "dates": [d.strftime("%Y-%m-%d") for d in prices.index[-HISTORY_DAYS:]],
           "tickers": {}}

    for n, ticker in enumerate(prices.columns, 1):
        series = prices[ticker].dropna()
        if series.size < 30 or (series <= 0).any():
            continue
        arr = series.to_numpy()
        f = predict_fan(arr, horizon=horizon, level=level,
                        n_iter=N_ITER, burn_in=BURN_IN, seed=610)
        out["tickers"][ticker] = {
            "history": [round(float(v), 2) for v in arr[-HISTORY_DAYS:]],
            # the fitted level and the regime probability are per-observation,
            # so they are windowed to the same span as the history
            "fitted": [round(v, 2) for v in f.fitted[-HISTORY_DAYS:]],
            "regime": [round(v, 3) for v in f.state_prob[-HISTORY_DAYS:]],
            "fan": [[round(lo, 2), round(pt, 2), round(up, 2)]
                    for lo, pt, up in zip(f.lower, f.point, f.upper)],
            "last": round(float(arr[-1]), 2),
            "ret": round(float(f.expected_return) * 100, 2),
            "rmse": round(f.rmse, 2),
            "pVol": round(f.p_volatile_now, 3),
            # daily sd of the level step, per regime, as a percentage
            "vol": [round(v * 100, 2) for v in f.vol_daily],
            "persist": [round(v, 3) for v in f.persistence],
            "kappa": round(f.kappa, 2),
        }
        t = out["tickers"][ticker]
        print(f"  [{n:3d}] {ticker:6s} {t['ret']:+.2f}%  "
              f"P(vol)={t['pVol']:.2f}  vol={t['vol'][0]:.2f}/{t['vol'][1]:.2f}%",
              flush=True)
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
          f"{len(payload['tickers'])} tickers, {payload['horizon']}-day horizon, "
          f"as of {payload['asOf']}")


if __name__ == "__main__":
    main()

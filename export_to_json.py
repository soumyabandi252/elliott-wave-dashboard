"""
export_to_json.py -- converts the Elliott Wave Master Workbook's DASHBOARD
sheet into docs/data.json for the web dashboard.

Usage:
    python export_to_json.py path/to/Elliott_Wave_NASDAQ_Composite_Master_Workbook.xlsx
"""
import sys
import json
import glob
import pandas as pd


def find_latest_workbook():
    candidates = glob.glob("Elliott_Wave_NASDAQ_Composite_Master_Workbook*.xlsx")
    if not candidates:
        raise FileNotFoundError("No master workbook found in current directory.")
    candidates.sort()
    return candidates[-1]


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else find_latest_workbook()
    print(f"Reading: {path}")
    df = pd.read_excel(path, sheet_name="\U0001F4CA DASHBOARD")

    records = []
    for _, row in df.iterrows():
        signal_raw = str(row.get("Signal (BUY/SELL/WAIT)", ""))
        if "CLEAN BUY" in signal_raw:
            signal = "BUY"
        elif "CLEAN SELL" in signal_raw:
            signal = "SELL"
        else:
            signal = "WAIT"

        records.append({
            "symbol": row.get("Symbol"),
            "price": float(row.get("Price ($)") or 0),
            "signal": signal,
            "degree": row.get("Elliott Degree"),
            "wave": str(row.get("Current Wave", ""))[:1],
            "latest_buy_date": row.get("Latest BUY Date (any TF)"),
            "latest_buy_tf": row.get("BUY Date Timeframe"),
            "latest_sell_date": row.get("Latest SELL Date (any TF)"),
            "latest_sell_tf": row.get("SELL Date Timeframe"),
            "fundamental": row.get("Fundamental Strength"),
        })

    with open("docs/data.json", "w") as f:
        json.dump(records, f, default=str, indent=2)

    print(f"Wrote {len(records)} tickers to docs/data.json")


if __name__ == "__main__":
    main()

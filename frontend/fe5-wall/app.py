from flask import Flask, render_template
import pandas as pd
import time
import requests
from io import StringIO

app = Flask(__name__)

GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/14hey-KIdpDL00qnID0jE9HlKzEVu7s8f2PC_rXwLxMY/gviz/tq?tqx=out:csv&gid=616528629"

@app.route("/")
def home():
    try:
        # Retry mechanism for Google Sheets loading
        for _ in range(3):  # Try up to 3 times
            try:
                response = requests.get(GOOGLE_SHEET_CSV_URL, timeout=10)
                response.raise_for_status()  # Raise error for HTTP issues
                df = pd.read_csv(StringIO(response.text), encoding="utf-8")
                break
            except Exception as e:
                print(f"Retrying due to error: {e}")
                time.sleep(3)
        else:
            raise Exception("Failed to load Google Sheet after multiple attempts")

        # Define expected columns
        expected_columns = [
            "Timestamp", "Name", "Roll Number", "Branch", "Year of Study", 
            "Message Received Date", "Message Source", "Sender Name", "Sender Contact", 
            "Message Category", "Scam Indicators", "Response Given", "Personal Data Taken", 
            "Legitimacy Score", "Additional Info", "Verification Status"
        ]

        # Rename columns if Google Sheet structure changed
        df.columns = expected_columns[:len(df.columns)]

        # Fill missing 'Verification Status' values
        if "Verification Status" in df.columns:
            df["Verification Status"] = df["Verification Status"].fillna("Under Review")

        return render_template("index.html", df=df)

    except Exception as e:
        return f"<h3>Error loading data:</h3> <p>{str(e)}</p>"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3105, debug=True)

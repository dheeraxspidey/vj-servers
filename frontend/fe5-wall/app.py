#  google_form_url = "https://docs.google.com/forms/d/e/1FAIpQLSfKSfY19CpacWTETh1Nn3A6jpByFuwsbZkF2IIWzbqIltwf5w/viewform?embedded=true"
#  GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/14hey-KIdpDL00qnID0jE9HlKzEVu7s8f2PC_rXwLxMY/gviz/tq?tqx=out:csv&gid=616528629"
from flask import Flask, render_template
import pandas as pd

app = Flask(__name__)

# Google Sheet CSV Link (Replace with actual ID)
GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/14hey-KIdpDL00qnID0jE9HlKzEVu7s8f2PC_rXwLxMY/gviz/tq?tqx=out:csv&gid=616528629"

@app.route("/")
def home():
    try:
        # Fetch Google Sheet Data
        df = pd.read_csv(GOOGLE_SHEET_CSV_URL)

        # Rename columns to match Google Sheet
        df.columns = [
            "Timestamp", "Name", "Roll Number", "Branch", "Year of Study", 
            "Message Received Date", "Message Source", "Sender Name", "Sender Contact", 
            "Message Category", "Scam Indicators", "Response Given", "Personal Data Taken", 
            "Legitimacy Score", "Additional Info", "Verification Status"
        ]

        # Ensure 'Verification Status' has no missing values
        df["Verification Status"] = df["Verification Status"].fillna("Under Review")

        return render_template("index.html", df=df)

    except Exception as e:
        return f"Error loading data: {str(e)}"


if __name__ == "__main__":
    app.run(port=3115, debug=True)

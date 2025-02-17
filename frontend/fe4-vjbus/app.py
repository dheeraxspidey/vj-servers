from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')  # Serves index.html

@app.route('/driver')
def driver():
    return render_template('driver.html')  # Serves driver.html

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000, debug=True)

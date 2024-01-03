from flask import Flask
from flask_session import Session

from chart_api import chart
from filemanager import filemanager

SESSION_TYPE = "filesystem"
PERMANENT_SESSION_LIFETIME = 1800
app = Flask(__name__)
app.config.from_object(__name__)
Session(app)

app.register_blueprint(chart, url_prefix="/chartapi")
app.register_blueprint(filemanager, url_prefix="/filemanager")

if __name__ == "__main__":
    app.secret_key = "super secret key"
    app.config["SESSION_TYPE"] = SESSION_TYPE
    app.run(debug=True)

from flask import Flask, render_template, redirect, request, url_for
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash

from datetime import datetime

FILE = 'Unknown'

app = Flask(__name__)
app.config['DEBUG'] = True

SQLALCHEMY_DATABASE_URI = "mysql+mysqlconnector://{username}:{password}@{hostname}/{databasename}".format(
    username="NickFegley",
    password="H534mzdB02e3",
    hostname="NickFegley.mysql.pythonanywhere-services.com",
    databasename="NickFegley$record",
    #databasename="NickFegley$dummyempty",
)
app.config["SQLALCHEMY_DATABASE_URI"] = SQLALCHEMY_DATABASE_URI
app.config["SQLALCHEMY_POOL_RECYCLE"] = 299
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

class Report(db.Model):
    __tablename__ = 'report'

    id = db.Column(db.Integer, primary_key=True)
    file = db.Column(db.String(128))
    message = db.Column(db.String(4096))
    posted = db.Column(db.DateTime, default=datetime.now)

def register(file):
    global FILE
    FILE = file

def log(message):
    post = Report(message=message, file=FILE)
    db.session.add(post)
    db.session.commit()
    print(message)

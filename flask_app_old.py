#!/usr/bin/python3.6
from flask import Flask, render_template, redirect, request, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_login import login_user, LoginManager, UserMixin, login_required, logout_user, current_user
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.routing import BaseConverter
#from flask_migrate import Migrate
#import report
import sys
import httplib2
import email_myself

from datetime import datetime

GET = "GET"
POST = "POST"

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
#migrate = Migrate(app, db)

app.secret_key = '0XBwz4mFuwMJ133R7QOJ'
login_manager = LoginManager()
login_manager.init_app(app)

class User(UserMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(128))
    password_hash = db.Column(db.String(128))

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def get_id(self):
        return self.username

class RegexConverter(BaseConverter):
    def __init__(self, url_map, *items):
        super(RegexConverter, self).__init__(url_map)
        self.regex = items[0]

app.url_map.converters['regex'] = RegexConverter

@login_manager.user_loader
def load_user(user_id):
    return User.query.filter_by(username=user_id).first()


class Comment(db.Model):
    __tablename__ = 'record'

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(4096))
    posted = db.Column(db.DateTime, default=datetime.now)

    commenter_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    commenter = db.relationship('User', foreign_keys=commenter_id)

@app.route('/', methods=[GET, POST])
def index():
    return redirect(url_for('bes'))
    if request.method == GET:
        return render_template("main_page.html", comments=Comment.query.all())
    if not current_user.is_authenticated:
        return redirect(url_for('index'))
    comment = Comment(content = request.form['contents'], commenter=current_user)
    db.session.add(comment)
    db.session.commit()
    return redirect(url_for('index'))

@app.route('/BES')
def bes():
    levels  =  [[('0Hw', 'K Howe'), ('0Ho', 'K Hobby'), ('0T', 'K Turgeon'), ('0W', 'K Walsh')],
                 [('1H', '1 Hamilton'), ('1D', '1 DeLuca'), ('1C', '1 Call')],
                 [('2B', '2 Butts'), ('2H', '2 Haddock'), ('2D', '2 Dalrymple')],
                 [('3B', '3 Bergeron'), ('3H', '3 Hamel'), ('3K', '3 Karpinski')],
                 [('4C', '4 Croteau'), ('4Z', '4 Zink'), ('4H', '4 Harris')],
                 [('5Hi', '5 Hillsgrove'), ('5L', '5 LaRoche'), ('5Ha', '5 Hastings')],
                 [('6B', '6 Bourque'), ('6V', '6 Vaillancourt')],
                 [('7R', '7 Reeder'), ('7T', '7 Tilden'), ('7Y', '7 York')],
                 [('8M', '8 Miller'), ('8R', '8 Rayno')]]
    return render_template('BES_level_select.html', levels=levels)

@app.route('/<regex("BES-(\w+)"):lvl>')
def example(lvl):
    if lvl.startswith('BES-'):
        num = lvl[4:]
        if num[0] == '0':
            return render_template('BES_kinderg.html')
        elif num == '1H' or num == '1D':
            return render_template('BES_first.html', num=num)
        else:
            return render_template('BES_game2.html', lvl_num=num, data_num=num)


@app.route('/upload', methods=[GET, POST])
def upload():
    if request.method == GET:
        return render_template('upload_page.html')
    if request.method == POST:
        file = request.files['file']
        return file.filename
        #return 'DONE!'

@app.route('/report', methods=[GET, POST])
def level_report():
    if request.method == POST:
        subject = request.form.get('type', 'Report') + ': ' + request.form.get('level', 'Unknown')
        body = request.form.get('name', '') + ', ' + request.form.get('class', '') + '\n\n' + request.form.get('comments', '')
        email_myself.send(subject, body)
        return redirect(url_for('bes'))
    else:
        return render_template('BES_report.html')

@app.route('/upload/xml', methods=[GET, POST])
def upload_xml():
    file = request.files['file']
    file.save('/home/NickFegley/mysite/assets/BES/levels/' + file.filename)
    return file.filename

@app.route('/log', methods=[GET])
def logger():
    return 'Nope.' #render_template('log.html', comments=report.Report.query.all())

@app.route('/login/', methods=[GET, POST])
def login():
    if request.method == GET:
        return render_template('login_page.html', error=False)

    user = load_user(request.form["username"])
    if user is None:
        return render_template("login_page.html", error=True)
    if not user.check_password(request.form['password']):
        return render_template('login_page.html', error=True)
    login_user(user)
    return redirect(url_for('index'))

@app.route("/logout/")
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))


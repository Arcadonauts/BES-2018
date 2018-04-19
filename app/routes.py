from app import app
import flask
import json
import os
from app.direct import Lvl
import email_myself
import collections

################################################################################
#                               Globals
################################################################################

GET = 'GET'
POST = 'POST'


################################################################################
#                               BES 2015
################################################################################

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
    return flask.render_template('BES_level_select.html', levels=levels)

@app.route('/BES-<lvl>')
def example(lvl):

    if lvl[0] == '0':
        return flask.render_template('BES_kinderg.html')
    elif lvl == '1H' or lvl == '1D':
        return flask.render_template('BES_first.html', num=lvl)
    else:
        return flask.render_template('BES_game2.html', lvl_num=lvl, data_num=lvl)

@app.route('/report', methods=[GET, POST])
def level_report():
    if flask.request.method == POST:
        subject = flask.request.form.get('type', 'Report') + ': ' + flask.request.form.get('level', 'Unknown')
        body = flask.request.form.get('name', '') + ', ' + flask.request.form.get('class', '') + '\n\n' + flask.request.form.get('comments', '')
        email_myself.send(subject, body)
        return flask.redirect(flask.url_for('bes'))
    else:
        return flask.render_template('BES_report.html')

################################################################################
#                               BES 2018
################################################################################

@app.route('/')
@app.route('/index')
def index():
    return flask.redirect('/editor')

@app.route('/test')
def test():
    return flask.render_template('cm.html')

def lvl_list():
    lvl = Lvl()
    dir = os.listdir(lvl.shared_levels)
    op = collections.OrderedDict()
    def name(line):
        if(line.count(' ')):
            return line[line.index(' ') + 1:].lower()
        else:
            return line
    with open(lvl.shared_levels+'/names.txt') as f:
        lines = f.readlines()
        for l in sorted(lines, key=name):
            line = l.split(' ')
            id = line[0]
            name = ' '.join(map(lambda x : x.capitalize(), line[1:]))
            if id in dir:
                op[id] = name
            else:
                print(id, dir)
    return op


def lvl_template(html, name):
    lvl = Lvl(name)
    return flask.render_template(
        html,
        lvl = name,
        static = lvl.static,
        imgs = os.listdir(lvl.dir_img),
        audios = os.listdir(lvl.dir_audio),
        img_dir = lvl.url_img,
        audio_dir = lvl.url_audio
    )

@app.route('/editor')
def editor_select():
    return flask.render_template('editor_select.html', levels=lvl_list())

@app.route('/editor/<lvl>')
def editor(lvl):
    return lvl_template('level_editor.html', lvl)

@app.route('/BES-2018/<lvl>')
def play(lvl):
    return lvl_template('BES-2018.html', lvl)

@app.route('/BES-2018-message', methods=['POST'])
def message():
    form = flask.request.form

    subject = 'Level %s report from %s' % (form['lvl'], form['name'])
    body = """From: %(name)s
Class: %(class)s
Level: %(lvl)s

Message: %(msg)s

""" % form
    try:
        email_myself.send(subject, body)
        return 'Message Sent!'
    except:
        return 'Message failed to send.'

@app.route('/codes')
def codes():
    return flask.render_template('codes.html', lvls = lvl_list())

@app.route('/create', methods=['GET', 'POST'])
def create():
    if flask.request.method == 'GET':
        return flask.render_template('create.html')
    if flask.request.method == 'POST':
        lvl = Lvl(flask.request.form['id'])
        name = flask.request.form['lvl']

        if os.path.exists(lvl.dir_level):
            return 'Level already exits!'
        else:
            os.makedirs(lvl.dir_level)
            os.makedirs(lvl.dir_img)
            os.makedirs(lvl.dir_audio)
            open(lvl.dir_script, 'a').close()
            open(lvl.dir_data, 'a').close()
            with open(lvl.shared_levels + '/names.txt', 'a') as f:
                f.write('\n%s %s'%(lvl.lvl, name))

            return 'Succesfully created new level: ' + lvl.lvl

@app.route('/upload', methods=['GET', 'POST'])
def upload():
    if flask.request.method == 'GET':
        levels = lvl_list()
        return flask.render_template('upload.html', levels=levels)
    if flask.request.method == 'POST':
        file = flask.request.files['file']
        type = flask.request.form['type']
        lvl = Lvl(flask.request.form['lvl'])

        if type == 'image':
            fn = lvl.dir_img + file.filename
        elif type == 'audio':
            fn = lvl.dir_audio + file.filename
        file.save(fn)

        return '%s succesfully uploaded to the %s folder for level %s' % (file.filename, type, lvl.lvl)

@app.route('/json-handler/<path:path>', methods=['GET', 'POST'])
def json_handler(path):
    lvl = Lvl(path)

    if flask.request.method == 'GET':
        with open(lvl.dir_data, 'r') as f:
            string = f.read()
        return string

    else:
        response = flask.request.get_json()
        string = json.dumps(response)
        with open(lvl.dir_data, 'w') as f:
            f.write(string)
        return 'ok!'

@app.route('/script-handler/<path:path>', methods=['GET', 'POST'])
def script_handler(path):
    lvl = Lvl(path)
    if flask.request.method == 'GET':
        try:
            with open(lvl.dir_script, 'r') as f:
                string = f.read()
        except IOError:
            string = ""
        return string
    else:
        response = flask.request.get_json()
        with open(lvl.dir_script, 'w') as f:
            f.write(response.get('code', ''))
        return 'ok!'

@app.route('/notes-handler/<path:path>', methods=['GET', 'POST'])
def notes_handler(path):
    lvl = Lvl(path)
    if flask.request.method == 'GET':
        try:
            with open(lvl.dir_notes, 'r') as f:
                string = f.read()
        except IOError:
            string = ""
        return string
    else:
        response = flask.request.get_json()
        with open(lvl.dir_notes, 'w') as f:
            f.write(response.get('code', ''))
        return 'ok!'


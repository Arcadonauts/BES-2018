from __future__ import print_function, division
import sqlite3, datetime, random
import os, random

#from os import path
#ROOT = path.dirname(path.realpath(__file__))
#...
#db = sqlite3.connect(path.join(ROOT, "database.db"))

################################################################################
#                        CONSTANTS
FILENAME = "omino_data.db"
ROOT = os.path.dirname(os.path.realpath(__file__))

PLAYER = "player"
PASSWORD = 'password'
PRIVATE = 'private'
ACTION = 'action'
GAME = 'game'
MOVE = 'move'
GAP = 'gap'
GAME_ID = 'game_id'
CANCEL = 'cancel'

DEFAULT_RANK = 100


################################################################################
#                       TABLES
table_defs = [
"""CREATE TABLE players (
    name string,
    date integer,
    pw string,
    rank integer
  )""",

"""CREATE TABLE games (
    p1 integer,
    p2 integer,
    h1 integer,
    h2 integer,
    status integer,
    start integer,
    end integer
  )""",

"""CREATE TABLE moves (
    game integer,
    turn integer,
    code integer,
    date integer
  )""",

"""CREATE TABLE searchers (
    player integer,
    gap integer,
    game integer,
    date integer
  )"""
]


################################################################################
def do(command, args=None, fetch=None):
    conn = sqlite3.connect(os.path.join(ROOT, FILENAME))
    c = conn.cursor()

    if args:
        c.execute(command, args)
    else:
        c.execute(command)

    if fetch == 'all':
        result = c.fetchall()
    elif fetch == None:
        result = None
    elif fetch == 1:
        result = c.fetchone()
    elif fetch == 'rowid':
        result = c.lastrowid
    else:
        result = c.fetchmany(fetch)

    conn.commit()
    conn.close()
    return result


def parse(data):
    pairs = data.split('.')
    tups = []
    for p in pairs:
        if '-' in p:
            tups.append(p.split('-'))
        else:
            print('Warning: Incorrectly formatted data.')
    return {a: b for a,b in tups}

def now():
    return int((datetime.datetime.now() - datetime.datetime(1970, 1, 1)).total_seconds())

def deal_hands():
    a = list(range(70))
    random.shuffle(a)

    i1 = sum([x*70**i for i,x in enumerate(a[:5])])
    i2 = sum([x*70**i for i,x in enumerate(a[5:10])])

    return i1, i2

def add_player(playername, password):
    do("INSERT INTO players VALUES (:name, :date, :pw, :rank)", {
        'name': playername.lower(),
        'date': now(),
        'pw': password,
        'rank': DEFAULT_RANK
    })

def get_player(playername):
    p = do("SELECT rowid FROM players WHERE name = :name LIMIT 1", {
        'name': playername.lower()
    }, 1)
    if type(p) is tuple and len(p):
        return p[0]
    else:
        return None

def new_game(player_id, gap=PRIVATE, id=None, cancel=None):
    if gap == PRIVATE: # Q1y
        return None
    else: # Q1n
        # Find player searcher
        searcher = do("""SELECT game, rowid FROM searchers WHERE player = :pid LIMIT 1""",{
            'pid': player_id
        }, 1)
        if searcher: # Q2n
            game, rowid = searcher
            if game: # Q3y
                # Delete player searcher
                do("""DELETE FROM searchers WHERE rowid = :rowid""", {"rowid": rowid})
                p1, p2, h1, h2 = do("""SELECT p1, p2, h1, h2 FROM games WHERE rowid = :game LIMIT 1""", {
                    'game': game
                }, 1)
                return game, int(p1), int(p2), h1, h2
            else: # Q3n
                do("""UPDATE searchers SET gap=:gap WHERE rowid = :rowid""", {
                    "gap": gap,
                    'rowid': rowid
                })
        else: # Q2y
            # Create searcher
            rowid = do("""INSERT INTO searchers VALUES (:player, :gap, :game, :date)""", {
                'player': player_id,
                'gap': gap,
                'game': 0,
                'date': now()
            }, 'rowid')


        #Search through Searchers
        player_rank = do("SELECT rank FROM players WHERE rowid=:player LIMIT 1", {
            'player': player_id
        }, 1)[0]
        opp = do("""SELECT player, searchers.rowid FROM searchers JOIN players WHERE (
                    players.rowid = searchers.player AND
                    players.rowid <> :player AND
                    players.rank > :rank - :gap AND
                    players.rank < :rank + :gap AND
                    :rank > players.rank - searchers.gap AND
                    :rank < players.rank + searchers.gap)
                    ORDER BY searchers.date LIMIT 1""", {
            "player": player_id,
            'rank': player_rank,
            'gap': gap
        }, 1)

        if opp:# Q4y
            # Delete my searcher
            do("""DELETE FROM searchers WHERE rowid = :rowid""", {"rowid": rowid})
            # Create Game
            p1, p2 = player_id, opp[0]
            if str(p1) == '1': #random.randrange(2): # Coin Flip! Who goes first?
                p1, p2 = p2, p1
            h1, h2 = deal_hands()
            game_id = do("""INSERT INTO games VALUES (:p1, :p2, :h1, :h2, :status, :start, :end)""", {
                'p1': p1,
                'p2': p2,
                'h1': h1,
                'h2': h2,
                'status': 1, # Player 1 Always Goes First
                'start': now(),
                'end': 0
            }, 'rowid')
            # Update Opponent Searcher
            do("""UPDATE searchers SET game = :game WHERE rowid = :rowid""", {
                'game': game_id,
                'rowid': opp[1]
            })
            return game_id, int(p1), int(p2), h1, h2
        else: # Q4n
            return None

def get_last_move(game):
    last = do("""SELECT turn, code FROM moves WHERE game = :game AND
                turn = (SELECT max(turn) FROM moves WHERE game = :game)""",
                {'game': game}, 1)
    return last

def make_move(game, code):
    last = get_last_move(game) or (0, 0)
    if last:
        turn = last[0]+1
        do("""INSERT INTO moves VALUES (:game, :turn, :code, :date)""",
            {'game': game, 'turn': turn, 'code': code, 'date': now()})
        return str(turn)

def validate(game):
    return 5

def get(d):
    print(os.path.dirname(os.path.realpath(__file__)))
    msg = 'ok'
    data = parse(d)
    action = data.get(ACTION)
    if action == 'test':
        msg = get_last_move(5)
    elif action == 'new_game':
        msg = new_game(data.get(PLAYER),
                       data.get(GAP, 10),
                       data.get(GAME_ID, None),
                       data.get(CANCEL, False)
                       )
    elif action == 'game_over':
        game = data.get(GAME)
        status = validate(game)

        do("UPDATE games SET status = :status, end = :time WHERE rowid = :game", {
            'status': status,
            'time': now(),
            'game': game
        })
    elif action == 'count':
        msg = (do('SELECT count(*) FROM ' + data.get('what', 'players'), {}, 1))[0]

    elif action == 'show':
        msg = (do('SELECT rowid, * FROM ' + data.get('what', 'players'), {}, 'all'))
    elif action == 'drop':
        what = data.get('what', 'games')
        if what == 'all':
            for what in ['games', 'players', 'searchers', 'moves']:
                msg = (do('DROP TABLE ' + what, {}, 'all'))
        else:
            msg = (do('DROP TABLE ' + what, {}, 'all'))
    elif action == 'create':
        main()
        populate()
        msg = 'Create and Populate'
    elif action == 'get_player':
        if PLAYER in data:
            msg = get_player(data[PLAYER])
    elif action == 'get_last_move':
        last = get_last_move(data[GAME])
        if last:
            msg = 'turn-%s.code-%s' % last
        else:
            msg = None
    elif action == 'set_move':
        msg = make_move(data.get(GAME), data.get(MOVE))
    elif action == 'new_player':
        if PLAYER in data and PASSWORD in data:
            if get_player(data[PLAYER]):
                msg = 'USERNAME CONFLICT'
            else:
                add_player(data[PLAYER], data[PASSWORD])
    elif action == None:
        msg = 'No Action'
    else:
        msg = 'Unknown Action'
    print("Response: ", msg)
    return msg

def init(conn):
    c = conn.cursor()
    def safe(string):
        try:
            c.execute(string)
            print("Created Table.", string)
        except sqlite3.OperationalError:
            pass

    for t in table_defs:
        safe(t)


def main():
    conn = sqlite3.connect(os.path.join(ROOT, FILENAME))
    init(conn)
    conn.commit()
    conn.close()

def populate():
    get("action-new_player.player-Nick.password-Nope")
    get("action-new_player.player-Sam.password-Nope")
    get("action-new_player.player-Tim.password-Nope")
    get("action-new_player.player-Bro.password-Nope")

if __name__ == '__main__':
    #main()
    #populate()
    #print(do('SELECT count(*) FROM players', {}, 1))


    #print(get('action-test'))
    print(do("SELECT * FROM games", {}, 'all'))
    #print(get('action-get_player.player-Tim'))

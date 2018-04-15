class Lvl(object):
    map = {
        "dir" : '/home/NickFegley/mysite/app/assets/BES-2018',

        "img" : '/levels/%s/img/',
        "audio" : '/levels/%s/audio/',
        "level" : '/levels/%s/',

        "data" : '/levels/%s/data.json',
        "script" : '/levels/%s/lvl.js',

        "url" : '/static/BES-2018'
    }
    def __init__(self, lvl=None):
        self._lvl = lvl

    @property
    def lvl(self):
        return self._lvl

    def __getattr__(self, name):

        if name == 'static':
            return self.map['url']

        if name.startswith('shared_'):
            return self.map['dir'] + '/' + name[7:]

        if name.startswith('dir_'):
            return self.map['dir'] + self.map[name[4:]] % self._lvl

        if name.startswith('url_'):
            return self.map['url'] + self.map[name[4:]] % self._lvl

##        if name == 'script':
##            return self.map['url'] + self.map['level'] % self._lvl + 'lvl.js'
##
##        if name == 'data':
##            return self.map['url'] + self.map['level'] % self._lvl + 'data.json'

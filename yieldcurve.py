import report
import credentials
import requests
import xml.etree.ElementTree as ET
import re, datetime
from twitter import Twitter, OAuth
from PIL import Image, ImageDraw, ImageFont
import os

report.register(__file__)

#-----------------------
LIVE = False
#----------------------

URL = 'http://data.treasury.gov/feed.svc/DailyTreasuryYieldCurveRateData?$filter=year(NEW_DATE)%20eq%20'+str(datetime.date.today().year)

BC = r"BC_(\d+)(MONTH|YEAR)$"
NEW_DATE = r'NEW_DATE'
DATE = '(\d+)-(\d+)-(\d+)'

WHITE = (255, 241, 232)
BLUE = (29, 43, 83)
GREY = (95, 87, 79)
BLACK = (0, 0, 0)

FONT_NAME = '/home/NickFegley/mysite/assets/LinLibertine_RB_G.ttf'
FONT = ImageFont.truetype(FONT_NAME, 32)
FONT_BIG = ImageFont.truetype(FONT_NAME, 40)
FONT_SMALL = ImageFont.truetype(FONT_NAME, 16)


MONTHS = [None,
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
]
if False:
    page = requests.get(URL).content
    tree = ET.parse(page)
    root = tree.getroot()
else:
    string = requests.get(URL).content
    root = ET.fromstring(string)

def scale(x, x0, x1, y0, y1):
    m = (y1 - y0)/(x1 - x0)
    b = y0 - m*x0
    return m*x + b

def get_data(root):
    data = {}
    for entry in root:
        for child in entry:
            if child.tag.endswith('content'):
                for prop in child:
                    for d in prop:
                        label = re.findall(BC, d.tag)
                        if label:
                            num, scale = label[0]
                            num = int(num)
                            if scale == 'YEAR':
                                num = num*12
                            try:
                                data[date][num] = float(d.text)
                                if float(d.text) == 0.0:
                                    #console.log(date, num, d.text, float(d.text))
                                    pass
                            except TypeError as e:
                                #console.log(e, date, num, d.text)
                                pass
                        else:
                            label = re.findall(NEW_DATE, d.tag)
                            if label:
                                year, month, day = re.findall(DATE, d.text)[0]
                                date = datetime.date(int(year), int(month), int(day))
                                data[date] = {}
    return data

def tweet(message, img=None, fn='image'):
    oauth = credentials.yieldcurve
    t = Twitter(auth=oauth)

    if img:
        fn += '.png'
        img.save(fn, 'PNG')
        with open(fn, 'rb') as imagefile:
            imgdata = imagefile.read()
        t_upload = Twitter(domain='upload.twitter.com', auth = oauth)
        img_id = t_upload.media.upload(media=imgdata)['media_id_string']
        t.statuses.update(status=message, media_ids=img_id)



    else:
        t.statuses.update(status=message)

def graph(date=None, data=None, max_rate = None):
    if date == None:
        date = datetime.date.today()
    if data == None:
        data = get_data(root)
    points = data.get(date)
    if not points:
        report.log('Not today!')
        return None

    report.log(date)

    width = height = 800
    buff = 50
    img = Image.new('RGBA', (width, height), color=WHITE)

    draw = ImageDraw.Draw(img)

    points = sorted(zip(points.keys(), points.values()), key=lambda x : x[0])

    max_y = 0
    if max_rate:
        min_y = max_rate
    else:
        min_y = int(max(points, key=lambda x : x[1])[1] + 2)


    min_x = 0
    max_x = 360

    xscale = lambda x : scale(x, min_x, max_x, 2*buff, width - buff)
    yscale = lambda x : scale(x, min_y, max_y, 2*buff, height - 2*buff)

    draw.line((xscale(0), yscale(min_y), xscale(0), yscale(max_y)), fill=BLUE)
    draw.line((xscale(0), yscale(0), xscale(max_x), yscale(0)), fill=BLUE)

    # Vertical Lines
    for i in range(5, 31, 5):
        x = xscale(12*i)
        text = str(i)
        size = draw.textsize(text, font=FONT)
        draw.text((x - size[0]/2, yscale(0)), text, fill=GREY, font=FONT)
        draw.line((x, yscale(min_y), x, yscale(0)), fill=GREY)

    # Horizantal Lines
    for i in range(1, min_y+1):
        y = yscale(i)
        draw.text((buff, y), str(i) + '%', fill=GREY, font=FONT)
        draw.line((xscale(0), y, xscale(max_x), y), fill=GREY)

    #console.log( date.day )
    # Title
    title = 'Yield Curve for %s %s, %s' % (MONTHS[date.month], int(date.day), date.year)
    draw.text((int(width - draw.textsize(title, font=FONT_BIG)[0])/2, .5*buff), title, font=FONT_BIG, fill=BLACK)

    # Axis Labels
    draw.text((int(width - draw.textsize('Years', font=FONT)[0])/2, height-buff), 'Years', font=FONT, fill=BLACK)

    rate_label_text = 'Interest Rate'
    lw, lh = draw.textsize(rate_label_text, font=FONT)
    rate_label = Image.new('RGBA', (lw, lh), color=WHITE)
    rate_label_draw = ImageDraw.Draw(rate_label)
    rate_label_draw.text((0, 0), rate_label_text, font=FONT, fill=BLACK)
    img.paste(rate_label.rotate(90, expand=True), (0, int((height - lw)/2)))

    r = 5
    x1 = y1 = None
    for x0, y0 in points:
        x = xscale(x0)
        y = yscale(y0)
        if x1 is not None:
            draw.line((x, y, x1, y1), fill=BLUE)
        draw.ellipse((x-r, y-r, x+r, y+r), fill=BLUE)
        x1 = x
        y1 = y


    return img

def do_the_thing():
    date = datetime.date.today()
    fn = '/home/NickFegley/mysite/assets/yc/'+str(date)
    if os.path.isfile(fn  + '.png'):
        report.log("What's done is done.")
        return
    else:
        img = graph(date)
        if img:
            msg = "This is the #YieldCurve for %s. Source: https://www.treasury.gov/resource-center/data-chart-center/interest-rates/Pages/TextView.aspx?data=yield" % date
            tweet(msg, img=img, fn=fn)
            #report.log(msg)

if __name__ == '__main__':
    print(os.getcwd())
    #report.log('Do the thing!')
    #do_the_thing()

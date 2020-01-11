import numpy
from PIL import Image, ImageDraw
import os
import double_size

def get_bottom_right(img, x0, y0):
    tl = img.getpixel((x0, y0))
    x, y = x0, y0
    while img.getpixel((x, y)) == tl:
        x += 1
    while img.getpixel((x-1, y)) == tl:
        y += 1

    return x, y

def get_data(img):
    card_w, card_h = get_bottom_right(img, 0, 0)
    color_w, color_h = get_bottom_right(img, 1, 1)

    c = c0 = img.getpixel((color_w, color_h))
    color_count = 0
    i = 1
    while c[3] > 0:
        i += 1
        c = img.getpixel((color_w + i, color_h))
        if c != c0:
            color_count += 1
            c0 = c

    colors = []
    i = 0

    def xy(i):
        return (int(1.5*color_w + color_w * (i % color_count)),
                int(1.5*color_h + color_h * (i // color_count)))

    p = xy(i)
    c = img.getpixel(p)
    while c[3] > 0:
        colors.append(c)
        i += 1
        p = xy(i)
        c = img.getpixel(p)

    return {
        'card_size': (card_w, card_h),
        'colors': colors[color_count:],
        'basis': colors[:color_count],
        'color_count': color_count,
    }


def round(c, b1, b2):
    u = numpy.array(b1[:3])
    v = numpy.array(b2[:3])
    w = numpy.array(c[:3])
    alpha = (b1[3] + b2[3]) // 2

    n = numpy.cross(u, v)
    sln = numpy.linalg.solve(numpy.array([n, u, v]).T, w)
    t = -sln[0]

    return tuple(t*n + w) + (alpha,)


def decompose(p, b1, b2):
    return tuple(numpy.linalg.solve(numpy.array((b1[:2], b2[:2])).T, numpy.array(p[:2])))


def projection(p, b1, b2):
    pp = round(p, b1, b2)
    k = decompose(pp, b1, b2)
    if abs(k[0]) > 255 or abs(k[1]) > 255:
        print(k)
    return k


def get_base(img, data):
    op = []
    cw, ch = data['card_size']
    for i in range(cw):
        op.append([])
        for j in range(ch):
            c = img.getpixel((cw + i, j))
            #op[i].append(round(c, data['basis'][0], data['basis'][1]))
            op[i].append(projection(c, data['basis'][0], data['basis'][1]) + (c[3],))

    return op


def draw_card(img, i, base, data):
    draw = ImageDraw.Draw(img, 'RGBA')
    w, h = data['card_size']
    cols = img.size[0] // w
    j = i + 2
    x0 = w * (j % cols)
    y0 = h * (j // cols)
    cc = data['color_count']
    if cc != 2:
        raise Exception('Only supports 2 color palettes')

    colors = list(map(lambda x: numpy.array(x[:3]), data['colors'][cc*i: cc*(i+1)]))

    for x, row in enumerate(base):
        for y, (k1, k2, a) in enumerate(row):
            draw.point((x0 + x, y0 + y), fill=tuple(map(int, (k1*colors[0] + k2*colors[1]))) + (a,))
        # for y, c in enumerate(row):
        #     draw.point((x0 + x, y0 + y), fill=tuple(map(int, c)))

    del draw


def do_the_old_thing():
    cd = os.getcwd()
    fn = cd + '/images/cards.png'
    img = Image.open(fn)
    #draw = ImageDraw.Draw(img, 'RGBA')

    data = get_data(img)
    base = get_base(img, data)

    for i in range(len(data['colors']) // data['color_count']):
        draw_card(img, i, base, data)

    img.save(cd + '/images/cards.png', 'PNG')

    return


def closest(color, colors, p=lambda *x: None):
    if color[3] == 0:
        return (0, 0, 0, 0)
    else:
        min_d = None
        min_c = None
        for c in colors:
            d = sum(((a - b)**2 for a, b in zip(c, color)))
            p(color, c, d)
            if min_d is None or d < min_d:
                min_d = d
                min_c = c
        return min_c


def copy(img, base, x0, y0, base_colors):
    new_colors = []
    #print(base_colors)
    draw = ImageDraw.Draw(img)
    for i in range(x0, x0+base['w']):
        for j in range(y0, y0+base['h']):
            c1 = clean(img.getpixel((i,j)))
            if c1 not in new_colors:
                new_colors.append(c1)
    bc = sorted(base_colors, key = lambda c : sum(c))
    nc = sorted(new_colors, key = lambda c: sum(c))
    palette = dict(zip(bc, nc))
    #print(palette)
    for i in range(base['w']):
        for j in range(base['h']):
            c = base[i,j]
            draw.point((x0 + i, y0 + j), fill=clean(palette[c]))

    del draw


def clean(c):
    return c if c[3] else (0,0,0,0)



def do_the_thing():
    cd = os.getcwd()
    fn = cd + '/images/pix_cards.png'
    img = Image.open(fn)

    base = {
        'w': 64,
        'h': 90,
        'cols': 4,
    }
    base_colors = []
    for i in range(base['w']):
        for j in range(base['h']):
            color = clean(img.getpixel((i, j)))
            base[i, j] = color
            if color not in base_colors:
                base_colors.append(color)

    for i in [1, 2, 3, 6, 7]:
        copy(img, base,
             base['w']*(i % base['cols']),
             base['h']*(i // base['cols']),
             base_colors
             )

    img.save(fn, 'PNG')
    double_size.double('pix_cards.png')


if __name__ == '__main__':
    do_the_thing()


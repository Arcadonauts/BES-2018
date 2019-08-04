from PIL import Image, ImageDraw, ImageColor
import random 


class V3:
    def __init__(self, x, y=None, z=None):
        if y == z == None:
            self.x = x[0]
            self.y = x[1]
            self.z = x[2]
        else:
            self.x = x
            self.y = y
            self.z = z
    def __sub__(self, other):
        return V3(self.x - other.x, self.y - other.y, self.z - other.z)
    def __add__(self, other):
        return V3(self.x + other.x, self.y + other.y, self.z + other.z)
    def __rmul__(self, other):
        return V3(other*self.x, other*self.y, other*self.z)
    def __abs__(self):
        return (self.x**2 + self.y**2 + self.z**2)**(.5)
    def tuple(self, m=None):
        if m:
            return tuple(map(m, (self.x, self.y, self.z)))
        else:
            return (self.x, self.y, self.z)

        
colors = list(map(ImageColor.getrgb, ['#76428a', '#cbdbfc', '#fbf236', '#222034',
                                      '#3f3f74', '#5b6ee1', '#639bff', '#d77bba']))

#colors = list(map(ImageColor.getrgb, ['#595652', '#696a6a', '#9badb7', '#cbdbfc']))
fn = 'boston.png'
pwr = 'c'
img = Image.open(fn)

draw = ImageDraw.Draw(img)

def dist(a, b):
    return ((a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2)**.5

def closest(c):
    cl = colors[0]
    for color in colors:
        if dist(cl, c) > dist(color, c):
            cl = color
    return cl

def weighted(c, pwr=5):
    dists = map(lambda x : dist(x, c), colors)
    weights = map(lambda x : 1/x**pwr, dists)

    return random.choices(colors, weights)[0]
    
def merge(c):
    c1 = closest(c)
    c2 = weighted(c)
    return random.choice([c1, c2]) 

def floyd(img, draw):
    for x in range(img.width):
        for y in range(img.height):
            oldpixel = img.getpixel((x,y))
            newpixel = closest(oldpixel)
            draw.point((x,y), newpixel)
            error = V3(oldpixel) - V3(newpixel)
            
            if x + 1 < img.width:
                draw.point((x+1, y  ), (V3(img.getpixel((x+1,y  ))) + (7/16)*error).tuple(int))
            if y + 1 < img.height:
                draw.point((x  , y+1), (V3(img.getpixel((x  ,y+1))) + (5/16)*error).tuple(int))
                if x - 1 >= 0:
                    draw.point((x-1, y+1), (V3(img.getpixel((x-1,y+1))) + (3/16)*error).tuple(int))
                if x + 1 < img.width:
                    draw.point((x+1, y+1), (V3(img.getpixel((x+1,y+1))) + (1/16)*error).tuple(int))
            
    

for i in range(img.width):
    for j in range(img.height):
        c = img.getpixel((i, j))
        cl = closest(c)
        draw.point((i,j), cl)

#floyd(img, draw)

del draw
img.save('pix%s_%s' % (pwr, fn), 'PNG')


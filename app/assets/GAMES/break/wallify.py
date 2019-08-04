from PIL import Image

img = Image.open('wall data.png', 'r')
TW = 24

pix = img.load()

rows = int(img.height/TW)
cols = int(img.width/TW)

walls_data = {}
for i in range(cols):
    for j in range(rows):
        x0 = TW*i
        y0 = TW*j
        n = i + j*cols

        minx = miny = TW
        maxx = maxy = -1
        found = False 
        for x in range(TW):
            for y in range(TW):
                alpha = pix[x0+x,y0+y][3]
                if alpha > 100:
                    found = True 
                    minx = min(x, minx)
                    miny = min(y, miny)
                    maxx = max(x, maxx)
                    maxy = max(y, maxy)
        if found:
            walls_data[n] = {
                'x': minx,
                'y': miny,
                'width': maxx - minx + 1,
                'height': maxy - miny + 1
            }
                        


with open('walls.js', 'w') as f:
    f.write('walls_data = ' + str(walls_data))

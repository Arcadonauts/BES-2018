from PIL import Image
import os

cd = os.getcwd()
sub = '/images/'


def double(fn):
    img = Image.open(cd + sub + fn)
    w, h = img.size
    img2 = img.resize((2 * w, 2 * h), Image.NEAREST)

    img2.save(cd + sub + '2x_' + fn[4:])


def triple(fn):
    img = Image.open(cd + sub + fn)
    w, h = img.size
    img2 = img.resize((3 * w, 3 * h), Image.NEAREST)

    img2.save(cd + sub + '3x_' + fn[4:])


def main():
    imgs = os.listdir(cd + sub)

    for fn in imgs:
        if fn.startswith('pix_'):
            double(fn)
            triple(fn)


if __name__ == '__main__':
    main()

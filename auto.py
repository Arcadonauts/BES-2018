#!/usr/bin/python3.6
import yieldcurve, tweemail
import sys

exception = None
def do_the_thing(module):
    global exception
    try:
        module.do_the_thing()
    except Exception as e:
        exception = e

do_the_thing(tweemail)
do_the_thing(yieldcurve)

print(sys.version)

if exception:
    raise exception


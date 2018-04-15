from twitter import OAuth
from oauth2client.file import Storage


yieldcurve = OAuth(
    token = "952297957788971008-kecr8AFjWcsTPMoXfsmmbnp7gbldcX2",
    token_secret = "GMEDO1ZJEbPuI2LWSd1b7Kk95NymnreYQ6xrR7KdT7yXB",
    #owner = "DailyYieldCurve",
    #owner_id = "952297957788971008",
    consumer_key = "DOWlrAasc9EE55AdBu273lqOu",
    consumer_secret = "vw7LdB54TghtBLHNjS7E7GEUz7I05zhIQonOvnpSocMvmRKvtY"
    )

tweemail = OAuth(
    token = "959943269743554560-Yfvjnh9VyExbApCajMBfA2YMBADPb1h",
    token_secret = "CyQRXxj4NWoJQawxKceUYmK3bXsvA9wGMYF55R7WS4tEU",
    #owner = "DailyYieldCurve",
    #owner_id = "952297957788971008",
    consumer_key = "Zv1xXykj2ERarXluzWBQxhnWc",
    consumer_secret = "RyRjeq4gXc0Ab3Ir6t03korCv6CPUw1TfF8n7qxcbV67ZjGjDI"

)
x = 'C:\\Users\\Nick\\Documents\\GitHub\\BES-2018\\credentials.py'
if __file__ == x or x+'c':
    home = 'C:/Users/Nick/Documents/GitHub/BES-2018/'
else:
    print (__file__)
    print (x)
    print (''.join([a if a == b else '|%s%s|'%(a,b) for a in x for b in __file__]))
    home = '/home/NickFegley/mysite/'

fegleyapi = Storage(home + 'tweetmail.json').get()
if not fegleyapi: # If at first you don't succeed...
    fegleyapi = Storage(home + 'tweetmail.json').get()
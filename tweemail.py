import credentials
from twitter import Twitter

from apiclient import discovery, errors
from oauth2client import client
from oauth2client import tools
from oauth2client.file import Storage

import os, httplib2, base64, email


SCOPES = 'https://mail.google.com/'
CLIENT_SECRET_FILE = 'tweetmail_secret.json'
APPLICATION_NAME = 'Tweetmail'

try:
    import argparse
    flags = argparse.ArgumentParser(parents=[tools.argparser]).parse_args()
except ImportError:
    flags = None

def ListMessagesMatchingQuery(service, user_id, query=''):
    """List all Messages of the user's mailbox matching the query.

    Args:
    service: Authorized Gmail API service instance.
    user_id: User's email address. The special value "me"
    can be used to indicate the authenticated user.
    query: String used to filter messages returned.
    Eg.- 'from:user@some_domain.com' for Messages from a particular sender.

    Returns:
    List of Messages that match the criteria of the query. Note that the
    returned list contains Message IDs, you must use get with the
    appropriate ID to get the details of a Message.
    """
    try:
        response = service.users().messages().list(userId=user_id,
                                                   q=query).execute()
        messages = []
        if 'messages' in response:
          messages.extend(response['messages'])

        while 'nextPageToken' in response:
          page_token = response['nextPageToken']
          response = service.users().messages().list(userId=user_id, q=query,
                                             pageToken=page_token).execute()
          messages.extend(response['messages'])

        return messages
    except Exception as e:
        print ('ListMessagesMatchingQuery: An error occurred: %s' % e)

def GetMimeMessage(service, user_id, msg_id):
    message = service.users().messages().get(userId=user_id, id=msg_id,
                                             format='raw').execute()
    #print( message )
    msg_bytes = (base64.urlsafe_b64decode(message['raw'].encode('ASCII')))

    mime_msg = email.message_from_bytes(msg_bytes)
    #print(mime_msg)
    return mime_msg


def mark_unread(id):
    #if True: return
    creds = credentials.fegleyapi
    http = creds.authorize(httplib2.Http())
    service = discovery.build('gmail', 'v1', http=http)

    thread = service.users().messages().modify(
            userId='me',
            id=id,
            body={'removeLabelIds': ['UNREAD'], 'addLabelIds': []}
        ).execute()

def get_new_messages(q):
    cred = credentials.fegleyapi
    http = cred.authorize(httplib2.Http())
    service = discovery.build('gmail', 'v1', http=http)

    messages = ListMessagesMatchingQuery(service, 'me', q)
    op = []
    for message in messages:
        msg_id = message['id']
        mark_unread(msg_id)
        msg = GetMimeMessage(service, 'me', msg_id)
        if msg.is_multipart():
            op += [m.get_payload() for m in msg.get_payload()],
        else:
            op += [ msg.get_payload()],
    return op

def tweet(message, img=None, fn='image'):
    oauth = credentials.tweemail
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

def do_the_thing():
    messages = get_new_messages('subject:tweet is:unread')
    print(messages)
    for msg in messages:
        if msg:
            tweet(msg[0])

#print(get_new_messages('subject:tweet is:unread'))

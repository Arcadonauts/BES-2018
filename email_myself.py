
"""Send an email message from the user's account.
"""
#!/usr/bin/python2.7
from email.mime.text import MIMEText
import httplib2
import base64

from apiclient import discovery
import credentials


def SendMessage(service, user_id, message):
    """Send an email message.

    Args:
    service: Authorized Gmail API service instance.
    user_id: User's email address. The special value "me"
    can be used to indicate the authenticated user.
    message: Message to be sent.

    Returns:
    Sent Message.
    """

    message = (service.users().messages().send(userId=user_id, body=message)
               .execute())
    print('Message Id: %s' % message['id'])
    return message



def CreateMessage(sender, to, subject, message_text):
  """Create a message for an email.

  Args:
    sender: Email address of the sender.
    to: Email address of the receiver.
    subject: The subject of the email message.
    message_text: The text of the email message.

  Returns:
    An object containing a base64url encoded email object.
  """
  message = MIMEText(message_text)
  message['to'] = to
  message['from'] = sender
  message['subject'] = subject
  string = message.as_string()
  bts = string.encode('ascii')
  raw = base64.urlsafe_b64encode(bts)
  return {'raw': raw.decode()}



def send(subject, message):
    print('Email: %s'%subject)
    creds = credentials.fegleyapi
    http = creds.authorize(httplib2.Http())
    service = discovery.build('gmail', 'v1', http=http)

    user_id = 'me'

    msg = CreateMessage('fegleyapi@gmail.edu', 'fegleynick@gmail.com', subject, message)
    SendMessage(service, user_id, msg)

if __name__ == '__main__':
    pass
    #send('Test4', "It's still working!")
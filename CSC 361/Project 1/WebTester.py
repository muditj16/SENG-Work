import sys
import re
import socket
import ssl


socket.setdefaulttimeout(10)


if len(sys.argv) != 2:      #get URI
    print('INVALID INPUT: python3 WebTester.py <URI>')
    exit()


uri= sys.argv[1]
if '/' in uri:
    hname, path = uri.split('/', 1)
    path = '/' + path
else:
    hname = uri
    path = '/'


# CHECK FOR H2
context= ssl.create_default_context()
context.set_alpn_protocols(["h2"])


s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s = context.wrap_socket(s, server_hostname=hname)

try:
    s.connect((hname, 443))
    https = True        #if connects, HTTPS is true

    if s.selected_alpn_protocol() == 'h2':
        h2 = True
    else:
        h2 = False

    s.close()

except Exception as e:
    https = False
    h2 = False


if https:           #with or without SSL?
    context = ssl.create_default_context()
    context.set_alpn_protocols(["http/1.1", "http/1.0"])

    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s = context.wrap_socket(s, server_hostname=hname)

    try:
        s.connect((hname, 443))
    except Exception as e:
        exit('Unable to connect to the URI: ' + str(e))
else:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.connect((hname, 80))
    except Exception as e:
        exit('Unable to connect to the URI: ' + str(e))



h1 = False      #by default http 1.1 = false


req = 'GET ' + path + ' HTTP/1.1\r\nHost: ' + hname + '\r\n\r\n'

try:
    s.send(req.encode())
    response = s.recv(10000).decode('utf-8', 'ignore')
except Exception as e:
    exit('RESPONSE ERROR: ' + str(e))

redirected = False


#301/202 handling
if re.search(r'HTTP/\d\.\d 30[12]', response):


    location_match = re.search(r'Location: (.+)\r\n', response)
    if location_match:
        new_location = location_match.group(1).strip()
        print(f"Redirected to: {new_location}"

                )
        if new_location.startswith('/'):
            new_hname = hname
            new_path = new_location
        # Extract the new hostname and path
        elif 'http' in new_location:
            if 'https://' in new_location:
                new_hname = new_location.split('//')[1].split('/')[0]
                new_path = '/' + '/'.join(new_location.split('//')[1].split('/')[1:])
                https = True

            else:
                new_hname = new_location.split('//')[1].split('/')[0]
                new_path = '/' + '/'.join(new_location.split('//')[1].split('/')[1:])
                https = False


        else:

            new_hname, new_path = new_location.split('/', 1)
            new_path = '/' + new_path

        # Re-establish the connection based on HTTPS or not
        if https:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock = context.wrap_socket(sock, server_hostname=new_hname)
            sock.connect((new_hname, 443))
        else:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.connect((new_hname, 80))

        # Resend the request to the new location
        request = 'GET ' + new_path + ' HTTP/1.1\r\nHost: ' + new_hname + '\r\n\r\n'
        sock.send(request.encode())
        response = sock.recv(10000).decode('utf-8', 'ignore')

        redirected = True

s.close()



password_protected = False #password protection
if re.search(r'HTTP/\d\.\d 401', response):
    password_protected = True


if 'WWW-Authenticate' in response:
    password_protected = True

def yesNo(boolean):
    return "yes" if boolean else "no"

print('website: ' + hname)
print('1. Supports http2: ' + yesNo(h2))
print('2. List of Cookies: ')

cookies = re.findall("Set-Cookie: (.+)", response, re.IGNORECASE)

# COOKIES

if cookies:
    for cookie in cookies:

        name = re.search("(.*?)[=;]", cookie)   #cookie name
        if name:
            name = name.group(1)
        else:
            name = ""


        expire = re.search("expires=(.*?);", cookie, re.IGNORECASE)     #expire time
        if expire:
            expire = ", expires time: " + expire.group(1)
        else:
            expire = ""


        domain = re.search("domain=(.*?);", cookie, re.IGNORECASE)      #domain name
        if domain:
            domain = ", domain name: " + domain.group(1)
        else:
            domain = ", domain name: " + hname

        print("cookie name: " + name + expire + domain)
else:

    print("THERE ARE NO COOKIES")
print('3. Password protected: ' + yesNo(password_protected))

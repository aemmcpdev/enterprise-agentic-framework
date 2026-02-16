import base64, sys
text = open(sys.argv[1], 'r', encoding='utf-8').read()
print(base64.b64encode(text.encode('utf-8')).decode('ascii'))

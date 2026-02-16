import base64, os

BASE = r'C:\Users\ADMIN\Desktop\enterprise-agentic-framework\packages\cortex\src\model-resolver'

# Read each template file and print its base64
import sys
for arg in sys.argv[1:]:
    with open(arg, 'r', encoding='utf-8') as f:
        content = f.read()
    b64 = base64.b64encode(content.encode('utf-8')).decode('ascii')
    print(f'{arg}: {b64[:100]}...')

import json, base64, os

base_dir = r'C:\Users\ADMIN\Desktop\enterprise-agentic-framework\packages\cortex\src\model-resolver'

# We'll read raw content from stdin and base64 encode it
import sys
text = sys.stdin.read()
print(base64.b64encode(text.encode('utf-8')).decode('ascii'))

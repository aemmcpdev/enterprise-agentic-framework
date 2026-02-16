# Helper to encode file contents to base64
# Usage: python _encode_helper.py <input_file>
import sys, base64
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    content = f.read()
print(base64.b64encode(content.encode('utf-8')).decode('ascii'))

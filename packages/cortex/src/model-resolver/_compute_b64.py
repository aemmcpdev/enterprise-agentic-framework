import base64, os

BASE = r'C:\Users\ADMIN\Desktop\enterprise-agentic-framework\packages\cortex\src\model-resolver'

# File 1 - base.ts is already written. Compute its b64 too for the data file

files = {}

# Read already-written base.ts
with open(os.path.join(BASE, 'providers', 'base.ts'), 'r', encoding='utf-8') as f:
    files['providers/base.ts'] = f.read()

# Now print the b64 encoding
for rel, content in files.items():
    b64 = base64.b64encode(content.encode('utf-8')).decode('ascii')
    print(f'{rel}: {len(b64)} chars')
    print(b64[:81])

print('\nB64 computation done')

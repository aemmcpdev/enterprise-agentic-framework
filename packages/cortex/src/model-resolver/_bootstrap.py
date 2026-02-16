# This script generates the _b64.txt data file by encoding each TS file's content
# Then you run _gen_all.py to actually create the files
import base64, os

BASE = r'C:\Users\ADMIN\Desktop\enterprise-agentic-framework\packages\cortex\src\model-resolver'

# We read raw content from stdin in a special format:
# ===FILE: relpath
# ...content...
# ===END
# And output the _b64.txt file

import sys
data = sys.stdin.read()

blocks = []
current_path = None
current_lines = []

for line in data.split('\n'):
    if line.startswith('===FILE:'):
        if current_path is not None:
            content = '\n'.join(current_lines)
            b64 = base64.b64encode(content.encode('utf-8')).decode('ascii')
            blocks.append(f'{current_path}==={b64}')
        current_path = line.split(':', 1)[1].strip()
        current_lines = []
    elif line == '===END":
        if current_path is not None:
            content = '\n'.join(current_lines)
            b64 = base64.b64encode(content.encode('utf-8')).decode('ascii')
            blocks.append(f'{current_path}==={b64}')
        current_path = None
        current_lines = []
    else:
        current_lines.append(line)

output = '\n---\n'.join(blocks)
with open(os.path.join(BASE, '_b64.txt'), 'w', encoding='utf-8') as f:
    f.write(output)

print(f'Generated _b64.txt with {len(blocks)} files')

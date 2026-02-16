import os

BASE = r'C:\Users\ADMIN\Desktop\enterprise-agentic-framework\packages\cortex\src\model-resolver'
PROV = os.path.join(BASE, 'providers')
os.makedirs(PROV, exist_ok=True)

def wf(rel, content):
    p = os.path.join(BASE, rel)
    with open(p, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)
    print(f'Created: {p}')

# Files will be added by _append scripts
# Each append script adds: files['path'] = r...

files = {}

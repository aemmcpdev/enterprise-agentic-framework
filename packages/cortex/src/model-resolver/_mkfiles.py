import os, base64

BASE = r'C:\Users\ADMIN\Desktop\enterprise-agentic-framework\packages\cortex\src\model-resolver'
PROV = os.path.join(BASE, 'providers')
os.makedirs(PROV, exist_ok=True)

def wf(relpath, content):
    p = os.path.join(BASE, relpath)
    with open(p, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)
    print(f'Created: {p}')

# Read data from companion files
for fname in os.listdir(BASE):
    if fname.startswith('_data_') and fname.endswith('.txt'):
        with open(os.path.join(BASE, fname), 'r') as f:
            lines = f.read().strip().split('\n', 1)
        relpath = lines[0].strip()
        b64content = lines[1].strip() if len(lines) > 1 else ''
        content = base64.b64decode(b64content).decode('utf-8')
        wf(relpath, content)
        os.remove(os.path.join(BASE, fname))

# Cleanup self
try:
    os.remove(os.path.join(BASE, '_mkfiles.py'))
except:
    pass
print('Done!')

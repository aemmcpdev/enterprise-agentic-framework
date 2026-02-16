import os, base64

BASE = r'C:\Users\ADMIN\Desktop\enterprise-agentic-framework\packages\cortex\src\model-resolver'
PROV = os.path.join(BASE, 'providers')
os.makedirs(PROV, exist_ok=True)

def wf(rel, content):
    p = os.path.join(BASE, rel)
    with open(p, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)
    print(f'Created: {p}')

# Read all b64 data from companion file
with open(os.path.join(BASE, '_alldata.txt'), 'r') as f:
    rawdata = f.read()

# Format: PATH\nSEP\nB64DATA^^NEXTFILE\nPATH\nSEP\nB64DATA
blocks = rawdata.split('^^')
for block in blocks:
    block = block.strip()
    if not block:
        continue
    lines = block.split('\n', 1)
    if len(lines) < 2:
        continue
    relpath = lines[0].strip()
    b64data = lines[1].strip()
    content = base64.b64decode(b64data).decode('utf-8')
    wf(relpath, content)

# Cleanup
for f in ['_alldata.txt', '_writeall.py', '_precompute.py', '_gen_all.py', '_bootstrap.py', '_encode_helper.py', '_gen.py', '_b64helper.py', '_writer.py', '_e.py', '_b64encode.js', '_test.js', '_mkfiles.py', '_tmp_content.txt']:
    try:
        os.remove(os.path.join(BASE, f))
    except:
        pass

print('All files created successfully!')

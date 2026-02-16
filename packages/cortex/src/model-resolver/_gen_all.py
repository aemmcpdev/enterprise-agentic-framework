import os, base64

BASE = r'C:\Users\ADMIN\Desktop\enterprise-agentic-framework\packages\cortex\src\model-resolver'
PROV = os.path.join(BASE, 'providers')

def wf(rel, b64):
    p = os.path.join(BASE, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    c = base64.b64decode(b64).decode('utf-8')
    with open(p, 'w', encoding='utf-8', newline='\n') as f:
        f.write(c)
    print(f'Created: {p}')


# Now we need to read b64 data from _b64.txt
# Format: each block is PATH===b64content separated by ---
with open(os.path.join(BASE, '_b64.txt'), 'r') as f:
    data = f.read()

for block in data.strip().split('---'):
    block = block.strip()
    if not block:
        continue
    parts = block.split('===' , 1)
    if len(parts) == 2:
        wf(parts[0].strip(), parts[1].strip())

# Cleanup
for f in ['_b64.txt', '_gen_all.py', '_mkfiles.py', '_encode_helper.py', '_gen.py', '_b64helper.py', '_writer.py']:
    try:
        os.remove(os.path.join(BASE, f))
    except:
        pass

print('All 7 files created successfully!')

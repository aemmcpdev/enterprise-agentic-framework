import json, base64, os

base = 'C:/Users/ADMIN/Desktop/enterprise-agentic-framework/packages/aegis'
manifest_path = os.path.join(base, '_manifest.json')

with open(manifest_path, 'r') as f:
    manifest = json.load(f)

for relpath, b64content in manifest.items():
    fp = os.path.join(base, relpath)
    os.makedirs(os.path.dirname(fp), exist_ok=True)
    content = base64.b64decode(b64content).decode('utf-8')
    with open(fp, 'w', newline='
') as f:
        f.write(content)
    print(f'Created {relpath}')

# Cleanup
os.remove(manifest_path)
os.remove(os.path.join(base, '_writer.py'))
print('Done! All files created.')

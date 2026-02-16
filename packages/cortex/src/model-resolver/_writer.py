import os, base64, json

base_dir = r'C:\Users\ADMIN\Desktop\enterprise-agentic-framework\packages\cortex\src\model-resolver'
providers_dir = os.path.join(base_dir, 'providers')
os.makedirs(providers_dir, exist_ok=True)

data_path = os.path.join(base_dir, '_files.json')
with open(data_path, 'r') as f:
    files = json.load(f)

for rel_path, b64_content in files.items():
    full_path = os.path.join(base_dir, rel_path)
    content = base64.b64decode(b64_content).decode('utf-8')
    with open(full_path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)
    print(f'Created: {full_path}')

# Cleanup
os.remove(data_path)
os.remove(os.path.join(base_dir, '_writer.py'))
print('All files created successfully!')

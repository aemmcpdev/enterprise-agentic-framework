
import os

base = r"C:\Users\ADMIN\Desktop\enterprise-agentic-framework\packages\nexus"

def w(rel_path, content):
    full = os.path.join(base, rel_path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", newline="\n") as f:
        f.write(content)
    print("Created:", rel_path)

# Already created: package.json, tsconfig.json, strategic-agent.ts, supervisor-agent.ts
# Remaining files to create...
print("Script loaded")

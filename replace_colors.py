import os
import re

replacements = {
    '#6a737c': '#525960',
    '#babfc4': '#9199a1',
    '#64748b': '#525960',
    '#0a95ff': '#0074cc',
    '#0f172a': '#232629',
}

# Also handle uppercase variants just in case
replacements_upper = {k.upper(): v for k, v in replacements.items()}
all_replacements = {**replacements, **replacements_upper}

target_dir = 'fe/src'
extensions = ('.tsx', '.ts', '.css')

def batch_replace(root_dir):
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith(extensions):
                file_path = os.path.join(root, file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = content
                for old, new in all_replacements.items():
                    new_content = new_content.replace(old, new)
                
                if new_content != content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated: {file_path}")

if __name__ == "__main__":
    batch_replace(target_dir)

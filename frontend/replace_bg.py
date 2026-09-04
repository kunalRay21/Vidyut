import os

replacements = {
    'bg-white rounded-xl shadow-sm': 'bg-[#FAFCCC] rounded-xl shadow-sm',
    'bg-white rounded-lg shadow-sm': 'bg-[#FAFCCC] rounded-lg shadow-sm',
    'bg-white rounded-xl shadow-2xl': 'bg-[#FAFCCC] rounded-xl shadow-2xl',
    'bg-white rounded-xl shadow-xl': 'bg-[#FAFCCC] rounded-xl shadow-xl',
    'bg-white p-6 rounded-lg': 'bg-[#FAFCCC] p-6 rounded-lg',
    'bg-white p-8 rounded-xl': 'bg-[#FAFCCC] p-8 rounded-xl',
    'bg-white border border-gray-200 rounded-xl': 'bg-[#FAFCCC] border border-gray-200 rounded-xl',
    'bg-white border border-gray-200 rounded-lg hover:border-indigo-500': 'bg-[#FAFCCC] border border-gray-200 rounded-lg hover:border-indigo-500',
    'bg-white border-b hover:bg-gray-50': 'bg-[#FAFCCC] border-b hover:bg-[#F0F2BD]',
    'bg-gray-50 opacity-75': 'bg-[#FAFCCC] opacity-75',
    'p-6 bg-gray-50 flex': 'p-6 bg-[#FAFCCC] flex',
    'p-3 mb-2 bg-gray-50 rounded': 'p-3 mb-2 bg-[#FAFCCC] rounded',
    'items-center bg-gray-50': 'items-center bg-[#FAFCCC]',
    'bg-gray-50 text-xs': 'bg-[#FAFCCC] text-xs',
    'p-4 bg-gray-50 border-t': 'p-4 bg-[#FAFCCC] border-t'
}

count = 0
for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            modified = content
            for old, new in replacements.items():
                modified = modified.replace(old, new)
            
            if modified != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(modified)
                print(f'Updated {filepath}')
                count += 1

print(f'Finished updating {count} files.')

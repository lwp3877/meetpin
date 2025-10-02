import json
import sys

with open('lighthouse-aria-improvements.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print('=== Lighthouse Results ===')
print(f"Performance: {int(data['categories']['performance']['score'] * 100)}")
print(f"Accessibility: {int(data['categories']['accessibility']['score'] * 100)}")
print()

refs = data['categories']['accessibility']['auditRefs']
failed = []
for ref in refs:
    audit = data['audits'][ref['id']]
    score = audit.get('score')
    if score is not None and score < 1 and ref.get('weight', 0) > 0:
        failed.append((ref['id'], audit['title'], score))

if failed:
    print(f'=== Remaining Accessibility Issues ({len(failed)}) ===')
    for audit_id, title, score in failed:
        print(f"  - {title}")
        print(f"    ID: {audit_id}, Score: {score * 100:.0f}")
else:
    print('All accessibility audits passed!')

import re

p='frontend/static/iq_assessment.js'
text=open(p,encoding='utf-8').read()
m=re.search(r'var QUESTIONS\s*=\s*\[([\s\S]*?)\];', text)
if not m:
    raise SystemExit('no QUESTIONS')
arr=m.group(1)
blocks=[]
for mi in re.finditer(r"\n\s*\{\n\s*title:\s*'([^']*)'", arr):
    blocks.append((mi.start(), mi.end(), mi.group(1)))
blocks2=[]
for i,(s,e,t) in enumerate(blocks):
    end = blocks[i+1][0] if i+1<len(blocks) else len(arr)
    blocks2.append((t,arr[s:end]))

out=[]
for title,blk in blocks2:
    a=None
    mo=re.search(r'answer:\s*([0-9]+)', blk)
    if mo: a=int(mo.group(1))
    opts=[]
    mo=re.search(r'opts:\s*\[([^\]]*)\]', blk, re.S)
    if mo:
        ov=mo.group(1)
        opts=[x.strip().strip("'\"") for x in re.findall(r"'([^']*)'", ov)]
    else:
        mo=re.search(r'imgOpts:\s*\[([^\]]*)\]', blk, re.S)
        if mo:
            opts=['img:'+x.strip() for x in re.findall(r'"([^"]*)"', mo.group(1))]
        else:
            mo=re.search(r'customOptsHtml:\s*\[([^\]]*)\]', blk, re.S)
            if mo:
                opts=['customOpt'+str(i) for i,_ in enumerate(re.findall(r'<div', mo.group(1)))]
    out.append({'title':title, 'answer':a, 'opts':opts, 'opts_count':len(opts), 'has_answer':a is not None})

for i,q in enumerate(out, start=1):
    correct_in = 'Yes' if q['has_answer'] and q['answer'] < q['opts_count'] else 'No'
    print(f"Q{i}: {q['title'][:60]}... answer={q['answer']} opt_count={q['opts_count']} valid={correct_in}")

print('\nSummary:')
print('total', len(out))
print('invalid', [i+1 for i,q in enumerate(out) if not (q['has_answer'] and q['answer'] < q['opts_count'])])

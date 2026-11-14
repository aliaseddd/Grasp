import re,sys,glob
def lines(prefix):
    for i in (1,2,3,4,5,6):
        for f in ('scale','instant'):
            p=f'/home/user/wt/2-1-grips/.probe/runs/{prefix}-{f}-{i}.txt'
            try: s=open(p).read()
            except FileNotFoundError: continue
            res=re.search(r'# pass (\d+)\n# fail (\d+)',s)
            out=[]
            m=re.search(r'opened in ([\d.]+) ms',s); 
            if m: out.append('open '+m.group(1))
            m=re.search(r'A drag step takes ([\d.]+) ms when it starts a drag and ([\d.]+) ms',s)
            if m: out.append(f'drag {m.group(1)}/{m.group(2)}')
            for k,m in enumerate(re.finditer(r'A keystroke takes ([\d.]+) ms when it opens a name.s undo step and ([\d.]+) ms',s)):
                out.append(('key ' if k==0 else 'key+150 ')+f'{m.group(1)}/{m.group(2)}')
            for m in re.finditer(r'A pan step of (\w+), fitted at [\d.]+%, takes ([\d.]+) ms when it starts a pan and ([\d.]+) ms',s):
                out.append(f'pan {m.group(1)[:5]} {m.group(2)}/{m.group(3)}')
            for name,pat in (('ready',r'top bar: median ([\d.]+)'),('drawn',r'lines: median ([\d.]+) ms of \d+ samples \([\d., ]+\), limit 1000'),('switch',r'lines: median ([\d.]+) ms of \d+ samples \([\d., ]+\), limit 100 '),('drag(ex)',r'drag of Host: median ([\d.]+)'),('key(ex)',r'name of Host: median ([\d.]+)')):
                m=re.search(pat,s)
                if m: out.append(f'{name} {m.group(1)}')
            fails=re.findall(r'^\s*not ok \d+ - (.*)$',s,re.M)
            print(f'{prefix}-{f}-{i}: pass {res.group(1) if res else "?"} fail {res.group(2) if res else "?"} | '+', '.join(out)+(' | FAILED: '+'; '.join(fails) if fails else ''))
for p in sys.argv[1:]: lines(p)

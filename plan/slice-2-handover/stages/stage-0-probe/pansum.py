import re,glob,statistics,sys
for v in sys.argv[1:]:
    rows={}
    fails=0; n=0
    for p in sorted(glob.glob(f'/home/user/wt/2-1-grips/.probe/runs/pan-{v}-*.txt')):
        s=open(p).read(); n+=1
        if re.search(r'# fail [1-9]',s): fails+=1
        m=re.search(r'A drag step takes ([\d.]+) ms when it starts a drag and ([\d.]+) ms',s)
        if m: rows.setdefault('drag',[]).append((float(m.group(1)),float(m.group(2))))
        for m in re.finditer(r'A pan step of (\w+), fitted at [\d.]+%, takes ([\d.]+) ms when it starts a pan and ([\d.]+) ms',s):
            rows.setdefault('pan '+m.group(1),[]).append((float(m.group(2)),float(m.group(3))))
    print(v, f'runs {n}, with a failure {fails}')
    for k,vals in rows.items():
        a=[x[0] for x in vals]; b=[x[1] for x in vals]
        print(f'  {k:16s} starting: median {statistics.median(a):.1f} (min {min(a):.1f}, max {max(a):.1f}) | following: median {statistics.median(b):.1f} (min {min(b):.1f}, max {max(b):.1f}) | all: '+' '.join(f'{x:.1f}/{y:.1f}' for x,y in vals))

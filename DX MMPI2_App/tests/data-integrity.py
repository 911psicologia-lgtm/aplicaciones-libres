import json
from pathlib import Path

def audit(path):
    data=json.loads(Path(path).read_text(encoding='utf-8'))
    tables=pd_gt_100=non_monotonic=invalid=0
    examples=[]
    for scale, sexes in data.items():
        if not isinstance(sexes,dict): continue
        for sex, tab in sexes.items():
            if not isinstance(tab,dict): continue
            tables += 1
            pts=[]
            for k,v in tab.items():
                try: pts.append((float(k),float(v)))
                except Exception: invalid += 1
            pts.sort()
            if any(pd>100 for pd,_ in pts): pd_gt_100 += 1
            drops=[(a,b) for a,b in zip(pts,pts[1:]) if b[1] < a[1]]
            if drops:
                non_monotonic += 1
                if len(examples)<8: examples.append((scale,sex,drops[:3]))
    return dict(tables=tables,pd_gt_100=pd_gt_100,non_monotonic=non_monotonic,invalid=invalid,examples=examples)

for p in ('data/baremos.json','data/baremo_us.json'):
    print(p, audit(p))

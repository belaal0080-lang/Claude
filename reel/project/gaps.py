import sys,wave,array,math,json
def env(path):
    w=wave.open(path);sr=w.getframerate();a=array.array('h',w.readframes(w.getnframes()))
    win=int(sr*0.01);db=[]
    for i in range(0,len(a)-win,win):
        s=sum(x*x for x in a[i:i+win])/win; db.append(10*math.log10(s/32768**2+1e-12))
    return db
def keeps(path,mingap=0.10,handle=0.05):
    db=env(path);srt=sorted(db);floor=srt[int(.1*len(srt))];peak=srt[int(.95*len(srt))]
    thr=floor+0.45*(peak-floor)
    voiced=[d>=thr for d in db]; T=len(db)*0.01
    gaps=[];run=0
    for i,v in enumerate(voiced+[True]):
        if not v: run+=1
        else:
            if run*0.01>=mingap: gaps.append(((i-run)*0.01,i*0.01))
            run=0
    segs=[];cur=0.0
    for g0,g1 in gaps:
        a,b=g0+handle,g1-handle
        if a<=cur: cur=max(cur,b); continue
        segs.append((round(cur,2),round(a,2))); cur=b
    if cur<T: segs.append((round(cur,2),round(T,2)))
    # merge fragments: a piece shorter than 0.18 s joins its nearer neighbour when the gap is < 0.25 s, else is dropped
    changed=True
    while changed:
        changed=False
        for i,(a,b) in enumerate(segs):
            if b-a>=0.18: continue
            gl=a-segs[i-1][1] if i>0 else 9; gr=segs[i+1][0]-b if i<len(segs)-1 else 9
            if min(gl,gr)<0.25:
                if gl<=gr: segs[i-1]=(segs[i-1][0],b)
                else: segs[i+1]=(a,segs[i+1][1])
            del segs[i]; changed=True; break
    return segs,gaps,thr
if __name__=='__main__':
    out={}
    for p in sys.argv[1:]:
        s,g,t=keeps(p); out[p.split('.')[0]]=s
        print(p,'thr',round(t,1),'kept',round(sum(b-a for a,b in s),2),'segs',len(s))
        print('  gaps:',' '.join(f"{a:.2f}-{b:.2f}" for a,b in g))
    json.dump(out,open('keeps.json','w'),indent=0)

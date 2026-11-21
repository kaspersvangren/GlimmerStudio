import sys,json,os
from PIL import Image,ImageDraw,ImageFont
d=sys.argv[1];m=json.load(open(d+'/m.json'));R,K,s=m['R'],m['K'],m['skala'];w,h=int(m['w']*s),int(m['h']*s)
try: F=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',13)
except Exception: F=ImageFont.load_default()
L=92;T=20;per=max(1,min(len(R),int(1900//(h+2))))
for a in range(0,len(R),per):
    rr=R[a:a+per];A=Image.new('RGB',(L+len(K)*(w+2),T+len(rr)*(h+2)),'#111');D=ImageDraw.Draw(A)
    for c,k in enumerate(K): D.text((L+c*(w+2)+3,3),k[:int(w/8)],fill='#fff',font=F)
    for i,r in enumerate(rr):
        D.text((3,T+i*(h+2)+h//2),r[:12],fill='#fff',font=F)
        for c in range(len(K)):
            im=Image.open(f'{d}/{a+i}-{c}.png')
            if s!=1: im=im.resize((w,h),Image.LANCZOS)
            A.paste(im,(L+c*(w+2),T+i*(h+2)))
    A.save(f"{os.path.dirname(d)}/kark-{m['navn']}-{a//per+1}.png");print('ark',f"kark-{m['navn']}-{a//per+1}.png",A.size)

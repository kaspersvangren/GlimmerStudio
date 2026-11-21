# bygger spillet: kortet som skal, med rummene pakket ind som funktioner, så deres navne ikke støder sammen med kortets
import os
D=os.path.dirname(os.path.abspath(__file__))
F=os.path.join(D,'pap-testscene.html') if os.path.exists(os.path.join(D,'pap-testscene.html')) else '/root/.claude/projects/-home-claude/7e6e1ec2-3e3e-53cb-a86a-d449a4e04a32/tool-results/artifact-b36b03af-1795066527-2aa5.html'
L=open(F).read().split('\n')
helpers='\n'.join(L[76:236]).replace('antialias:false','antialias:true').replace('const rnd=rng(20261118);','let rnd=rng(20261118);')
r=lambda n:open(os.path.join(D,n)).read()
kort='\n'.join(r(n) for n in['k2detail.js','k3craft.js','k2scene.js','k3town.js','stoevle.js','k3town2.js','k3land.js'])+'\n'+r('witch.js').split('const W={};')[0]+'\n'+'\n'.join(r(n) for n in['figur.js','k3folk.js','k2live.js','spil0.js','k2main.js','k3stage.js'])
rum=lambda navn,fil:"ROOMS.%s=function(ctx){const msg=ctx.msg,msgN=ctx.msgN;\n%s\nctx.room={scenes:[scene,live],ST}};\n"%(navn,r(fil))
import glob
nye='\n'.join(r(os.path.basename(f)) for f in sorted(glob.glob(os.path.join(D,'rum-*.js'))))
js=helpers+'\n'+kort+'\n'+r('k3rum.js')+'\nconst ROOMS={};\n'+rum('garderobe','garderobe2.js')+rum('koncert','koncert.js')+nye+'\n'+r('spil.js')
s=r('spil-shell.html').replace('__JS__',js)
open(os.path.join(D,'spillet.html'),'w').write(s)
open(os.path.join(D,'testspil.html'),'w').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+s+'</body></html>')
print(len(s))

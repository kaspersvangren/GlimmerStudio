import os
D=os.path.dirname(os.path.abspath(__file__))
F=os.path.join(D,'pap-testscene.html') if os.path.exists(os.path.join(D,'pap-testscene.html')) else '/root/.claude/projects/-home-claude/7e6e1ec2-3e3e-53cb-a86a-d449a4e04a32/tool-results/artifact-b36b03af-1795066527-2aa5.html'
L=open(F).read().split('\n')
helpers='\n'.join(L[76:236]).replace('antialias:false','antialias:true')
r=lambda n:open(os.path.join(D,n)).read()
js=helpers+'\n'+r('k2detail.js')+'\n'+r('k3craft.js')+'\n'+r('k3stage.js')+'\n'+r('koncert.js')
s=r('koncert-shell.html').replace('__JS__',js)
open(os.path.join(D,'koncertsalen.html'),'w').write(s)
open(os.path.join(D,'testkoncert.html'),'w').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+s+'</body></html>')
print(len(s))

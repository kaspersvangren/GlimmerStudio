import base64
F='/root/.claude/projects/-home-claude/7e6e1ec2-3e3e-53cb-a86a-d449a4e04a32/tool-results/artifact-b36b03af-1795066527-2aa5.html'
L=open(F).read().split('\n')
helpers='\n'.join(L[76:236]).replace('antialias:false','antialias:true')
js=helpers+'\n'+open('scene.js').read()+'\n'+open('witch.js').read()+'\n'+open('main.js').read()
nu='data:image/jpeg;base64,'+base64.b64encode(open('nu.jpg','rb').read()).decode()
s=open('shell.html').read().replace('__JS__',js).replace('__NU__',nu)
open('garderoben.html','w').write(s)
# lokal testfil med html-skelet
open('test.html','w').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+s+'</body></html>')
print(len(s))

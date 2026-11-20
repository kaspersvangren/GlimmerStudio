import base64
import os
F=os.path.join(os.path.dirname(os.path.abspath(__file__)),'pap-testscene.html')
L=open(F).read().split('\n')
helpers='\n'.join(L[76:236]).replace('antialias:false','antialias:true')
js=helpers+'\n'+open('k2detail.js').read()+'\n'+open('k3craft.js').read()+'\n'+open('k2scene.js').read()+'\n'+open('k3town.js').read()+'\n'+open('k3town2.js').read()+'\n'+open('k3land.js').read()+'\n'+open('witch.js').read()+'\n'+open('k2live.js').read()+'\n'+open('k2main.js').read()
nu='data:image/jpeg;base64,'+base64.b64encode(open('nu-by.jpg','rb').read()).decode()
s=open('k2shell.html').read().replace('__JS__',js).replace('__NU__',nu)
open('kortet.html','w').write(s)
open('testkort.html','w').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+s+'</body></html>')
print(len(s))

/* prøvebænk: én ting ad gangen på en neutral baggrund, så former kan rettes hurtigt */
const scene=new THREE.Scene(),live=new THREE.Scene();scene.background=new THREE.Color('#1a2a1e');
{const e=tx(makeEnv(),true);e.mapping=THREE.EquirectangularReflectionMapping;const pm=new THREE.PMREMGenerator(renderer);const env=pm.fromEquirectangular(e).texture;scene.environment=env;live.environment=env;scene.environmentIntensity=live.environmentIntensity=.3;pm.dispose()}
const key=new THREE.DirectionalLight('#ffe2c4',2.2);key.position.set(-30,60,110);scene.add(key);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-40,right:40,top:40,bottom:-10,near:20,far:260});
scene.add(new THREE.HemisphereLight('#a9b4ff','#3a2a20',.6));
const SPOTS={},BUILD=[],PAL={iron:'#2e2833',woodDk:'#5c3c28',wood:'#86593a'};
const starPts=(x,y,r1,r2,rot=0)=>{const o=[];for(let i=0;i<10;i++){const a=Math.PI/2+rot+i/10*TAU,r=i%2?r2:r1;o.push([x+Math.cos(a)*r,y+Math.sin(a)*r])}return o};
__BENCH__
const cam=new THREE.PerspectiveCamera(30,1,10,600),CD=120;const BV=window.BVIEW||{W:34,H:26,y:8,x:0};
const ST=makeStage({cam,CD,fit:(c,w,h)=>{const asp=w/h,H=Math.max(BV.H,BV.W/asp);c.fov=2*Math.atan(H/2/CD)*180/Math.PI;c.position.set(BV.x,BV.y+CD*Math.sin(.1),CD*Math.cos(.1));c.lookAt(BV.x,BV.y,0)},P_:{aoR:.4,dof:[.2,.5],haze:[2,3,0],bloom:1,bg:'#1a2a1e'}});
(async()=>{try{try{await Promise.race([Promise.all(['Berkshire Swash','Special Elite','Alegreya SC'].map(f=>document.fonts.load(`400 40px "${f}"`).catch(()=>{}))),new Promise(r=>setTimeout(r,2500))])}catch(_){}
  await benchBuild();ST.bake();msg.classList.add('gone');const loop=()=>{requestAnimationFrame(loop);if(window.benchTick)benchTick(performance.now()/1000);ST.draw()};loop()}catch(e){msgN.textContent='Fejl: '+e.message;console.error(e)}})();

/* ============ hele kortet: en magisk pap-by på et bord ============
   `scene` tegnes én gang (bages) med lys og skygger. `live` er det, der bevæger sig. */
const scene=new THREE.Scene(),live=new THREE.Scene();
scene.background=new THREE.Color('#0d0a12');
{const e=tx(makeEnv(),true);e.mapping=THREE.EquirectangularReflectionMapping;const pm=new THREE.PMREMGenerator(renderer);const env=pm.fromEquirectangular(e).texture;scene.environment=env;live.environment=env;scene.environmentIntensity=live.environmentIntensity=.28;pm.dispose()}
const key=new THREE.DirectionalLight('#ffd9b0',2.0);key.position.set(-60,100,120);key.target.position.set(0,0,-4);scene.add(key,key.target);
key.castShadow=true;key.shadow.mapSize.set(4096,4096);Object.assign(key.shadow.camera,{left:-100,right:100,top:75,bottom:-60,near:40,far:340});key.shadow.bias=-.0005;key.shadow.normalBias=.06;key.shadow.radius=2.5;
scene.add(new THREE.HemisphereLight('#8f9cff','#3a2a18',.48));
const moonL=new THREE.DirectionalLight('#aebfff',.65);moonL.position.set(60,70,-90);scene.add(moonL);
{const k2=key.clone();k2.castShadow=false;live.add(k2,k2.target);live.add(new THREE.HemisphereLight('#8f9cff','#3a2a18',.62));live.add(moonL.clone())}
const GX0=-86,GX1=86,GZ0=-42,GZ1=38;
const BUILD=[],SPOTS={};
const lamp=(x,z,c='#ffb35c',i=80,d=24,y=10)=>{const L=new THREE.PointLight(c,i,d,2);put(scene,L,x,y,z)};
const glowSpots=[];

/* ---- stierne: hver ender lige foran en dør (front-rækkens døre vender mod beskueren, så stierne går rundt foran dem) ---- */
const PATHS=[
  [[0,0],[-6,-8],[-8.6,-14],[-5.4,-21],[0,-23.6]],          /* til skolens trappe, uden om brønden (ellers skjuler brøndens tag stien) */
  [[0,0],[6,-8],[8.6,-14],[5.4,-21],[0,-23.6]],
  [[-22,-1.2],[-22,-5.2]],                                   /* lille stikvej hen til vejviseren */
  [[0,0],[-14,-1],[-30,-1],[-42,-3],[-46,-5.6]],             /* til kollegiets dør */
  [[-38,-2],[-52,-3],[-60.5,-6.5],[-63.5,-13],[-65.5,-21.6]],/* til dragehulen, uden om kollegiet */
  [[0,0],[11,2.5],[22,7.2],[33,7.6],[37,5]],                       /* til boblebutikkens dør */
  [[22,7.2],[36,9.4],[46,7.5],[52,1],[56,-6],[58,-10.6]],        /* til dyreparkens låge */
  [[0,0],[-6,10],[-11,20],[-11.5,28],[-15,31.6],[-23.4,31.4]], /* til støvlens stige */
  [[-15,31.6],[-30,34],[-46,33.2],[-62,30.8]],               /* til koncertsalen, i en bue uden om cafébordet foran støvlen */
  [[0,0],[5,12],[6,22],[5.6,30],[8,34.2],[12,35]],                    /* forbi klokketårnet */
  [[12,35],[22,35],[32,34.8],[46,34],[58,33],[66,31]]];    /* over broen til arkaden */
const RIVER=[];for(let i=0;i<=30;i++){const t=i/30;RIVER.push([mix(70,26,t)+7*Math.sin(t*5.5+.4),mix(-4,40,t)])}
/* steder og ting, som kvalitetstjekket kigger på */
/* den buede bro: midt over åen, hvor stien til Arkaden krydser; dækkets højde bruges også af dem der går over */
const BRIDGE={x:25.4,z:34.9,L:8,w:2.35,rise:2.7};
const bridgeDeck=dx=>.42+BRIDGE.rise*Math.max(0,1-(dx/BRIDGE.L)**2);
const bridgeY=(x,z)=>Math.abs(z-BRIDGE.z)<BRIDGE.w&&Math.abs(x-BRIDGE.x)<BRIDGE.L?bridgeDeck(x-BRIDGE.x)-.3:0;
const BAENKE=[[-12.8,-10.8,.2],[12.8,-10.8,-.2]];/* bænkene: sted og drejning; bruges også, når nogen skal uden om dem */
const PROPS=[];const prop=(k,x,z,r=1)=>PROPS.push({k,x,z,r});
SPOTS.skole=[0,-21.6];
const flagSpots=[],lampSpots=[];
let chimneyAt,wellAt,fallAt;

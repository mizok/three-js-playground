import { AxesHelper, Clock, PerspectiveCamera, PlaneGeometry, Scene, TextureLoader, WebGLRenderer,LoadingManager, MeshToonMaterial, Mesh, AmbientLight, DirectionalLight,NearestFilter,Texture, RepeatWrapping, Fog, PointLight, MeshStandardMaterial, CylinderGeometry, BoxGeometry, Vector3, BufferGeometry, Group, ConeGeometry, Vector2, Color, LatheGeometry, DoubleSide, PointLightHelper, CameraHelper, RingGeometry, Shape, Path, ExtrudeGeometry } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { debounce, groupBy } from 'lodash';



const loadingManager = new LoadingManager();

  loadingManager.onStart = ()=>{
    console.log('texture load start')
  }
  loadingManager.onLoad = ()=>{
    console.log('texture loaded')
  }
  loadingManager.onError = ()=>{
    console.log('texture load error')
  }

const textureLoader = new TextureLoader(loadingManager);
const aoTexture = textureLoader.load(require('@img/concrete/ao.jpg'));
const heightTexture = textureLoader.load(require('@img/concrete/height.png'));
const colorTexture = textureLoader.load(require('@img/concrete/color.jpg'));
const normalTexture = textureLoader.load(require('@img/concrete/normal.png'));

const aoTexture1 = textureLoader.load(require('@img/stone-wall/ao.jpg'));
const heightTexture1 = textureLoader.load(require('@img/stone-wall/height.png'));
const colorTexture1 = textureLoader.load(require('@img/stone-wall/color.jpg'));
const normalTexture1 = textureLoader.load(require('@img/stone-wall/normal.png'));

const aoTexture2 = textureLoader.load(require('@img/brick/ao.jpg'));
const heightTexture2 = textureLoader.load(require('@img/brick/height.png'));
const colorTexture2 = textureLoader.load(require('@img/brick/color2.jpg'));
const colorTexture2A = textureLoader.load(require('@img/brick/color.jpg'));
const normalTexture2 = textureLoader.load(require('@img/brick/normal.png'));

const aoTexture3 = aoTexture1.clone()
const heightTexture3 = heightTexture1.clone()
const colorTexture3 =  colorTexture1.clone()
const normalTexture3 =  normalTexture1.clone()

const aoTextureW = textureLoader.load(require('@img/wood/ao.png'));
const heightTextureW = textureLoader.load(require('@img/wood/height.png'));
const colorTextureW = textureLoader.load(require('@img/wood/color.jpg'));
const normalTextureW = textureLoader.load(require('@img/wood/normal.png'));

const aoTextureR = textureLoader.load(require('@img/rock/ao.jpg'));
const heightTextureR = textureLoader.load(require('@img/rock/height.png'));
const colorTextureR = textureLoader.load(require('@img/rock/color.jpg'));
const normalTextureR = textureLoader.load(require('@img/rock/normal.jpg'));

function main() {
  const {scene,renderer,camera,clock,axis} = new RenderEnv();
  axis.visible = false;
  const land = new Land();
  const castle = new Castle();
  scene.add(land.mesh,castle.mesh);
}

class RenderEnv{
  scene:Scene;
  axis:AxesHelper;
  camera:PerspectiveCamera;
  renderer:WebGLRenderer;
  clock:Clock;
  aLight:AmbientLight;
  dLight:DirectionalLight;
  pLight:PointLight;
  constructor(){
    this.init();
  }
  init(){
    Object.assign(this,this.getSceneRenderReady());
  }

  getSceneRenderReady(){
    const clearColor = 0x262837;
    const clock = new Clock();
    const scene = new Scene();
    const renderer = new WebGLRenderer({
      antialias: true, // 反鋸齒
    })
    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;
    const axis = new AxesHelper(5);
    const aLight = new AmbientLight(0xb9d5ff,0.3);
    const dLight = new DirectionalLight(0xb9d5ff,0.3);
    const pLight = new PointLight(new Color('pink'),1.5)
    const pLightHelper = new PointLightHelper(pLight);
   
    
    pLight.castShadow = true;
    
    pLight.position.set(-14,14,-14);
    dLight.position.set(5,5,5)
    

    scene.add(camera,axis,aLight,dLight,pLight,pLightHelper)
    
    const fog = new Fog(clearColor,1,120);
    scene.fog = fog;

    document.body.appendChild(renderer.domElement);
    renderer.setClearColor(clearColor) // 把背景色設置為透明
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    window.addEventListener('resize', debounce(() => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, 200))

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true;
    // controls.minPolarAngle = Math.PI / 2;
    // controls.maxPolarAngle = Math.PI / 2;
    // controls.autoRotate = true;
    // controls.enableZoom = false;
    
    controls.center = new Vector3(0,200,0)
 
    const tick = () => {
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    }
  
    tick();

    return {scene,renderer,camera,clock,axis};
  }
}

class Land{
  mesh:Mesh;
  constructor(){
    this.init();
  }
  init(){
    this.mesh = this.genMesh();
  }
  genGeometry(){
    return new PlaneGeometry(150,150,200,200);
  }
  genMaterial(){
    // const gradientTexture = textureLoader.load(require('@img/gradients/gradA.jpg'));
    const setting = (...textures:Texture[])=>{
      textures.forEach(texture=>{
        texture.minFilter = NearestFilter;
        texture.magFilter = NearestFilter;
        texture.generateMipmaps = false; //節省效能
        texture.repeat.x = 2;
        texture.repeat.y = 2;
        texture.rotation = -6;
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
      })
    }
    setting(
      aoTexture,heightTexture,colorTexture,normalTexture
    )
    const mat = new MeshStandardMaterial({
      map:colorTexture,
      displacementMap:heightTexture,
      normalMap:normalTexture,
      aoMap:aoTexture,
      displacementScale:5
    })
    return mat;
  }
  genMesh(){
    const mesh = new Mesh(
      this.genGeometry(),
      this.genMaterial()
    )
    mesh.rotation.x =  - Math.PI/2;
    mesh.position.y =  - 10;
    mesh.receiveShadow = true;
    return mesh;
  }
}

class Castle{
  mesh:Mesh|Group;
  mainRadius:number=10;
  pillarHeight:number=50;
  constructor(){
    this.init();
  }
  init(){
    this.mesh = this.genMesh();
  }
  genBody(){
    const mainGeo = new CylinderGeometry(
      this.mainRadius-0.4,
      this.mainRadius+0.4,
      this.pillarHeight,
      100,
      100
    )

    const matSetting = (...textures:Texture[])=>{
      textures.forEach(texture=>{
        texture.minFilter = NearestFilter;
        texture.magFilter = NearestFilter;
        texture.generateMipmaps = false; //節省效能
        texture.repeat.x = 4;
        texture.repeat.y = 2;
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
      })
    }

    matSetting(colorTexture1,aoTexture1,heightTexture1,normalTexture1)
    const mat = new MeshStandardMaterial({
      color:0xb9d5ff,
      map:colorTexture1,
      aoMap:aoTexture1,
      displacementMap:heightTexture1,
      displacementBias:-0.75,
      displacementScale:0.8,
      normalMap:normalTexture1,
      normalScale:new Vector2(0.2,0.2),
    })
    
    return new Mesh(
      mainGeo,
      mat
    )
  }
  genBricks(num:number=10){
    const bricks = new Group()
    const randomizer = (x:number,y:number)=>{
      const bias = 0.25
      return [
        x+Math.random()*x*bias,
        y+Math.random()*y,
      ]
    }
    for(let n=0;n<num;n++){
      const brickGeo = new BoxGeometry(...randomizer(4,2),0.5,50,50);
      const mat = new MeshStandardMaterial({
        map:colorTexture2,
        aoMap:aoTexture2,
        displacementMap:heightTexture2,
        displacementBias:-0.2,
        displacementScale:0.5,
        normalMap:normalTexture2,
        normalScale:new Vector2(0.1,0.1)
      });
      const height = (Math.random()-0.5)*(this.pillarHeight - 15);
      const mesh = new Mesh(brickGeo,mat);
      const theda = Math.random() * 2 *0.03 *Math.PI + 2 * n * Math.PI/num;
      mesh.position.set(
      this.mainRadius*0.98*Math.sin(theda),
      height,
      this.mainRadius*0.98*Math.cos(theda)
      )
      mesh.lookAt(0,height,0);
      bricks.add(mesh);
    }
   
    return bricks;
  }
  genWoodenMiddle(){
    const group = new Group();
    const extrudeSettings = {
      amount : 0.75,
      steps : 5,
      bevelEnabled: true,
      curveSegments: 10
    };

    const matSetting = (...textures:Texture[])=>{
      textures.forEach(texture=>{
        texture.minFilter = NearestFilter;
        texture.magFilter = NearestFilter;
        texture.generateMipmaps = false; //節省效能
        texture.repeat.x = 0.25;
        texture.repeat.y = 0.25;
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
      })
    }

    matSetting(colorTextureW,aoTextureW,normalTextureW,heightTextureW)
  
    const arcShape = new Shape();
    arcShape.absarc(0, 0, this.mainRadius+1, 0, Math.PI * 2, false);
    
    const holePath = new Path();
    holePath.absarc(0, 0, this.mainRadius, 0, Math.PI * 2, true);
    arcShape.holes.push(holePath);
    
    const rinGeo = new ExtrudeGeometry(arcShape, extrudeSettings);
    const rinMesh = new Mesh(rinGeo,new MeshStandardMaterial({
      map:colorTextureW,
      aoMap:aoTextureW,
      normalMap:normalTextureW,
      displacementMap:heightTextureW,
      displacementBias:-0.5,
      side:DoubleSide
    }))
    rinMesh.position.set(0,this.pillarHeight/2 - 8,0)
    rinMesh.lookAt(0,999,0);


    const beamShape = new Shape();
    beamShape.moveTo(0,0);
    beamShape.lineTo(-3,8);
    beamShape.lineTo(-2,8);
    beamShape.lineTo(1,0);
    beamShape.lineTo(0,0);

    const extrudeSettingsB = {
      amount : 1,
      steps : 5,
      bevelEnabled: true,
      curveSegments: 10
    };
    const beams = new Group();
    const beamNum = 6;
    const beamSurroundRadius = 10
    const beamGeo = new ExtrudeGeometry(beamShape, extrudeSettingsB);
    const beamPosHeight = this.pillarHeight/2 - 8;
    beamGeo.rotateX(Math.PI/2);
   

    for(let n=0;n<beamNum;n++){
      const beamGeo = new ExtrudeGeometry(beamShape, extrudeSettingsB);
      const beamPosHeight = this.pillarHeight/2 - 8
      beamGeo.rotateX(Math.PI/2);
      beamGeo.rotateZ(n*2*Math.PI/beamNum + Math.PI/2)
    
      const beamMesh = new Mesh(beamGeo,new MeshStandardMaterial({
        map:colorTextureW,
        aoMap:aoTextureW,
        normalMap:normalTextureW,
        displacementMap:heightTextureW,
        displacementBias:-0.4,
        side:DoubleSide
      }))
      const theda =  n * 2* Math.PI/beamNum;
      beamMesh.lookAt(0,beamPosHeight,0)
      beamMesh.position.set(
      beamSurroundRadius*Math.sin(theda),
      beamPosHeight,
      beamSurroundRadius*Math.cos(theda)
      )
      beams.add(beamMesh);
    }
    
    const plateGeo = new CylinderGeometry(this.mainRadius+3,this.mainRadius+3,1,20);
    const plateMesh = new Mesh(plateGeo,new MeshStandardMaterial({
      map:colorTextureW,
      aoMap:aoTextureW,
      normalMap:normalTextureW,
      displacementMap:heightTextureW,
      displacementBias:-0.4,
      side:DoubleSide
    }))
    plateMesh.position.set(0,this.pillarHeight/2,0)
    
    

    group.add(rinMesh,beams,plateMesh);
    return group;
  }
  genRockMiddle(){
    const geo = new CylinderGeometry(this.mainRadius+2,this.mainRadius+2,8,30,30);
    const setting = (...textures:Texture[])=>{
      textures.forEach(texture=>{
        texture.minFilter = NearestFilter;
        texture.magFilter = NearestFilter;
        texture.generateMipmaps = false; //節省效能
        texture.repeat.x = 8;
        texture.repeat.y = 2;
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
      })
    }
    setting(colorTexture3,aoTexture3,heightTexture3,normalTexture3)
    const mat =  new MeshStandardMaterial({
      map:colorTexture3,
      aoMap:aoTexture3,
      displacementMap:heightTexture3,
      normalMap:normalTexture3,
      displacementBias:-1
    });
    const mesh = new Mesh(geo,mat)
    mesh.position.y = 4+ this.pillarHeight/2;
    return mesh;
  }

  genRoof(){
    const geo = new ConeGeometry(this.mainRadius+4,10,30,30);
    
    const mat =  new MeshStandardMaterial({
      color:new Color('brown'),
      map:colorTexture3,
      aoMap:aoTexture3,
      displacementMap:heightTexture3,
      normalMap:normalTexture3,
      displacementBias:-1
    });
    const mesh = new Mesh(geo,mat)
    mesh.position.y = 13+ this.pillarHeight/2;
    return mesh;
  }

  genBase(){
    const points = [];
    const size = 5;
    for ( let i = 1; i <= size; i ++ ) {
      const v= new Vector2( (-Math.pow(2,(i-1)) + 1) * 0.8 , -i*5);
      points.push(v);
    }
    const coneGeo = new LatheGeometry( points,50 );
    const baseColorMap = colorTexture2A.clone();
    baseColorMap.wrapS = RepeatWrapping;
    baseColorMap.wrapT = RepeatWrapping;
    baseColorMap.repeat = new Vector2(10,10)
    const mat = new MeshStandardMaterial({
      color:0xb9d5ff,
      map:baseColorMap,
      side:DoubleSide
    })
    const base = new Mesh(
      coneGeo,
      mat
    )

    base.position.y = size*3 ;

    return base;
  }
  genMesh(){
    const group = new Group();
    const main = this.genBody();
    const bricks = this.genBricks();
    const base = this.genBase();
    const middleW = this.genWoodenMiddle();
    const middleR = this.genRockMiddle();
    const roof = this.genRoof()

    group.add(main,bricks,base,middleW,middleR,roof);
    group.position.set(0,0,10);
    group.rotation.x = Math.PI/60;
    group.traverse(function(o) {
      if ((o as Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    
    return group;
  }
}

window.onload = () => {
  main();
}
import { AxesHelper, Clock, PerspectiveCamera, PlaneGeometry, Scene, TextureLoader, WebGLRenderer,LoadingManager, MeshToonMaterial, Mesh, AmbientLight, DirectionalLight,NearestFilter,Texture, RepeatWrapping, Fog, PointLight, MeshStandardMaterial, CylinderGeometry } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { debounce } from 'lodash';



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


function main() {
  const {scene,renderer,camera,clock,axis} = new RenderEnv();
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
    dLight.position.set(5,5,5)

    scene.add(camera,axis,aLight,dLight)
    
    const fog = new Fog(clearColor,1,60);
    scene.fog = fog;

    document.body.appendChild(renderer.domElement);
    renderer.setClearColor(clearColor) // 把背景色設置為透明
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio);

    window.addEventListener('resize', debounce(() => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, 200))

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true;
  

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
    return new PlaneGeometry(100,100,100,100);
  }
  genMaterial(){
    // const gradientTexture = textureLoader.load(require('@img/gradients/gradA.jpg'));
    const setting = (...textures:Texture[])=>{
      textures.forEach(texture=>{
        texture.minFilter = NearestFilter;
        texture.magFilter = NearestFilter;
        texture.generateMipmaps = false; //節省效能
        texture.repeat.x = 4;
        texture.repeat.y = 4;
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
    return mesh;
  }
}

class Castle{
  mesh:Mesh;
  constructor(){
    this.init();
  }
  init(){
    this.mesh = this.genMesh();
  }
  genGeometry(){
    return new CylinderGeometry(10,7,20,100,100)
  }
  genMaterial(){
    return new MeshStandardMaterial({
      color:0xb9d5ff,
      map:colorTexture
    })
  }
  genMesh(){
    return new Mesh(
      this.genGeometry(),
      this.genMaterial()
    )
  }
}

window.onload = () => {
  main();
}
import { AxesHelper, BoxGeometry, LoadingManager, MeshBasicMaterial, PerspectiveCamera, Scene, TextureLoader, WebGLRenderer,Mesh, RepeatWrapping, NearestFilter } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { debounce } from 'lodash';

function main() {
  const scene = new Scene();
  
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
  const textureImages = document.querySelectorAll('.source img');
  const textureUrls = Array.prototype.slice.call(textureImages).map((ele:HTMLImageElement)=>ele.src);
  const textures = (()=>{
    const obj :{[key: string]: any} = {};
    textureUrls.forEach((val:string)=>{
      const name = val.replace(/(.*)(\/)(.*)(\.)(.*)/g,`$3`);
      obj[name] = textureLoader.load(val);
    })
    return obj;
  })()

  textures.color.repeat.x = 2;
  textures.color.repeat.y = 3;

  textures.color.wrapS = RepeatWrapping;
  textures.color.wrapT = RepeatWrapping;
  textures.color.offset.x = 0.5;

  textures.color.rotation = Math.PI / 4;
  textures.color.center.x = 0.5;
  textures.color.center.y = 0.5;

  textures.color.minFilter = NearestFilter;


  const geo = new BoxGeometry(1,1,1);
  const mat = new MeshBasicMaterial({map:textures.color})
  const mesh = new Mesh(geo,mat);

  scene.add(mesh);

  const axis = new AxesHelper(5);
  scene.add(axis);

  //camera
  const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;
  scene.add(camera);

  //renderer
  const renderer = new WebGLRenderer({
    antialias: true, // 反鋸齒
    alpha: true // 開放渲染rgba透明通道
  })
  document.body.appendChild(renderer.domElement);
  renderer.setClearColor(0x000000, 0) // 把背景色設置為透明
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio);

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true;

  window.addEventListener('resize', debounce(() => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, 200))

  const tick = () => {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  tick();
}


window.onload = () => {
  main();
}
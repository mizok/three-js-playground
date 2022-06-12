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
  const aoTexture = textureLoader.load(require('@img/door-wood/ao.jpg'));
  const heightTexture = textureLoader.load(require('@img/door-wood/height.png'));
  const colorTexture = textureLoader.load(require('@img/door-wood/color.jpg'));
  const normalTexture = textureLoader.load(require('@img/door-wood/normal.jpg'));

  colorTexture.repeat.x = 2;
  colorTexture.repeat.y = 3;

  colorTexture.wrapS = RepeatWrapping;
  colorTexture.wrapT = RepeatWrapping;
  colorTexture.offset.x = 0.5;

  colorTexture.rotation = Math.PI / 4;
  colorTexture.center.x = 0.5;
  colorTexture.center.y = 0.5;

  colorTexture.minFilter = NearestFilter;
  colorTexture.magFilter = NearestFilter;


  const geo = new BoxGeometry(1,1,1);
  const mat = new MeshBasicMaterial({map:colorTexture})
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
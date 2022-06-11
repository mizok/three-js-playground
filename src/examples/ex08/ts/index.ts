import { AxesHelper,  LoadingManager,  PerspectiveCamera, Scene, TextureLoader, WebGLRenderer,Mesh,  SphereGeometry, PlaneGeometry, TorusGeometry,  Clock, DoubleSide, MeshNormalMaterial, MeshDepthMaterial, MeshLambertMaterial, AmbientLight, PointLight, Color, MeshPhongMaterial, MeshToonMaterial, NearestFilter, MeshStandardMaterial, BufferAttribute, CubeTextureLoader } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { debounce } from 'lodash';
const envNx = require('@img/env-map/nx.jpg');
const envPx = require('@img/env-map/px.jpg');
const envNy = require('@img/env-map/ny.jpg');
const envPy = require('@img/env-map/py.jpg');
const envNz = require('@img/env-map/nz.jpg');
const envPz = require('@img/env-map/pz.jpg');

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
  const cubeTextureLoader = new CubeTextureLoader(loadingManager);
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

  const envMap = cubeTextureLoader.load([
    envPx,
    envNx,
    envPy,
    envNy,
    envPz,
    envNz
  ])

  // const mat  = new MeshBasicMaterial({map:textures.color});
  // const mat  = new MeshNormalMaterial();
  // mat.flatShading = true;
  // const mat  = new MeshDepthMaterial();
  // const mat  = new MeshLambertMaterial();
  // const mat = new MeshPhongMaterial();
  // mat.shininess = 100;
  // mat.specular = new Color('green');
  // const mat = new MeshToonMaterial();
  // textures.gradA.minFilter = NearestFilter;
  // textures.gradA.magFilter = NearestFilter;
  // textures.gradA.generateMipmaps = false; //節省效能
  // mat.gradientMap = textures.gradA;
  const mat = new MeshStandardMaterial();
  mat.metalness = 0.4;
  mat.roughness = 0.3;
  mat.map = textures.color;
  mat.alphaMap = textures.opacity;
  mat.aoMap = textures.ao;
  mat.displacementMap = textures.height;
  mat.displacementScale = 0.05;
  mat.metalnessMap = textures.metallic;
  mat.roughnessMap = textures.roughness;
  mat.normalMap = textures.normal;
  mat.normalScale.set(0.5,0.5);
  mat.transparent = true;

  const mat2 = new MeshStandardMaterial();
  mat2.metalness = 0.9;
  mat2.roughness = 0.2;
  mat2.envMap = envMap;

  const sphere = new Mesh(
    new SphereGeometry(0.5,16,16),
    mat2
  )

  sphere.position.x = -1.5;

  const plane = new Mesh(
    new PlaneGeometry(1,1,50,50),
    mat
  )

  plane.material.side = DoubleSide;
  plane.geometry.setAttribute('uv2',new BufferAttribute(plane.geometry.attributes.uv.array,2))
  

  const torus = new Mesh(
    new TorusGeometry(0.3,0.2,16,32),
    mat2
  )

  torus.position.x = 1.5;

  scene.add(sphere,plane,torus);

  const alight = new AmbientLight();
  scene.add(alight);
  const light = new PointLight(new Color('white'),1);
  light.position.x = 1;
  light.position.y = 3;
  light.position.z = 5;
  scene.add(light);

  const axis = new AxesHelper(5);
  scene.add(axis);

  //camera
  const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;
  scene.add(camera);

  //renderer
  const renderer = new WebGLRenderer({
    antialias: true, // 反鋸齒
    // alpha: true // 開放渲染rgba透明通道
  })
  document.body.appendChild(renderer.domElement);
  // renderer.setClearColor(0x000000, 0) // 把背景色設置為透明
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio);

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true;

  window.addEventListener('resize', debounce(() => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, 200))

  const clock = new Clock();

  const tick = () => {
    sphere.rotation.y = clock.getElapsedTime() * 0.1;
    torus.rotation.y = clock.getElapsedTime() * 0.1;
    // plane.rotation.y = clock.getElapsedTime() * 0.1;
    sphere.rotation.x = clock.getElapsedTime() * 0.15;
    torus.rotation.x = clock.getElapsedTime() * 0.15;
    // plane.rotation.x = clock.getElapsedTime() * 0.15;
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  tick();
}


window.onload = () => {
  main();
}
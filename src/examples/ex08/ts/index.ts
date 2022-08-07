import { AxesHelper, LoadingManager, PerspectiveCamera, Scene, TextureLoader, WebGLRenderer, Mesh, SphereGeometry, PlaneGeometry, TorusGeometry, Clock, DoubleSide, MeshNormalMaterial, MeshDepthMaterial, MeshLambertMaterial, AmbientLight, PointLight, Color, MeshPhongMaterial, MeshToonMaterial, NearestFilter, MeshStandardMaterial, BufferAttribute, CubeTextureLoader } from 'three';
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

  loadingManager.onStart = () => {
    console.log('texture load start')
  }
  loadingManager.onLoad = () => {
    console.log('texture loaded')
  }
  loadingManager.onError = () => {
    console.log('texture load error')
  }
  const cubeTextureLoader = new CubeTextureLoader(loadingManager);
  const textureLoader = new TextureLoader(loadingManager);
  const aoTexture = textureLoader.load(require('@img/door-wood/ao.jpg'));
  const heightTexture = textureLoader.load(require('@img/door-wood/height.png'));
  const colorTexture = textureLoader.load(require('@img/door-wood/color.jpg'));
  const alphaTexture = textureLoader.load(require('@img/door-wood/opacity.jpg'));
  const metallicTexture = textureLoader.load(require('@img/door-wood/metallic.jpg'));
  const roughnessTexture = textureLoader.load(require('@img/door-wood/roughness.jpg'));
  const normalTexture = textureLoader.load(require('@img/door-wood/normal.jpg'));
  const gradATexture = textureLoader.load(require('@img/gradients/gradA.jpg'));
  const gradBTexture = textureLoader.load(require('@img/gradients/gradB.jpg'));

  const envMap = cubeTextureLoader.load([
    envPx,
    envNx,
    envPy,
    envNy,
    envPz,
    envNz
  ])

  // const mat  = new MeshBasicMaterial({map:colorTexture});
  // const mat  = new MeshNormalMaterial();
  // mat.flatShading = true; // 把顏色變成一格一格的樣子
  // const mat = new MeshMatcapMaterial(); // 一種需要球型漸層的材質, 不接受光源, 但是他會藉由材質來渲染得像是有受光的樣子 
  //mat.matcap = matcapTexture;
  // const mat  = new MeshDepthMaterial(); // 一種材質, 他會根據距離 遠近平面的距離來決定要渲染出偏白(近)或黑（遠）的顏色
  // const mat  = new MeshLambertMaterial(); // 耗能最少的可受光材質
  // const mat = new MeshPhongMaterial(); // 耗能比Lamber略多的可受光材質, 有反射光點的設計
  // mat.shininess = 100;
  // mat.specular = new Color('green');
  // const mat = new MeshToonMaterial(); // 卡通式的上色
  // gradATexture.minFilter = NearestFilter;
  // gradATexture.magFilter = NearestFilter;
  // gradATexture.generateMipmaps = false; //節省效能
  // mat.gradientMap = gradATexture;
  const mat = new MeshStandardMaterial();
  mat.metalness = 0.4;
  mat.roughness = 0.3;
  mat.map = colorTexture;
  mat.alphaMap = alphaTexture;
  mat.aoMap = aoTexture;
  mat.displacementMap = heightTexture;
  mat.displacementScale = 0.05;
  mat.metalnessMap = metallicTexture;
  mat.roughnessMap = roughnessTexture;
  mat.normalMap = normalTexture;
  mat.normalScale.set(0.5, 0.5);
  mat.transparent = true;

  const mat2 = new MeshStandardMaterial();
  mat2.metalness = 0.9;
  mat2.roughness = 0.2;
  mat2.envMap = envMap;

  const sphere = new Mesh(
    new SphereGeometry(0.5, 16, 16),
    mat2
  )

  sphere.position.x = -1.5;

  const plane = new Mesh(
    new PlaneGeometry(1, 1, 50, 50),
    mat
  )

  plane.material.side = DoubleSide;
  plane.geometry.setAttribute('uv2', new BufferAttribute(plane.geometry.attributes.uv.array, 2))


  const torus = new Mesh(
    new TorusGeometry(0.3, 0.2, 16, 32),
    mat2
  )

  torus.position.x = 1.5;

  scene.add(sphere, plane, torus);

  const alight = new AmbientLight();
  scene.add(alight);
  const light = new PointLight(new Color('white'), 1);
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
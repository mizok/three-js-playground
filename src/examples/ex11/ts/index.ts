import { AmbientLight, AxesHelper, BoxGeometry, BufferAttribute, BufferGeometry, CameraHelper, Clock, DirectionalLight, DirectionalLightHelper, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, Scene, SphereGeometry, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { debounce } from 'lodash';

function main() {
  const scene = new Scene();
  const material = new MeshStandardMaterial();
  const sphereGeo = new SphereGeometry(1,40,40);
  const planeGeo = new PlaneGeometry(50,50,30,30);
  
  const sphereMesh = new Mesh(sphereGeo, material);
  const planeMesh = new Mesh(planeGeo, material);

  sphereMesh.castShadow = true;
  planeMesh.receiveShadow = true;

  planeMesh.rotation.x = - Math.PI /2;
  planeMesh.position.y = - 2;

  scene.add(sphereMesh,planeMesh);

  //light
  const aLight = new AmbientLight(0xffffff,0.3);
  const dLight = new DirectionalLight(0xffffff,0.5);


  dLight.position.set(2,2,2);
  dLight.shadow.mapSize.width = 1024;
  dLight.shadow.mapSize.height = 1024;
  dLight.shadow.radius  = 10;

  dLight.castShadow = true;

  const dLightShadowCamera = dLight.shadow.camera;
  const dLightShadowCameraHelper = new CameraHelper(dLightShadowCamera);
  dLightShadowCamera.near = 1;
  dLightShadowCamera.far = 10;
  dLightShadowCamera.top = 2;
  dLightShadowCamera.bottom = -2;
  dLightShadowCamera.left = -2;
  dLightShadowCamera.right = 2;
  requestAnimationFrame(()=>{
    dLightShadowCameraHelper.update();
  })


  scene.add(aLight,dLight,dLightShadowCamera,dLightShadowCameraHelper);

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

  renderer.shadowMap.enabled = true;

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
import { AmbientLight, AxesHelper, BoxGeometry, BufferAttribute, BufferGeometry, Clock, Color, DirectionalLight, DirectionalLightHelper, HemisphereLight, HemisphereLightHelper, Mesh, MeshBasicMaterial, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, PointLight, PointLightHelper, RectAreaLight, Scene, SphereGeometry, SpotLight, SpotLightHelper, TorusGeometry, Vector3, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {RectAreaLightHelper} from 'three/examples/jsm/helpers/RectAreaLightHelper';
import { debounce } from 'lodash';

function main() {
  const scene = new Scene();
  const mat = new MeshStandardMaterial();
  mat.roughness = 0.4;

  const boxGeo = new BoxGeometry(1,1,1,40,40);
  const torusGeo = new TorusGeometry(0.5,0.25,40,40);
  const sphereGeo = new SphereGeometry(0.5,40,40);
  const planeGeo = new PlaneGeometry(10,10,40,40);

  const boxMesh = new Mesh(boxGeo,mat);
  const torusMesh = new Mesh(torusGeo,mat);
  const sphereMesh = new Mesh(sphereGeo,mat);
  const planeMesh = new Mesh(planeGeo,mat);

  torusMesh.position.x = 2;
  sphereMesh.position.x = -2;
  planeMesh.rotation.x = - Math.PI /2;
  planeMesh.position.y = -1;

  scene.add(boxMesh,torusMesh,sphereMesh,planeMesh);

  const aLight = new AmbientLight(new Color('white'),0.5);
  const dLight = new DirectionalLight(0x00fffc,0.3);
  const hsLight = new HemisphereLight(0xff0000,0x0000ff,0.3);
  const pLight = new PointLight(0xff9000,0.5);
  const spLight = new SpotLight(0x78ff00,0.5,10,Math.PI * 0.1,0.25,1);
  const rLight = new RectAreaLight(0x4e00ff,4,10,2);
  aLight.position.set(1,0.25,0);
  spLight.position.set(0,2,3);
  scene.add(aLight,dLight,hsLight,pLight,spLight,spLight.target,rLight); 
  spLight.target.position.set(3,0,0);

  const dLightHelper = new DirectionalLightHelper(dLight);
  const hsLightHelper = new HemisphereLightHelper(hsLight,0.2);
  const pLightHelper = new PointLightHelper(pLight);
  const spLightHelper = new SpotLightHelper(spLight);
  const rLightHelper = new RectAreaLightHelper(rLight);

  requestAnimationFrame(()=>{
    spLightHelper.update();
  })

  scene.add(dLightHelper,hsLightHelper,pLightHelper,spLightHelper,rLightHelper);

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
  const clock = new Clock();
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

  const tick = () => {
    boxMesh.rotation.x = clock.getElapsedTime() / 5;
    sphereMesh.rotation.x = clock.getElapsedTime() / 5;
    torusMesh.rotation.x = clock.getElapsedTime() / 5;
    boxMesh.rotation.y = clock.getElapsedTime() / 5;
    sphereMesh.rotation.y = clock.getElapsedTime() / 5;
    torusMesh.rotation.y = clock.getElapsedTime() / 5;
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  tick();
}


window.onload = () => {
  main();
}
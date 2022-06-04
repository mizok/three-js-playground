import { AxesHelper, BoxGeometry, BufferAttribute, BufferGeometry, Clock, Group, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { debounce } from 'lodash';

function main() {
  const scene = new Scene();
  const material = new MeshBasicMaterial({
    color: 'red',
    wireframe: true
  })
  const size = 50
  const diameter = 5;
  const positionArr = new Float32Array(size * 3 * 3)
  positionArr.forEach((val, index) => {
    positionArr[index] = Math.random() * diameter - 0.5 * diameter;
  })
  const positionAttribute = new BufferAttribute(positionArr, 3);
  const geo = new BufferGeometry();
  geo.setAttribute('position', positionAttribute);
  const mesh = new Mesh(geo, material);

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
  const clock = new Clock();
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
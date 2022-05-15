import { AxesHelper, BoxGeometry, Group, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer } from 'three';

function main() {
  const scene = new Scene();
  const geometry = new BoxGeometry(1, 1, 1);
  const material = new MeshBasicMaterial({
    color: 'red'
  })
  const mesh1 = new Mesh(geometry, material);
  mesh1.position.set(2, 0, 0)
  const mesh2 = new Mesh(geometry, material);
  const mesh3 = new Mesh(geometry, material);
  mesh3.position.set(-2, 0, 0)

  const group = new Group();
  group.add(mesh1);
  group.add(mesh2);
  group.add(mesh3);
  group.position.set(1, 0, 0);
  group.scale.set(1, 2, 1);

  scene.add(group);

  const axis = new AxesHelper(5);
  scene.add(axis);

  //camera
  const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;
  camera.lookAt(group.position);
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
  renderer.render(scene, camera)
}


window.onload = () => {
  main();
}
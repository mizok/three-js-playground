import { AxesHelper, BoxGeometry, Clock, Group, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer } from 'three';

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

  scene.add(group);

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

  const cursor = {
    x: 0,
    y: 0
  }

  window.addEventListener('mousemove', (ev) => {
    cursor.x = (ev.clientX / window.innerWidth - 0.5) * 2
    cursor.y = -(ev.clientY / window.innerHeight - 0.5) * 2
  })

  const tick = () => {
    camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 2;
    camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 2;
    camera.position.y = cursor.y * 3;
    camera.lookAt(group.position);
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  tick();
}


window.onload = () => {
  main();
}
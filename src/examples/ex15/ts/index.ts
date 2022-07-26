import { AmbientLight, AxesHelper, Clock, DirectionalLight, Mesh, MeshStandardMaterial, PerspectiveCamera, PointLight, Raycaster, Scene, SphereGeometry, Vector3, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { debounce } from 'lodash';

function main() {
  const { scene, renderer, camera, clock, axis } = new RenderEnv();
  const geo0 = new SphereGeometry(1, 100, 100);
  const geo1 = geo0.clone();
  const geo2 = geo0.clone();

  const mat = new MeshStandardMaterial({ color: 0xff0000 })
  const mesh0 = new Mesh(geo0, mat);
  const mesh1 = new Mesh(geo1, mat);
  const mesh2 = new Mesh(geo2, mat);
  mesh0.position.set(-3, 0, 0)
  mesh2.position.set(3, 0, 0)

  scene.add(mesh0, mesh1, mesh2);

  const rayCasterOrigin = new Vector3(-6, 0, 0)
  const rayCasterDirection = new Vector3(10, 0, 0).normalize();

  const rayCaster = new Raycaster(rayCasterOrigin, rayCasterDirection);

  const intersect = rayCaster.intersectObject(mesh2)

  const intersects = rayCaster.intersectObjects([mesh0, mesh1, mesh2])

  console.log(intersect, intersects)

}

class RenderEnv {
  scene: Scene;
  axis: AxesHelper;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  clock: Clock;
  constructor() {
    this.init();
  }
  init() {
    Object.assign(this, this.getSceneRenderReady());
  }

  getSceneRenderReady() {
    const clock = new Clock();
    const scene = new Scene();
    const renderer = new WebGLRenderer({
      antialias: true, // 反鋸齒
      alpha: true // 開放渲染rgba透明通道
    })
    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    const axis = new AxesHelper(5);

    const aLight = new AmbientLight(0xffffff, 0.1);
    const dLight = new DirectionalLight(0xffffff, 1)

    dLight.position.set(1, 1, 1)

    scene.add(camera, axis, aLight, dLight)


    document.body.appendChild(renderer.domElement);
    renderer.setClearColor(0x000000, 0) // 把背景色設置為透明
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

    return { scene, renderer, camera, clock, axis };
  }
}


window.onload = () => {
  main();
}
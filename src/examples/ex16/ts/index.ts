import { AmbientLight, AxesHelper, BoxGeometry, Clock, ConeGeometry, DirectionalLight, Mesh, MeshStandardMaterial, PerspectiveCamera, Scene, TorusGeometry, TorusKnotGeometry, Vector2, Vector3, WebGLRenderer } from 'three';
import { debounce } from 'lodash';

function main() {
  const { scene, renderer, camera, clock, axis } = new RenderEnv();
  const torusGeo = new TorusGeometry(1, 0.5, 50, 50);
  const coneGeo = new ConeGeometry(1, 2, 30, 30);
  const torusKnotGeo = new TorusKnotGeometry(1, 0.5, 50, 50);
  const mat = new MeshStandardMaterial({
    color: 0xff0000,
  })
  const torusMesh = new Mesh(torusGeo, mat.clone());
  const coneMesh = new Mesh(coneGeo, mat.clone());
  const torusKnotMesh = new Mesh(torusKnotGeo, mat.clone());
  const gap = 10;
  coneMesh.position.set(0, -1 * gap, 0);
  torusKnotMesh.position.set(0, -2 * gap, 0);
  const meshs = [torusMesh, coneMesh, torusKnotMesh]
  scene.add(...meshs);

  document.body.addEventListener('scroll', () => {
    const progress = document.body.scrollTop / (document.body.scrollHeight - document.body.getBoundingClientRect().height);
    const y = -progress * gap * (meshs.length - 1);
    camera.position.setY(y);
  })
}


class RenderEnv {
  scene: Scene;
  axis: AxesHelper;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  clock: Clock;
  cursor: Vector2;
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
    axis.visible = false;
    const aLight = new AmbientLight(0xffffff, 0.3);
    const dLight = new DirectionalLight(0xffffff, 1);
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


    const tick = () => {
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
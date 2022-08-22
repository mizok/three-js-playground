import { AmbientLight, AnimationMixer, AxesHelper, BufferGeometry, Clock, PerspectiveCamera, PointLight, Scene, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { debounce } from 'lodash';

const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();

let resolve1: (value?: unknown) => void;

const hamburgerModelLoaded = new Promise((res) => {
  resolve1 = res;
});
gltfLoader.load('../static/models/Hamburger/hamburger.gltf', (gltf) => {
  resolve1(gltf)
})



function main() {
  let env: RenderEnv;
  const { scene, renderer, camera, clock, axis } = env = new RenderEnv();
  hamburgerModelLoaded.then((gltf: any) => {
    const hamburger = gltf?.scene;
    scene.add(hamburger)
  })


}


class RenderEnv {
  scene: Scene;
  axis: AxesHelper;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  clock: Clock;
  frameListener: (time: number) => void = (time) => { }
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
    const aL = new AmbientLight(0xffffff);
    const pL = new PointLight(0xffffff, 1);
    pL.position.set(5, 5, 5)
    scene.add(camera, axis, aL, pL)

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
      this.frameListener(clock.getElapsedTime())
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
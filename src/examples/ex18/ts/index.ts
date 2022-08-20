import { AmbientLight, AxesHelper, BufferGeometry, Clock, PerspectiveCamera, PointLight, Scene, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { debounce } from 'lodash';

const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();

let resolve1: (value?: unknown) => void;
let resolve2: (value?: unknown) => void;
let resolve3: (value?: unknown) => void;

const duckModelLoaded = new Promise((res) => {
  resolve1 = res;
});
gltfLoader.load('../static/models/Duck/glTF/Duck.gltf', (gltf) => {
  resolve1(gltf)
})

const helmetModelLoaded = new Promise((res) => {
  resolve2 = res;
});
gltfLoader.load('../static/models/FlightHelmet/glTF/FlightHelmet.gltf', (gltf) => {
  resolve2(gltf)
})

dracoLoader.setDecoderPath('../static/draco/')
const dracoDuckModelLoaded = new Promise((res) => {
  resolve3 = res;
});

gltfLoader.setDRACOLoader(dracoLoader)
gltfLoader.load('../static/models/Duck/glTF-Draco/Duck.gltf', (gltf) => {
  resolve3(gltf)
})


function main() {
  const { scene, renderer, camera, clock, axis } = new RenderEnv();
  duckModelLoaded.then((gltf: any) => {
    const duck = gltf?.scene?.children[0];
    duck.position.setY(1)
    duck.scale.set(0.01, 0.01, 0.01)
    scene.add(duck)
  })

  helmetModelLoaded.then((gltf: any) => {
    const helmet = [...gltf?.scene?.children];
    scene.add(...helmet)
  })

  dracoDuckModelLoaded.then((gltf: any) => {
    const duck = gltf?.scene?.children[0];
    duck.position.setY(3)
    duck.scale.set(0.01, 0.01, 0.01)
    scene.add(duck)
  })
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
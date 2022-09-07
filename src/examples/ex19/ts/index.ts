import { ACESFilmicToneMapping, AmbientLight, AxesHelper, Clock, CubeTextureLoader, DirectionalLight, Group, Mesh, MeshStandardMaterial, PCFSoftShadowMap, PerspectiveCamera, ReinhardToneMapping, Scene, sRGBEncoding, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { debounce } from 'lodash';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GUI } from 'dat.gui'

const envNx = require('@img/env-map/nx.jpg');
const envPx = require('@img/env-map/px.jpg');
const envNy = require('@img/env-map/ny.jpg');
const envPy = require('@img/env-map/py.jpg');
const envNz = require('@img/env-map/nz.jpg');
const envPz = require('@img/env-map/pz.jpg');

const cubeTextureLoader = new CubeTextureLoader();
const envMap = cubeTextureLoader.load([
  envPx,
  envNx,
  envPy,
  envNy,
  envPz,
  envNz
])
const gltfLoader = new GLTFLoader();
const pm = new Promise((res) => {
  gltfLoader.load('../static/models/Hamburger/hamburger.gltf', (gltf) => {
    res(gltf);
  });
})

const debugObject = { envMapIntensity: 1 }


function main() {
  const { scene, renderer, camera, clock, axis, dl } = new RenderEnv();
  renderer.outputEncoding = sRGBEncoding;
  renderer.toneMapping = ReinhardToneMapping;
  renderer.toneMappingExposure = 2

  //gui
  const gui = new GUI();
  gui.add(dl, 'intensity').min(0).max(10).step(0.001).name('lightIntensity')
  gui.add(dl.position, 'x').min(- 5).max(5).step(0.001).name('lightX')
  gui.add(dl.position, 'y').min(- 5).max(5).step(0.001).name('lightY')
  gui.add(dl.position, 'z').min(- 5).max(5).step(0.001).name('lightZ')


  scene.background = envMap;

  const updateAllMaterials = (scene: Group) => {
    scene.traverse((child: any) => {
      if ((child as Mesh).isMesh && (child.material as MeshStandardMaterial).isMeshStandardMaterial) {
        child.material.envMap = envMap;
        child.material.needsUpdate = true;
        child.castShadow = true
        child.receiveShadow = true
        child.material.envMapIntensity = debugObject.envMapIntensity
      }
    })
  }

  pm.then((gltf: any) => {
    gltf.scene.scale.set(6, 6, 6)
    gltf.scene.position.set(0, - 2, 0)
    gltf.scene.rotation.y = Math.PI * -0.3

    gui.add(gltf.scene.rotation, 'y').min(- Math.PI).max(Math.PI).step(0.001).name('rotation');
    gui.add(debugObject, 'envMapIntensity').min(0).max(10).step(0.001).onChange(() => {
      updateAllMaterials(gltf.scene)
    })
    /**
 * Update all materials
 */
    updateAllMaterials(gltf.scene);
    scene.add(gltf.scene);
  })
}



class RenderEnv {
  scene: Scene;
  axis: AxesHelper;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  clock: Clock;
  dl: DirectionalLight;
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
    })
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap
    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    const axis = new AxesHelper(5);
    const al = new AmbientLight(0xffffff, 0.3);
    const dl = new DirectionalLight(0xffffff, 0.8);
    dl.shadow.normalBias = 0.05
    dl.castShadow = true
    dl.shadow.camera.far = 15
    dl.shadow.mapSize.set(1024, 1024)
    dl.position.set(3, 3, 3);
    scene.add(camera, axis, al, dl)


    document.body.appendChild(renderer.domElement);
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

    return { scene, renderer, camera, clock, axis, dl };
  }
}


window.onload = () => {
  main();
}
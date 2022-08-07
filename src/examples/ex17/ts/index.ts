import { AmbientLight, AxesHelper, Clock, CubeTextureLoader, DirectionalLight, Mesh, MeshMatcapMaterial, MeshPhongMaterial, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, PointLight, Scene, SphereGeometry, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { debounce } from 'lodash';
import { Shape, Sphere, Vec3, World } from 'cannon-es';

const cbLoader = new CubeTextureLoader();

const envNx = require('@img/env-map/nx.jpg');
const envPx = require('@img/env-map/px.jpg');
const envNy = require('@img/env-map/ny.jpg');
const envPy = require('@img/env-map/py.jpg');
const envNz = require('@img/env-map/nz.jpg');
const envPz = require('@img/env-map/pz.jpg');

const cbMat = cbLoader.load([
  envPx,
  envNx,
  envPy,
  envNy,
  envPz,
  envNz
])



function main() {
  const { scene, renderer, camera, clock, axis } = new RenderEnv();
  const planeGeo = new PlaneGeometry(10, 10, 50, 50);
  const planeMat = new MeshStandardMaterial({
    color: 0xeeeeee,
    metalness: 0.3,
    roughness: 0.6
  })
  const planeMesh = new Mesh(planeGeo, planeMat)
  const ballGeo = new SphereGeometry(0.4, 50, 50);
  const ballMat = new MeshStandardMaterial({
    envMap: cbMat,
    color: 0xffffff,
    metalness: 0.3,
    roughness: 0.4
  })
  const ballMesh = new Mesh(ballGeo, ballMat)
  const ballShape = new Sphere(0.4);

  planeMesh.lookAt(0, 1, 0);
  planeMesh.receiveShadow = true;
  ballMesh.position.set(0, 0.4, 0);
  ballMesh.castShadow = true;


  scene.add(planeMesh, ballMesh);
}


class RenderEnv {
  scene: Scene;
  axis: AxesHelper;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  clock: Clock;
  world: World;
  constructor() {
    this.init();
  }
  init() {
    Object.assign(this, this.getSceneRenderReady());
  }

  getSceneRenderReady() {
    const world = new World({
      gravity: new Vec3(0, -9.82, 0)
    })
    const clock = new Clock();
    const scene = new Scene();
    const renderer = new WebGLRenderer({
      antialias: true, // 反鋸齒
      alpha: true // 開放渲染rgba透明通道
    })
    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    const axis = new AxesHelper(5);

    const aLight = new AmbientLight(0xffffff, 0.3);
    const pLight = new PointLight(0xffffff, 0.5);
    pLight.position.set(3, 3, 3);
    pLight.castShadow = true;
    pLight.shadow.mapSize.width = 2048;
    pLight.shadow.mapSize.height = 2048;
    pLight.shadow.radius = 5;

    scene.add(camera, axis, aLight, pLight)


    document.body.appendChild(renderer.domElement);
    renderer.setClearColor(0x000000, 0) // 把背景色設置為透明
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;


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

    return { scene, renderer, camera, clock, axis, world };
  }
}


window.onload = () => {
  main();
}
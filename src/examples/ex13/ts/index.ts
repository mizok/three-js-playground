import { AdditiveBlending, AxesHelper, BoxGeometry, BufferAttribute, BufferGeometry, Clock, Color, Mesh, MeshBasicMaterial, MeshStandardMaterial, MeshToonMaterial, PerspectiveCamera, PointLight, Points, PointsMaterial, Scene, TextureLoader, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { debounce } from 'lodash';

const textureLoader = new TextureLoader()
const particleTexture = textureLoader.load(require('@img/particles/circle_01.png'));



function main() {
  let env;
  const { scene, renderer, camera, clock, axis } = env = new RenderEnv();
  axis.visible = false;
  // const geo = new BoxGeometry(1, 1, 1, 10, 10, 10);
  const boxGeo = new BoxGeometry(1, 1, 1);
  const boxMat = new MeshBasicMaterial({
    color: new Color('rgb(15,80,45)'),

    opacity: 1,
  })
  const geo = new BufferGeometry();
  const size = 1000;
  const arrP = new Float32Array(size * 3);

  for (let i = 0; i < arrP.length; i++) {
    arrP[i] = (Math.random() * 2 - 1) * 10;
  }
  const attributeP = new BufferAttribute(
    arrP, 3
  )

  const arrC = new Float32Array(size * 3);
  for (let i = 0; i < arrC.length; i++) {
    arrC[i] = Math.random();
  }
  const attributeC = new BufferAttribute(
    arrC, 3
  )

  geo.setAttribute('position', attributeP)
  geo.setAttribute('color', attributeC)

  const mat = new PointsMaterial({
    size: 0.2,
    sizeAttenuation: true,
    alphaMap: particleTexture,
    transparent: true,
    // alphaTest: 0.01,
    depthWrite: false,
    depthTest: true,
    blending: AdditiveBlending,
    vertexColors: true,

  })

  const point = new Points(geo, mat);
  const box = new Mesh(boxGeo, boxMat)
  const pointArr = point.geometry.attributes.position.array
  const position = point.geometry.attributes.position;

  env.frameListener = (time) => {
    position.needsUpdate = true;
    for (let i = 0; i < pointArr.length / 3; i++) {
      position.setY(i, Math.sin(time + position.getX(i)))
    }

  }
  scene.add(point, box);
}


class RenderEnv {
  scene: Scene;
  axis: AxesHelper;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  clock: Clock;
  frameListener: (time: number) => any = (time) => { }
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
    const pl = new PointLight(0xffffff, 3);
    pl.position.set(2, 2, 2);

    scene.add(camera, axis, pl)


    document.body.appendChild(renderer.domElement);
    renderer.setClearColor(0x000000, 1) // 把背景色設置為透明
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
      this.frameListener(clock.getElapsedTime());
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
import { AdditiveBlending, AxesHelper, BufferAttribute, BufferGeometry, Clock, Color, PerspectiveCamera, Points, PointsMaterial, Scene, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { debounce } from 'lodash';
import * as dat from 'dat.gui';

const pram = {
  count: 294900,
  pointSize: 0.01,
  branches: 3,
  radius: 7,
  curveAngle: 260,
  randomness: 0.2,
  innerColor: '#0000ff',
  outerColor: '#ff0000',
  randomPower: 7
}

let env: RenderEnv;
let points: Points;
let geo: BufferGeometry;
let mat: PointsMaterial;


const gui = new dat.GUI();
gui.add(pram, 'count').min(100).max(1000000).step(10).onFinishChange(refreshGalaxy)
gui.add(pram, 'pointSize').min(0.01).max(0.1).step(0.001).onFinishChange(refreshGalaxy)
gui.add(pram, 'branches').min(2).max(99).step(1).onFinishChange(refreshGalaxy)
gui.add(pram, 'radius').min(1).max(10).step(1).onFinishChange(refreshGalaxy)
gui.add(pram, 'curveAngle').min(1).max(360).step(1).onFinishChange(refreshGalaxy)
gui.add(pram, 'randomness').min(0).max(1).step(0.1).onFinishChange(refreshGalaxy)
gui.add(pram, 'randomPower').min(0).max(10).step(1).onFinishChange(refreshGalaxy)
gui.addColor(pram, 'innerColor').onFinishChange(refreshGalaxy)
gui.addColor(pram, 'outerColor').onFinishChange(refreshGalaxy)

function main() {
  const { scene, renderer, camera, clock, axis } = env = new RenderEnv();
  spawnGalaxy();
}

function refreshGalaxy() {
  env.scene.remove(points);
  geo.dispose();
  mat.dispose();
  spawnGalaxy();
}


function spawnGalaxy() {
  geo = new BufferGeometry();
  mat = new PointsMaterial({
    size: pram.pointSize,
    sizeAttenuation: true,
    depthWrite: false,
    vertexColors: true,
    blending: AdditiveBlending
  })
  const innerColor = new Color(pram.innerColor);
  const outerColor = new Color(pram.outerColor);

  const iteration = pram.count * 3
  const posArr = new Float32Array(iteration);
  const colorArr = new Float32Array(iteration);


  for (let i = 0; i < iteration; i = i + 3) {
    const radiusRandom = Math.random();
    const radius = radiusRandom * pram.radius
    const angle = (i / 3) * (2 * Math.PI / pram.branches);
    const curve = (pram.curveAngle / 360) * Math.PI * 2;
    const randomX = Math.pow(Math.random(), pram.randomPower) * (Math.random() < 0.5 ? 1 : - 1) * pram.randomness * radius
    const randomY = Math.pow(Math.random(), pram.randomPower) * (Math.random() < 0.5 ? 1 : - 1) * pram.randomness * radius
    const randomZ = Math.pow(Math.random(), pram.randomPower) * (Math.random() < 0.5 ? 1 : - 1) * pram.randomness * radius

    const color = innerColor.clone().lerp(outerColor, Math.abs(radiusRandom))
    //x
    posArr[i] = radius * Math.cos(angle - Math.abs(radius) * curve) + randomX;
    //y
    posArr[i + 1] = radius * Math.sin(angle - Math.abs(radius) * curve) + randomY;
    //z
    posArr[i + 2] = randomZ;


    colorArr[i] = color.r
    colorArr[i + 1] = color.g
    colorArr[i + 2] = color.b
  }



  const posAttribute = new BufferAttribute(posArr, 3);
  const colorAttribute = new BufferAttribute(colorArr, 3);
  geo.setAttribute('position', posAttribute);
  geo.setAttribute('color', colorAttribute);
  points = new Points(geo, mat);
  env.scene.add(points);
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

    scene.add(camera, axis)


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
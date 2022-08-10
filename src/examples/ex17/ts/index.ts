import { AmbientLight, AxesHelper, BoxGeometry, Clock, CubeTextureLoader, DirectionalLight, DoubleSide, Mesh, MeshMatcapMaterial, MeshPhongMaterial, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, PointLight, Scene, SphereGeometry, Vector3, WebGLRenderer, Quaternion } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { debounce } from 'lodash';
import { Body, Box, ContactEquation, ContactMaterial, Material, SAPBroadphase, Sphere, Vec3, World } from 'cannon-es';
import { GUI } from 'dat.gui'
const hitSound = require('@sound/hit.mp3')
const hit = new Audio(hitSound);
const playHit = (ev: any) => {

  const contact = ev?.contact;
  if (contact instanceof ContactEquation) {
    const impact = contact.getImpactVelocityAlongNormal();
    if (impact > 1.5) {
      hit.volume = Math.random();
      hit.currentTime = 0;
      hit.play();
    }

  }

}


class RenderEnv {
  scene: Scene;
  axis: AxesHelper;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  clock: Clock;
  world: World;
  frameListener: (time: number) => void = (time: number) => { }
  constructor() {
    this.init();
  }
  init() {
    Object.assign(this, this.getSceneRenderReady());
  }

  getSceneRenderReady() {
    const world = new World({
      gravity: new Vec3(0, -9.82, 0),
      allowSleep: true
    })
    world.broadphase = new SAPBroadphase(world)
    const clock = new Clock();
    const scene = new Scene();
    const renderer = new WebGLRenderer({
      antialias: true, // 反鋸齒
      alpha: true // 開放渲染rgba透明通道
    })
    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(-4, 2, -2)
    const axis = new AxesHelper(5);

    const aLight = new AmbientLight(0xffffff, 0.3);
    const pLight = new PointLight(0xffffff, 0.5);
    pLight.position.set(3, 3, 3);
    pLight.castShadow = true;
    pLight.shadow.mapSize.width = 1024;
    pLight.shadow.mapSize.height = 1024;
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
      this.frameListener(clock.getElapsedTime())
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    }

    tick();

    return { scene, renderer, camera, clock, axis, world };
  }
}

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

const defaultMat = new Material('default');
const contactMaterial = new ContactMaterial(defaultMat, defaultMat, {
  friction: 0.2,
  restitution: 0.3
})
let env: RenderEnv;
const { scene, renderer, camera, clock, axis, world } = env = new RenderEnv();
world.addContactMaterial(contactMaterial);
const objectToUpdate: { body: Body, mesh: Mesh }[] = []


const gui = new GUI();
var obj = {
  addBall: function () {
    const pos = new Vec3(
      (Math.random() - 0.5) * 10,
      Math.random() * 10,
      (Math.random() - 0.5) * 10,
    )
    createBall(Math.random(), pos)
  },
  addBox: function () {
    const size = new Vec3(
      Math.random(),
      Math.random(),
      Math.random()
    )
    const pos = new Vec3(
      (Math.random() - 0.5) * 10,
      Math.random() * 10,
      (Math.random() - 0.5) * 10,
    )
    if (pos.y < size.y / 2) {
      pos.y = size.y / 2
    }
    createBox(size, pos)
  },
  reset: () => {
    for (const obj of objectToUpdate) {
      obj.body.removeEventListener('collide', playHit);
      world.removeBody(obj.body)
      scene.remove(obj.mesh)
    }
    objectToUpdate.length = 0;
  }
};
gui.add(obj, "addBall").name("addBall");
gui.add(obj, "addBox").name("addBox");
gui.add(obj, "reset").name("reset");


const ballGeo = new SphereGeometry(1, 20, 20);
const ballMat = new MeshStandardMaterial({
  envMap: cbMat,
  color: 0xffffff,
  metalness: 0.3,
  roughness: 0.4
})

function createBall(ballRadius = 0.4, position = new Vec3(0, 10, 0)) {
  if (position.y < ballRadius) {
    position.y = ballRadius;
  }

  const ballMesh = new Mesh(ballGeo, ballMat)
  ballMesh.scale.set(ballRadius, ballRadius, ballRadius)
  const ballShape = new Sphere(ballRadius);
  const ballBody = new Body({
    position: position,
    mass: 1,
    shape: ballShape,
    material: defaultMat
  })
  ballBody.addEventListener('collide', playHit)
  ballMesh.castShadow = true;
  world.addBody(ballBody);
  scene.add(ballMesh);
  objectToUpdate.push({ body: ballBody, mesh: ballMesh });
}

const boxGeo = new BoxGeometry(1, 1, 1, 20, 20, 20);
const boxMat = new MeshStandardMaterial({
  envMap: cbMat,
  color: 0xffffff,
  metalness: 0.3,
  roughness: 0.4
})

function createBox(boxSize = new Vec3(), position = new Vec3(0, 10, 0)) {

  const boxMesh = new Mesh(boxGeo, boxMat);
  boxMesh.scale.set(boxSize.x * 2, boxSize.y * 2, boxSize.z * 2);
  const boxShape = new Box(boxSize);
  const boxBody = new Body({
    position: position,
    mass: 1,
    shape: boxShape,
    material: defaultMat
  })
  boxBody.addEventListener('collide', playHit)
  boxMesh.castShadow = true;
  world.addBody(boxBody);
  scene.add(boxMesh);
  objectToUpdate.push({ body: boxBody, mesh: boxMesh });
}


function main() {

  const planeGeo = new PlaneGeometry(10, 10, 20, 20);
  const planeMat = new MeshStandardMaterial({
    color: 0xeeeeee,
    metalness: 0.3,
    roughness: 0.6,
    side: DoubleSide
  })
  const planeMesh = new Mesh(planeGeo, planeMat)
  const planeShape = new Box(new Vec3(5, 1, 5));
  const planeBody = new Body({
    position: new Vec3(0, -1, 0),
    mass: 0,
    shape: planeShape,
    material: defaultMat
  })
  world.addBody(planeBody);
  planeMesh.lookAt(0, 1, 0);
  planeMesh.receiveShadow = true;

  scene.add(planeMesh);

  let pvTime = 0;
  env.frameListener = (time: number) => {
    const fps = 60;
    const dt = time - pvTime;
    pvTime = time;
    world.step(1 / fps, dt, 3);
    for (const o of objectToUpdate) {
      const pos = Object.assign(new Vector3(), o.body.position);
      const rotation = Object.assign(new Quaternion(), o.body.quaternion);
      o.mesh.position.copy(pos);
      o.mesh.quaternion.copy(rotation);
    }
  }
}





window.onload = () => {
  main();
}
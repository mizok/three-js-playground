import { AmbientLight, AxesHelper, BoxGeometry, Clock, CubeTextureLoader, DirectionalLight, DoubleSide, Mesh, MeshMatcapMaterial, MeshPhongMaterial, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, PointLight, Scene, SphereGeometry, Vector3, WebGLRenderer, Quaternion, Fog, Color, SpotLight, PointLightHelper, Group, CylinderGeometry } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { debounce } from 'lodash';
import { Body, Box, ContactEquation, ContactMaterial, Cylinder, Material, Plane, SAPBroadphase, Sphere, Vec3, World } from 'cannon-es';
import { GUI } from 'dat.gui'
import { CSG } from 'three-csg-ts';
import CannonDebugger from 'cannon-es-debugger';
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
let controllable: { [key: string]: any } = {}


class RenderEnv {
  scene: Scene;
  axis: AxesHelper;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  clock: Clock;
  world: World;
  clearColor: Color = new Color(0x333333);
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

    const aLight = new AmbientLight(0xffffff, 0.5);
    const pLight = new PointLight(0xffffff, 0.5);
    pLight.position.set(4, 4, 4);
    pLight.castShadow = true;
    pLight.shadow.mapSize.width = 1024;
    pLight.shadow.mapSize.height = 1024;
    pLight.shadow.radius = 5;

    scene.add(camera, axis, aLight, pLight)
    const fog = new Fog(this.clearColor, 1, 30);
    scene.fog = fog;

    document.body.appendChild(renderer.domElement);
    renderer.setClearColor(this.clearColor, 1)
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


const defaultMat = new Material('default');
const contactMaterial = new ContactMaterial(defaultMat, defaultMat, {
  friction: 0.2,
  restitution: 0.3,
})
let env: RenderEnv;
const { scene, renderer, camera, clock, axis, world } = env = new RenderEnv();
world.addContactMaterial(contactMaterial);
const objectToUpdate: { body: Body, mesh: Mesh }[] = []


const gui = new GUI();
var obj = {
  reload: () => {
    controllable?.cannon?.reload();
  },
  fire: () => {
    // fire(Math.random(), pos)
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
gui.add(obj, "fire").name("fire");
gui.add(obj, "reload").name("reload");
gui.add(obj, "reset").name("reset");


const ballGeo = new SphereGeometry(1, 20, 20);


const defaultMaterial = new MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.8,
})


function spawnPlane() {
  const planeGeo = new PlaneGeometry(80, 80, 20, 20);
  const planeMat = new MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.75,
    side: DoubleSide
  })
  const planeMesh = new Mesh(planeGeo, planeMat)
  const planeShape = new Plane();
  const planeBody = new Body({
    position: new Vec3(0, 0, 0),
    mass: 0,
    shape: planeShape,
    material: defaultMat
  })
  planeBody.quaternion.setFromAxisAngle(new Vec3(- 1, 0, 0), Math.PI * 0.5)
  world.addBody(planeBody);
  planeMesh.lookAt(0, 1, 0);
  planeMesh.receiveShadow = true;
  scene.add(planeMesh);
}

function spawnCannon() {
  const cannon = new Cannon();
  controllable.cannon = cannon;
  scene.add(cannon.body)
}

function main() {
  spawnPlane();
  spawnCannon();
  const cannonDebugger = CannonDebugger(scene, world);

  // tick
  let pvTime = 0;
  env.frameListener = (time: number) => {
    const fps = 60;
    const dt = time - pvTime;
    pvTime = time;
    world.step(1 / fps, dt, 3);
    cannonDebugger.update();
    for (const o of objectToUpdate) {
      const pos = Object.assign(new Vector3(), o.body.position);
      const rotation = Object.assign(new Quaternion(), o.body.quaternion);
      o.mesh.position.copy(pos);
      o.mesh.quaternion.copy(rotation);
    }
  }
}


class Cannon {
  body: Group = new Group()
  bottomRadius = 1;
  barrelHeight = this.bottomRadius * 3;
  rimThickness = this.bottomRadius / 10;
  barrelAngle = Math.PI / 6;
  shrinkRate = 0.75;
  position = new Vec3(-this.bottomRadius * 4, 0, -this.bottomRadius * 4)
  constructor() {
    this.init();
  }
  private init() {
    this.initBarrel();
    this.initTires();
    this.body.rotateY(Math.PI / 4);
    this.body.position.set(this.position.x, this.position.y, this.position.z)
  }

  private initBarrel() {
    const radius = this.bottomRadius;
    const height = this.barrelHeight;
    const rate = this.shrinkRate;
    const thickness = this.rimThickness;
    const bottomGeo = new SphereGeometry(radius, 40, 40);
    bottomGeo.translate(0, 0, 0)
    const barrelBottom = new Mesh(
      bottomGeo,
      defaultMaterial
    )
    const barrelBody = (() => {
      const fixer = 1.0035;
      const outerGeo = new CylinderGeometry(radius * rate, radius * fixer, height, 40, 20);
      const innerGeo = new CylinderGeometry((radius - thickness) * rate, (radius - thickness) * fixer, height, 40, 20);

      outerGeo.translate(0, height / 2, 0);
      innerGeo.translate(0, height / 2, 0);

      const outer = new Mesh(
        outerGeo,
        defaultMaterial
      )
      const inner = new Mesh(
        innerGeo,
        defaultMaterial
      )

      const body = CSG.subtract(outer, inner);
      return body;
    })()

    const barrel = CSG.union(barrelBottom, barrelBody);
    barrel.position.setY(radius);
    barrel.rotation.set(Math.PI / 2 - this.barrelAngle, 0, 0);

    this.body.add(barrel)
  }

  private initTires() {
    const genBeam = (diameter: number, rotation: number, thickness: number) => {
      const beamGeo = new BoxGeometry(thickness, diameter, thickness);
      beamGeo.rotateZ(Math.PI / 2 + rotation)
      beamGeo.translate(0, diameter / 2, 0);

      const beam = new Mesh(
        beamGeo,
        defaultMaterial
      )
      beam.castShadow = true;
      return beam;
    }
    const genBeams = (diameter: number, num: number, thickness: number) => {
      const beams = [];
      for (let i = 0; i < num; i++) {
        const beam = genBeam(diameter, i * Math.PI / (num - 1), thickness);
        beams.push(beam)
      }
      return beams;
    }
    const genFrame = (radius: number, thickness: number) => {
      const outerGeo = new CylinderGeometry(radius, radius, thickness, 30, 30);
      const innerGeo = new CylinderGeometry((radius - thickness), (radius - thickness), thickness, 30, 30);


      outerGeo.rotateX(Math.PI / 2);
      outerGeo.translate(0, radius, 0);
      innerGeo.rotateX(Math.PI / 2);
      innerGeo.translate(0, radius, 0);

      const outer = new Mesh(
        outerGeo,
        defaultMaterial
      )
      const inner = new Mesh(
        innerGeo,
        defaultMaterial
      )

      const frame = CSG.subtract(outer, inner);

      return frame;
    }

    const tires = ((radius = this.bottomRadius, thickness = this.rimThickness, beamNum = 6) => {
      const tires = new Group();
      const tireL = new Group();
      const beams = genBeams(radius * 2, beamNum, thickness);
      const frame = genFrame(radius, thickness)
      tireL.add(...beams, frame);
      const tireR = tireL.clone();
      tireL.position.setZ(-radius);
      tireR.position.setZ(radius);

      tires.add(tireL, tireR);
      tires.rotateY(Math.PI / 2);
      return tires;
    })()

    this.body.add(tires)
  }

  private getToward() {
    const dist = new Vec3(0, 0, 0).distanceTo(this.position);
    const towardTarget = new Vec3(0, dist * Math.tan(this.barrelAngle));
    const toward = towardTarget.vsub(this.position);
    toward.normalize();
    return toward;
  }

  private getBallInitPosition(toward: Vec3) {
    const pos = this.position.vadd(new Vec3(0, this.bottomRadius, 0)).vadd(toward.vmul(new Vec3(this.bottomRadius * 2, this.bottomRadius * 2, this.bottomRadius * 2)));
    return pos;
  }

  reload() {
    const ballRadius = (this.bottomRadius - this.rimThickness) * this.shrinkRate;
    const toward = this.getToward();
    const ballPosition = this.getBallInitPosition(toward);
    const ballMesh = new Mesh(ballGeo, defaultMaterial)
    ballMesh.scale.set(ballRadius, ballRadius, ballRadius)
    const ballShape = new Sphere(ballRadius);
    const ballBody = new Body({
      position: ballPosition,
      mass: 1,
      shape: ballShape,
      material: defaultMat,

    })
    ballBody.applyLocalForce(toward.vmul(new Vec3(700, 700, 700)))
    ballBody.addEventListener('collide', playHit)
    ballMesh.castShadow = true;
    world.addBody(ballBody);
    scene.add(ballMesh);
    objectToUpdate.push({ body: ballBody, mesh: ballMesh });
  }

}



window.onload = () => {
  main();
}
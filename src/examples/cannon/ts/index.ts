import { AmbientLight, AxesHelper, BoxGeometry, Clock, DoubleSide, Mesh, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, PointLight, Scene, SphereGeometry, Vector3, WebGLRenderer, Quaternion, Fog, Color, SpotLight, PointLightHelper, Group, CylinderGeometry, Vector2, Camera } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { debounce } from 'lodash';
import { Body, Box, ContactEquation, ContactMaterial, Cylinder, Material, Plane, SAPBroadphase, Sphere, Vec3, World } from 'cannon-es';
import { GUI } from 'dat.gui'
import { CSG } from 'three-csg-ts';
import { gsap, Power2, Power1 } from 'gsap'
// import CannonDebugger from 'cannon-es-debugger';

const hitSound = require('@sound/hit.mp3');
const cannonSound1 = require('@sound/cannon1.mp3');
const cannonSound2 = require('@sound/cannon2.mp3');
const cannon1 = new Audio(cannonSound1);
const cannon2 = new Audio(cannonSound2);
const hit = new Audio(hitSound);
const playHit = (ev: any, limit = 1.5) => {
  const contact = ev?.contact;
  if (contact instanceof ContactEquation) {
    const impact = contact.getImpactVelocityAlongNormal();
    if (impact > limit) {
      hit.volume = Math.random();
      hit.currentTime = 0;
      hit.play();
    }
  }
}
const playCannon = () => {
  const sounds = [cannon1, cannon2]
  const random = Math.ceil(Math.random() * sounds.length) - 1;
  const sound = sounds[random];
  sound.currentTime = random == 0 ? 0.5 : 1.3;
  sound.play();
}
let controllable: { [key: string]: any } = {}


class RenderEnv {
  scene: Scene;
  axis: AxesHelper;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  clock: Clock;
  world: World;
  mouse: Vector2 = new Vector2();
  clearColor: Color = new Color(0x333333);

  frameListener: (time: number) => void = (time: number) => { }
  constructor() {
    this.init();
  }
  init() {
    Object.assign(this, this.getSceneRenderReady());
  }

  private setCamera(camera: Camera) {
    if (window.innerWidth / window.innerHeight < 1.2) {
      camera.position.set(-7.149474797412067, 4.582458617816071, -10.706953052369284);
    }
    else {
      camera.position.set(1.762181275462378, 3.0189808412431107, -13.211102617158202);
    }
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
    this.setCamera(camera);
    //@ts-ignore
    // globalThis.camera = camera;


    const axis = new AxesHelper(5);
    axis.visible = false;
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
      this.setCamera(camera);
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, 200))



    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true;
    controls.minPolarAngle = 0;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.maxPolarAngle = Math.PI * 5 / 12;


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
let objectToUpdate: { body: Body, mesh: Mesh, isBlock?: boolean }[] = []


if (!isMobile()) {
  const gui = new GUI({
    closed: true
  });
  var obj = {
    barrelAngle: Math.PI / 10,
    position: 0,
    ballMass: 1,
    ballSpeed: 3,
    blockMass: 0.1,
    reset: function () {
      console.log(this.blockMass)
      reset(this.blockMass)
    }
  };

  gui.add(obj, "position").min(0).max(10).step(0.01).name("position").onChange((value) => {
    const cannon: Cannon = controllable.cannon;
    cannon.move(value);
  })
  gui.add(obj, "blockMass").min(0.1).max(3).step(0.1).name("blockMass").onChange((value) => {
    obj.reset();
  })
  gui.add(obj, "ballMass").min(1).max(10).step(1).name("ballMass").onChange((value) => {
    const cannon: Cannon = controllable.cannon;
    cannon.ballMass = value;
  })
  gui.add(obj, "ballSpeed").min(1).max(10).step(1).name("ballSpeed").onChange((value) => {
    const cannon: Cannon = controllable.cannon;
    cannon.ballSpeed = value;
  })
  gui.add(obj, "barrelAngle").min(0).max(Math.PI * 5 / 12).step(0.01).name("barrelAngle").onChange((value) => {
    const cannon: Cannon = controllable.cannon;
    cannon.rotateBarrel(value);
  })
  gui.add(obj, "reset").name("reset");

}


const ballGeo = new SphereGeometry(1, 10, 10);


const defaultMaterial = new MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.8,
})

function reset(mass = 0.1) {
  for (const obj of objectToUpdate) {
    obj.body.removeEventListener('collide', playHit);
    world.removeBody(obj.body)
    scene.remove(obj.mesh)
  }
  objectToUpdate.length = 0;
  spawnBlocks(mass);
}

function spawnPlane() {
  const planeGeo = new PlaneGeometry(80, 80, 10, 10);
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
  scene.add(cannon.bodyGroup)
}

function spawnBlocks(mass = 0.1) {
  const size = 0.5
  const gap = 0.02
  const position = new Vec3(6, 0, 6);

  // Layers
  for (let i = 0; i < (isMobile() ? 7 : 10); i++) {
    for (let j = 0; j < 3; j++) {
      const body = new Body({ mass })

      let halfExtents
      let dx
      let dz
      if (i % 2 === 0) {
        halfExtents = new Vec3(size, size, size * 3)
        dx = 1
        dz = 0
      } else {
        halfExtents = new Vec3(size * 3, size, size)
        dx = 0
        dz = 1
      }
      const mesh = new Mesh(
        new BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2, 5, 5, 5),
        defaultMaterial
      )
      const shape = new Box(halfExtents)

      body.addShape(shape)
      body.position.set(
        position.x + 2 * (size + gap) * (j - 1) * dx,
        position.y + 2 * (size + gap) * (i + 1),
        position.z + 2 * (size + gap) * (j - 1) * dz
      )
      mesh.position.set(
        position.x + 2 * (size + gap) * (j - 1) * dx,
        position.y + 2 * (size + gap) * (i + 1),
        position.z + 2 * (size + gap) * (j - 1) * dz
      )
      mesh.castShadow = true;
      body.addEventListener('collide', (ev: any) => { playHit(ev, 4) })
      scene.add(mesh);
      world.addBody(body)
      objectToUpdate.push({
        body, mesh, isBlock: true
      })
    }
  }
}
function isMobile() {
  const isMobile = (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
  return isMobile;
};

function main() {
  if (isMobile()) {
    document.body.classList.add('mobile');
  }
  spawnPlane();
  spawnCannon();
  spawnBlocks();
  // const cannonDebugger = CannonDebugger(scene, world);

  renderer.domElement.addEventListener('touchstart', () => {
    controllable.cannon.fire();
  })

  window.addEventListener('keydown', (ev: KeyboardEvent) => {
    if (ev.key == " " ||
      ev.code == "Space" ||
      ev.keyCode == 32
    ) {
      controllable.cannon.fire();
    }
  })

  // tick
  let pvTime = 0;
  env.frameListener = (time: number) => {
    const fps = 60;
    const dt = time - pvTime;
    pvTime = time;
    world.step(1 / fps, dt, 3);
    // cannonDebugger.update();
    for (const o of objectToUpdate) {
      const pos = Object.assign(new Vector3(), o.body.position);
      const rotation = Object.assign(new Quaternion(), o.body.quaternion);
      o.mesh.position.copy(pos);
      o.mesh.quaternion.copy(rotation);
    }
  }
}


class Cannon {
  bodyGroup: Group = new Group();
  body: Group = new Group()
  bottomRadius = 1;
  barrelHeight = this.bottomRadius * 3;
  rimThickness = this.bottomRadius / 10;
  barrelInitialAngle = Math.PI / 10;
  barrelAngle: number;
  shrinkRate = 0.75;
  horizontalAngle = Math.PI / 4;
  position = new Vec3(-this.bottomRadius * 4, 0, -this.bottomRadius * 4)
  barrel: Mesh;
  tires: Group;
  isReacting: boolean;
  ballMass = 1;
  ballSpeed = 3;
  mobileTimer: any
  constructor() {
    this.init();
  }
  private init() {
    this.initBarrel();
    this.initTires();
    this.bodyGroup.add(this.body)
    this.bodyGroup.rotateY(this.horizontalAngle);
    this.bodyGroup.position.set(this.position.x, this.position.y, this.position.z);
  }

  private initBarrel() {
    const radius = this.bottomRadius;
    const height = this.barrelHeight;
    const rate = this.shrinkRate;
    const thickness = this.rimThickness;
    const bottomGeo = new SphereGeometry(radius, 20, 20);
    bottomGeo.translate(0, 0, 0)
    const barrelBottom = new Mesh(
      bottomGeo,
      defaultMaterial
    )
    const barrelBody = (() => {
      const fixer = 1.0035;
      const outerGeo = new CylinderGeometry(radius * rate, radius * fixer, height, 30, 10);
      const innerGeo = new CylinderGeometry((radius - thickness) * rate, (radius - thickness) * fixer, height, 30, 10);

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

    this.barrel = CSG.union(barrelBottom, barrelBody);
    this.barrel.position.setY(radius);
    this.rotateBarrel(this.barrelInitialAngle);
    this.body.add(this.barrel)

  }

  private initTires() {
    const genBeam = (diameter: number, rotation: number, thickness: number) => {
      const beamGeo = new BoxGeometry(thickness, diameter, thickness);
      beamGeo.rotateZ(Math.PI / 2 + rotation)

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
      const outerGeo = new CylinderGeometry(radius, radius, thickness, 30, 10);
      const innerGeo = new CylinderGeometry((radius - thickness), (radius - thickness), thickness, 30, 10);


      outerGeo.rotateX(Math.PI / 2);
      innerGeo.rotateX(Math.PI / 2);


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

    const tiresModule = ((radius = this.bottomRadius, thickness = this.rimThickness, beamNum = 6) => {
      const tiresPoser = new Group();
      const tires = new Group();
      const tireL = new Group();
      const beams = genBeams(radius * 2, beamNum, thickness);
      const frame = genFrame(radius, thickness)
      tireL.add(...beams, frame);
      const tireR = tireL.clone();
      tireL.position.setZ(-radius);
      tireR.position.setZ(radius);

      tires.add(tireL, tireR);
      tiresPoser.add(tires);
      tiresPoser.rotateY(Math.PI / 2);
      tiresPoser.position.setY(this.bottomRadius);
      return { tiresPoser, tires };
    })()

    this.tires = tiresModule.tires;

    this.body.add(tiresModule.tiresPoser)
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

  move(dist: number) {
    this.position = new Vec3(this.bodyGroup.position.x, this.bodyGroup.position.y, this.bodyGroup.position.z)
      .vsub(
        new Vec3(dist * Math.cos(this.horizontalAngle),
          0,
          dist * Math.cos(this.horizontalAngle)
        )
      )
    this.body.position.set(0, 0, -dist);
    const rotation = dist / this.bottomRadius;// 移動的距離除以圓周再乘以Math.PI*2
    this.tires.rotation.z = -rotation;
  }

  private reactio() {
    const initialPosition = this.body.position.length()
    const config = {
      dist: initialPosition,
      maxDist: initialPosition + 1.5,
      duration: 0.5
    }
    this.isReacting = true;
    gsap.to(config, {
      dist: config.maxDist,
      duration: config.duration,
      ease: Power2.easeOut,
      onUpdate: () => {
        this.move(config.dist)
      },
      onComplete: () => {
        gsap.to(config, {
          dist: initialPosition,
          duration: config.duration * 2,
          ease: Power1.easeInOut,
          onUpdate: () => {
            this.move(config.dist)
          },
          onComplete: () => {
            this.isReacting = false
          }
        })
      }
    })
  }


  rotateBarrel(angle: number) {
    this.barrelAngle = angle;
    this.barrel.rotation.set(Math.PI / 2 - angle, 0, 0);
  }

  fire() {
    if (this.isReacting) return;
    // 如果場上的砲彈數量大於n顆則強制移除所有場上砲彈
    const balls = objectToUpdate.filter((o, i) => {
      return !o.isBlock
    })
    if (balls.length > (isMobile() ? 0 : 5)) {
      for (const obj of balls) {
        obj.body.removeEventListener('collide', playHit);
        world.removeBody(obj.body)
        scene.remove(obj.mesh)
      }
      objectToUpdate = objectToUpdate.filter((o, i) => {
        return o.isBlock
      })
    }
    const ballRadius = (this.bottomRadius - this.rimThickness) * this.shrinkRate;
    const toward = this.getToward();
    const ballPosition = this.getBallInitPosition(toward);
    const ballMesh = new Mesh(ballGeo, defaultMaterial)
    ballMesh.scale.set(ballRadius, ballRadius, ballRadius)
    const ballShape = new Sphere(ballRadius);
    const ballBody = new Body({
      position: ballPosition,
      mass: this.ballMass,
      shape: ballShape,
      material: defaultMat,
    })
    ballBody.applyLocalForce(toward.vmul(new Vec3(600 * this.ballSpeed, 600 * this.ballSpeed, 600 * this.ballSpeed)))
    ballBody.addEventListener('collide', playHit)
    world.addBody(ballBody);
    scene.add(ballMesh);
    objectToUpdate.push({ body: ballBody, mesh: ballMesh });
    if (isMobile()) {
      clearTimeout(this.mobileTimer)
      this.mobileTimer = setTimeout(() => {
        reset();
      }, 3000)
    }

    playCannon();
    this.reactio();
  }

}



window.onload = () => {
  main();
}
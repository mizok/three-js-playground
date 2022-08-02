import { AmbientLight, AxesHelper, BoxGeometry, Clock, ConeGeometry, DirectionalLight, Group, Mesh, MeshStandardMaterial, PerspectiveCamera, Scene, TorusGeometry, TorusKnotGeometry, Vector2, Vector3, WebGLRenderer } from 'three';
import { debounce } from 'lodash';
import { gsap, Power2 } from 'gsap'

function main() {
  let env: RenderEnv;
  const { scene, renderer, camera, clock, axis } = env = new RenderEnv();
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
  const meshs = [torusMesh, coneMesh, torusKnotMesh]
  const meshGroups = meshs.map((o, i) => {
    const group = new Group();
    group.add(o);
    group.position.set(0, -i * gap, 0)
    return group;
  })

  const cameraGroup = new Group();
  cameraGroup.add(camera);
  scene.add(cameraGroup, ...meshGroups);

  let prevSection = 0;

  document.body.addEventListener('scroll', () => {
    const height = document.body.getBoundingClientRect().height
    const allHeight = document.body.scrollHeight - height;
    const progress = document.body.scrollTop / allHeight;
    const cellHeight = gap * (meshs.length - 1)
    const y = -progress * cellHeight;
    let section = document.body.scrollTop / (allHeight / (meshs.length - 1));
    section = Math.round(section);
    let currentSection = section;
    camera.position.setY(y);
    if (currentSection !== prevSection) {
      gsap.to(meshGroups[currentSection].rotation, {
        duration: 1,
        ease: Power2.easeOut,
        y: '+=9'
      })
      prevSection = section;
    }

  })
  const speed = 5;
  document.body.addEventListener('mousemove', (ev) => {
    const rect = renderer.domElement.getBoundingClientRect();
    env.cursor.x = ((ev.clientX - rect.left) / rect.width - 0.5) * 2;
    env.cursor.y = -((ev.clientY - rect.top) / rect.height - 0.5) * 2;

  })

  let prevTime = 0;

  env.frameListener = (time) => {
    torusMesh.rotation.x = time * 0.1;
    torusMesh.rotation.y = time * 0.3;
    coneMesh.rotation.x = time * 0.1
    coneMesh.rotation.y = time * 0.4
    torusKnotMesh.rotation.x = time * 0.3
    torusKnotMesh.rotation.y = time * 0.5;
    const gapTime = time - prevTime;
    prevTime = time;
    cameraGroup.position.set(
      cameraGroup.position.x + (env.cursor.x - cameraGroup.position.x) * speed * gapTime,
      cameraGroup.position.y + (env.cursor.y - cameraGroup.position.y) * speed * gapTime,
      0
    )
  }
}


class RenderEnv {
  scene: Scene;
  axis: AxesHelper;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  clock: Clock;
  cursor: Vector2 = new Vector2();
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
      this.frameListener(clock.getElapsedTime())
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
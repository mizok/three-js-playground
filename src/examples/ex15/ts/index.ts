import { AmbientLight, AxesHelper, Clock, Color, DirectionalLight, Mesh, MeshStandardMaterial, PerspectiveCamera, PointLight, Raycaster, Scene, SphereGeometry, Vector2, Vector3, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { debounce } from 'lodash';

function main() {
  let env;
  const { scene, renderer, camera, clock, axis, mouse } = env = new RenderEnv();
  const geo0 = new SphereGeometry(0.5, 100, 100);
  const geo1 = geo0.clone();
  const geo2 = geo0.clone();

  const mat = new MeshStandardMaterial({ color: 0xff0000 })
  const mesh0 = new Mesh(geo0, mat);
  const mesh1 = new Mesh(geo1, mat.clone());
  const mesh2 = new Mesh(geo2, mat.clone());
  mesh0.position.set(-2, 0, 0)
  mesh2.position.set(2, 0, 0)

  scene.add(mesh0, mesh1, mesh2);

  const rayTest = () => {
    const rayCasterOrigin = new Vector3(-3, 0, 0)
    const rayCasterDirection = new Vector3(10, 0, 0).normalize();
    const rayCaster = new Raycaster(rayCasterOrigin, rayCasterDirection);
    const intersects = rayCaster.intersectObjects([mesh0, mesh1, mesh2]);

    [mesh0, mesh1, mesh2].forEach((o) => {
      if (o instanceof Mesh) {
        o.material.color = new Color('red')
      }
    })

    intersects.forEach((o) => {

      if (o.object instanceof Mesh) {
        o.object.material.color = new Color('green')
      }
    })
  }

  let intersectPool: any = null

  const rayMouseTest = () => {
    const rayCaster = new Raycaster()
    rayCaster.setFromCamera(mouse, camera);
    const targets = [mesh0, mesh1, mesh2]
    const intersects = rayCaster.intersectObjects(targets);
    targets.forEach((o) => {
      if (o instanceof Mesh) {
        o.material.color = new Color('red')
      }
    })

    intersects.forEach((o) => {
      if (o.object instanceof Mesh) {
        o.object.material.color = new Color('green')
      }
    })

    if (intersects.length) {
      if (intersectPool === null) {
        console.log('mousein')
      }
      intersectPool = intersects[0]
    }
    else {
      if (intersectPool !== null) {
        console.log('mouseout')
      }
      intersectPool = null
    }
  }

  env.frameListener = (time) => {
    rayMouseTest();
    mesh0.position.setY(Math.sin(time));
    mesh1.position.setY(Math.sin(time * 2));
    mesh2.position.setY(Math.sin(time * 3));
    // rayTest();
    rayMouseTest();


  }



}

class RenderEnv {
  scene: Scene;
  axis: AxesHelper;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  clock: Clock;
  mouse: Vector2;
  frameListener: (time: number) => void = (time) => { };
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

    const aLight = new AmbientLight(0xffffff, 0.1);
    const dLight = new DirectionalLight(0xffffff, 1)

    dLight.position.set(1, 1, 1)

    scene.add(camera, axis, aLight, dLight);

    const mouse = new Vector2()

    renderer.domElement.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = 2 * ((e.clientX - rect.left) / rect.width) - 1;
      mouse.y = -2 * ((e.clientY - rect.top) / rect.height) + 1;
    }, false)


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
      this.frameListener(clock.getElapsedTime());
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    }

    tick();

    return { scene, renderer, camera, clock, axis, mouse };
  }
}


window.onload = () => {
  main();
}
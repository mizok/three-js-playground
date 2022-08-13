import { AxesHelper, Clock, PerspectiveCamera, PlaneGeometry, Scene, TextureLoader, WebGLRenderer, LoadingManager, Mesh, AmbientLight, DirectionalLight, NearestFilter, Texture, RepeatWrapping, Fog, PointLight, MeshStandardMaterial, CylinderGeometry, BoxGeometry, Vector3, Group, ConeGeometry, Vector2, Color, LatheGeometry, DoubleSide, PointLightHelper, Shape, Path, ExtrudeGeometry, MeshBasicMaterial, Object3D } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { debounce } from 'lodash';
import { gsap } from 'gsap';

function limit(number: number, min: number, max: number) {
  return Math.min(Math.max(number, min), max);
}

function rnd(max: number, negative: boolean) {
  return negative ? Math.random() * 2 * max - max : Math.random() * max;
}

const loadingManager = new LoadingManager();

loadingManager.onStart = () => {
  console.log('texture load start')
}
loadingManager.onLoad = () => {
  console.log('texture loaded')
}
loadingManager.onError = () => {
  console.log('texture load error')
}

const textureLoader = new TextureLoader(loadingManager);
const aoTexture = textureLoader.load(require('@img/concrete/ao.jpg'));
const heightTexture = textureLoader.load(require('@img/concrete/height.png'));
const colorTexture = textureLoader.load(require('@img/concrete/color.jpg'));
const normalTexture = textureLoader.load(require('@img/concrete/normal.png'));

const aoTexture1 = textureLoader.load(require('@img/stone-wall/ao.jpg'));
const heightTexture1 = textureLoader.load(require('@img/stone-wall/height.png'));
const colorTexture1 = textureLoader.load(require('@img/stone-wall/color.jpg'));
const normalTexture1 = textureLoader.load(require('@img/stone-wall/normal.png'));

const aoTexture2 = textureLoader.load(require('@img/brick/ao.jpg'));
const heightTexture2 = textureLoader.load(require('@img/brick/height.png'));
const colorTexture2 = textureLoader.load(require('@img/brick/color2.jpg'));
const colorTexture2A = textureLoader.load(require('@img/brick/color.jpg'));
const normalTexture2 = textureLoader.load(require('@img/brick/normal.png'));

const aoTexture3 = aoTexture1.clone()
const heightTexture3 = heightTexture1.clone()
const colorTexture3 = colorTexture1.clone()
const normalTexture3 = normalTexture1.clone()

const aoTextureW = textureLoader.load(require('@img/wood/ao.png'));
const heightTextureW = textureLoader.load(require('@img/wood/height.png'));
const colorTextureW = textureLoader.load(require('@img/wood/color.jpg'));
const normalTextureW = textureLoader.load(require('@img/wood/normal.png'));

const colorTextureG1 = textureLoader.load(require('@img/grass/g1.png'));
const colorTextureG2 = textureLoader.load(require('@img/grass/g2.png'));
const colorTextureG3 = textureLoader.load(require('@img/grass/g3.png'));
const colorTextureG4 = textureLoader.load(require('@img/grass/g4.png'));
const colorTextureG5 = textureLoader.load(require('@img/grass/g5.png'));
const grassTextures = [colorTextureG1, colorTextureG2, colorTextureG3, colorTextureG4, colorTextureG5];

const wingTexture = textureLoader.load(require('@img/butterfly/wing.png'));
const bodyTexture = textureLoader.load(require('@img/butterfly/body.png'));

function main() {
  let env;
  const { scene, renderer, camera, clock, axis, updater } = env = new RenderEnv();
  axis.visible = false;
  const land = new Land();
  const castle = new Castle();
  const butterfly = new Butterfly();
  (window as any).PerspectiveCamera = camera;
  updater.byFrame = () => {
    butterfly.update();
  }
  scene.add(land.mesh, castle.mesh, butterfly.group);
}

class RenderEnv {
  scene: Scene;
  axis: AxesHelper;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  clock: Clock;
  updater: {
    byFrame: Function
  };
  aLight: AmbientLight;
  dLight: DirectionalLight;
  pLight: PointLight;
  constructor() {
    this.init();
  }
  init() {
    Object.assign(this, this.getSceneRenderReady());
  }

  getSceneRenderReady() {
    const clearColor = 0xeeffff;
    const clock = new Clock();
    const scene = new Scene();
    const renderer = new WebGLRenderer({
      antialias: true, // 反鋸齒
    })
    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);


    camera.position.set(-25.344477182097155, 7.447399535003215, -53.40593334576394);
    const axis = new AxesHelper(5);
    const aLight = new AmbientLight(0xb9d5ff, 0.3);
    const dLight = new DirectionalLight(0xb9d5ff, 0.3);
    const pLight = new PointLight(new Color('pink'), 1.5)
    const pLightHelper = new PointLightHelper(pLight);


    pLight.castShadow = true;

    pLight.position.set(-14, 54, -14);
    dLight.position.set(5, 5, 5)


    scene.add(camera, axis, aLight, dLight, pLight, pLightHelper)

    const fog = new Fog(clearColor, 1, 120);
    scene.fog = fog;

    document.body.appendChild(renderer.domElement);
    renderer.setClearColor(clearColor) // 把背景色設置為透明
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
    controls.enableRotate = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.enableZoom = false;


    controls.center = new Vector3(0, 300, 100)
    const updater = {
      byFrame: (time: number) => {

      }
    }


    const tick = (time: number) => {
      controls.update();
      updater.byFrame(time);
      renderer.render(scene, camera);
      requestAnimationFrame((time) => { tick(time) });
    }


    tick(performance.now());

    return { scene, renderer, camera, clock, axis, updater };
  }
}

class Land {
  mesh: Mesh | Group;
  constructor() {
    this.init();
  }
  init() {
    this.mesh = this.genMesh();
  }
  genGeometry() {
    return new PlaneGeometry(150, 150, 200, 200);
  }
  genMaterial() {
    // const gradientTexture = textureLoader.load(require('@img/gradients/gradA.jpg'));
    const setting = (...textures: Texture[]) => {
      textures.forEach(texture => {
        texture.minFilter = NearestFilter;
        texture.generateMipmaps = false; //節省效能
        texture.repeat.x = 2;
        texture.repeat.y = 2;
        texture.rotation = -6;
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
      })
    }
    setting(
      aoTexture, heightTexture, colorTexture, normalTexture
    )
    const mat = new MeshStandardMaterial({
      map: colorTexture,
      displacementMap: heightTexture,

      aoMap: aoTexture,
      displacementScale: 5
    })
    return mat;
  }
  genMesh() {
    const group = new Group();
    const landMesh = new Mesh(
      this.genGeometry(),
      this.genMaterial()
    )
    landMesh.rotation.x = - Math.PI / 2;
    landMesh.position.y = - 10;
    landMesh.receiveShadow = true;
    const num = 30

    for (let i = 0; i < num; i++) {
      const grass = new Mesh(
        new PlaneGeometry(6, 3),
        new MeshStandardMaterial({
          map: grassTextures[Math.floor(Math.random() * grassTextures.length)],
          transparent: true,
          side: DoubleSide
        })
      )

      grass.position.set(
        (Math.random() * 2 - 1) * 60,
        -8,
        (Math.random() * 2 - 1) * 60
      )
      grass.rotation.set(
        0,
        (Math.random() * 2 - 1) * Math.PI,
        0
      )

      group.add(grass);
    }

    group.add(landMesh);
    return group;
  }
}

class Castle {
  mesh: Mesh | Group;
  mainRadius: number = 10;
  pillarHeight: number = 50;
  constructor() {
    this.init();
  }
  init() {
    this.mesh = this.genMesh();
  }
  genBody() {
    const mainGeo = new CylinderGeometry(
      this.mainRadius - 0.4,
      this.mainRadius + 0.4,
      this.pillarHeight,
      100,
      100
    )

    const matSetting = (...textures: Texture[]) => {
      textures.forEach(texture => {
        texture.minFilter = NearestFilter;
        texture.magFilter = NearestFilter;
        texture.generateMipmaps = false; //節省效能
        texture.repeat.x = 4;
        texture.repeat.y = 2;
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
      })
    }

    matSetting(colorTexture1, aoTexture1, heightTexture1, normalTexture1)
    const mat = new MeshStandardMaterial({
      color: 0xb9d5ff,
      map: colorTexture1,
      aoMap: aoTexture1,
      displacementMap: heightTexture1,
      displacementBias: -0.75,
      displacementScale: 0.8,
    })

    return new Mesh(
      mainGeo,
      mat
    )
  }
  genBricks(num: number = 10) {
    const bricks = new Group()
    const randomizer = (x: number, y: number) => {
      const bias = 0.25
      return [
        x + Math.random() * x * bias,
        y + Math.random() * y,
      ]
    }
    for (let n = 0; n < num; n++) {
      const brickGeo = new BoxGeometry(...randomizer(4, 2), 0.5, 50, 50);
      const mat = new MeshStandardMaterial({
        map: colorTexture2,
        aoMap: aoTexture2,
        displacementMap: heightTexture2,
        displacementBias: -0.2,
        displacementScale: 0.5,

      });
      const height = (Math.random() - 0.5) * (this.pillarHeight - 15);
      const mesh = new Mesh(brickGeo, mat);
      const theda = Math.random() * 2 * 0.03 * Math.PI + 2 * n * Math.PI / num;
      mesh.position.set(
        this.mainRadius * 0.98 * Math.sin(theda),
        height,
        this.mainRadius * 0.98 * Math.cos(theda)
      )
      mesh.lookAt(0, height, 0);
      bricks.add(mesh);
    }

    return bricks;
  }
  genWoodenMiddle() {
    const group = new Group();
    const extrudeSettings = {
      amount: 0.75,
      steps: 5,
      bevelEnabled: true,
      curveSegments: 10
    };

    const matSetting = (...textures: Texture[]) => {
      textures.forEach(texture => {
        texture.minFilter = NearestFilter;
        texture.magFilter = NearestFilter;
        texture.generateMipmaps = false; //節省效能
        texture.repeat.x = 0.25;
        texture.repeat.y = 0.25;
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
      })
    }

    matSetting(colorTextureW, aoTextureW, normalTextureW, heightTextureW)

    const arcShape = new Shape();
    arcShape.absarc(0, 0, this.mainRadius + 1, 0, Math.PI * 2, false);

    const holePath = new Path();
    holePath.absarc(0, 0, this.mainRadius, 0, Math.PI * 2, true);
    arcShape.holes.push(holePath);

    const rinGeo = new ExtrudeGeometry(arcShape, extrudeSettings);
    const rinMesh = new Mesh(rinGeo, new MeshStandardMaterial({
      map: colorTextureW,
      aoMap: aoTextureW,

      displacementMap: heightTextureW,
      displacementBias: -0.5,
      side: DoubleSide
    }))
    rinMesh.position.set(0, this.pillarHeight / 2 - 8, 0)
    rinMesh.lookAt(0, 999, 0);


    const beamShape = new Shape();
    beamShape.moveTo(0, 0);
    beamShape.lineTo(-3, 8);
    beamShape.lineTo(-2, 8);
    beamShape.lineTo(1, 0);
    beamShape.lineTo(0, 0);

    const extrudeSettingsB = {
      amount: 1,
      steps: 5,
      bevelEnabled: true,
      curveSegments: 10
    };
    const beams = new Group();
    const beamNum = 6;
    const beamSurroundRadius = 10
    const beamGeo = new ExtrudeGeometry(beamShape, extrudeSettingsB);
    const beamPosHeight = this.pillarHeight / 2 - 8;
    beamGeo.rotateX(Math.PI / 2);


    for (let n = 0; n < beamNum; n++) {
      const beamGeo = new ExtrudeGeometry(beamShape, extrudeSettingsB);
      const beamPosHeight = this.pillarHeight / 2 - 8
      beamGeo.rotateX(Math.PI / 2);
      beamGeo.rotateZ(n * 2 * Math.PI / beamNum + Math.PI / 2)

      const beamMesh = new Mesh(beamGeo, new MeshStandardMaterial({
        map: colorTextureW,
        aoMap: aoTextureW,

        displacementMap: heightTextureW,
        displacementBias: -0.4,
        side: DoubleSide
      }))
      const theda = n * 2 * Math.PI / beamNum;
      beamMesh.lookAt(0, beamPosHeight, 0)
      beamMesh.position.set(
        beamSurroundRadius * Math.sin(theda),
        beamPosHeight,
        beamSurroundRadius * Math.cos(theda)
      )
      beams.add(beamMesh);
    }

    const plateGeo = new CylinderGeometry(this.mainRadius + 3, this.mainRadius + 3, 1, 20);
    const plateMesh = new Mesh(plateGeo, new MeshStandardMaterial({
      map: colorTextureW,
      aoMap: aoTextureW,

      displacementMap: heightTextureW,
      displacementBias: -0.4,
      side: DoubleSide
    }))
    plateMesh.position.set(0, this.pillarHeight / 2, 0)



    group.add(rinMesh, beams, plateMesh);
    return group;
  }
  genRockMiddle() {
    const geo = new CylinderGeometry(this.mainRadius + 2, this.mainRadius + 2, 8, 30, 30);
    const setting = (...textures: Texture[]) => {
      textures.forEach(texture => {
        texture.minFilter = NearestFilter;
        texture.magFilter = NearestFilter;
        texture.generateMipmaps = false; //節省效能
        texture.repeat.x = 8;
        texture.repeat.y = 2;
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
      })
    }
    setting(colorTexture3, aoTexture3, heightTexture3, normalTexture3)
    const mat = new MeshStandardMaterial({
      map: colorTexture3,
      aoMap: aoTexture3,
      displacementMap: heightTexture3,

      displacementBias: -1
    });
    const mesh = new Mesh(geo, mat)
    mesh.position.y = 4 + this.pillarHeight / 2;
    return mesh;
  }

  genRoof() {
    const geo = new ConeGeometry(this.mainRadius + 4, 10, 30, 30);

    const mat = new MeshStandardMaterial({
      color: new Color('brown'),
      map: colorTexture3,
      aoMap: aoTexture3,
      displacementMap: heightTexture3,

      displacementBias: -1
    });
    const mesh = new Mesh(geo, mat)
    mesh.position.y = 13 + this.pillarHeight / 2;
    return mesh;
  }

  genBase() {
    const points = [];
    const size = 5;
    for (let i = 1; i <= size; i++) {
      const v = new Vector2((-Math.pow(2, (i - 1)) + 1) * 0.8, -i * 5);
      points.push(v);
    }
    const coneGeo = new LatheGeometry(points, 50);
    const baseColorMap = colorTexture2A.clone();
    baseColorMap.wrapS = RepeatWrapping;
    baseColorMap.wrapT = RepeatWrapping;
    baseColorMap.repeat = new Vector2(10, 10)
    const mat = new MeshStandardMaterial({
      color: 0xb9d5ff,
      map: baseColorMap,
      side: DoubleSide
    })
    const base = new Mesh(
      coneGeo,
      mat
    )

    base.position.y = size * 3;

    return base;
  }
  genMesh() {
    const group = new Group();
    const main = this.genBody();
    const bricks = this.genBricks();
    const base = this.genBase();
    const middleW = this.genWoodenMiddle();
    const middleR = this.genRockMiddle();
    const roof = this.genRoof()

    group.add(main, bricks, base, middleW, middleR, roof);
    group.position.set(0, 0, 10);
    group.rotation.x = Math.PI / 60;
    group.traverse(function (o) {
      if ((o as Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });



    return group;
  }
}

class Butterfly {
  private wingL: Object3D = new Object3D();
  private wingR: Object3D = new Object3D();
  private body: Mesh
  private maxWingRotation = 4 * Math.PI / 5;
  private minWingRotation = Math.PI / 5;
  private wingRotation: number;
  private wingRotationDuration: number = 0.1;
  private movingRadius = 40;
  private movingHeight = 10;
  private theda = 0;
  private model: Object3D = new Object3D();
  group: Group = new Group();
  constructor() {
    this.init()
  }

  init() {
    this.initModel();
    this.calcSwingSpeed();
  }

  initModel() {
    const scaleRate = 3;
    const wingW = 5 / scaleRate;
    const wingH = 5 / scaleRate;
    const bodyWidth = 2 / scaleRate;
    const bodyHeight = 3 / scaleRate
    const wingPositionFixX = 0.15 / scaleRate;
    const wingPositionFixY = -0.3 / scaleRate;
    const wingGeo = new PlaneGeometry(wingW, wingH, 10, 10);
    const wingMat = new MeshBasicMaterial({ transparent: true, map: wingTexture, side: DoubleSide });
    const wingLMesh = new Mesh(wingGeo, wingMat)
    wingLMesh.position.x = - wingW / 2 - wingPositionFixX;
    wingLMesh.position.y = wingPositionFixY;
    this.wingL.add(wingLMesh);

    const wingRMesh = new Mesh(wingGeo, wingMat);
    wingRMesh.position.x = wingW / 2 + wingPositionFixX;
    wingRMesh.position.y = wingPositionFixY;
    wingRMesh.rotation.y = -Math.PI;
    this.wingR.add(wingRMesh);

    const bodyGeo = new PlaneGeometry(bodyWidth, bodyHeight);
    const bodyMat = new MeshStandardMaterial({ transparent: true, map: bodyTexture, side: DoubleSide });
    this.body = new Mesh(bodyGeo, bodyMat);
    this.body.position.z = 0.01;
    this.model = new Object3D();
    this.model.add(this.body, this.wingL, this.wingR)
    this.model.position.z = this.movingRadius;
    this.model.rotation.x = Math.PI / 2;
    this.model.rotation.y = Math.PI;
    this.model.rotation.z = Math.PI / 2;
    this.setWingsRotation(this.minWingRotation);
    this.wingRotation = this.minWingRotation;
    this.group.add(this.model);
    this.group.traverse(function (o) {
      if ((o as Mesh).isMesh) {
        o.castShadow = true;
      }
    });
  }


  setWingsRotation(metric: number) {
    const angle = metric;
    this.wingRotation = angle;
    this.wingL.rotation.y = angle;
    this.wingR.rotation.y = - angle;
  }

  calcSwingSpeed() {

    const tween1 = gsap.to(this, {
      wingRotation: this.maxWingRotation,
      duration: this.wingRotationDuration,
      yoyo: true,
      paused: true,
      repeat: -1,
    }).play();

    const tween2 = gsap.to(this, {
      theda: Math.PI * 2,
      duration: 10,
      paused: true,
      repeat: -1,
      ease: 'linear'
    }).play();

    const tween3 = gsap.to(this, {
      movingHeight: 5,
      duration: 1,
      yoyo: true,
      paused: true,
      repeat: -1,
    }).play();

    const tween4 = gsap.to(this, {
      movingRadius: 30,
      duration: 5,
      yoyo: true,
      paused: true,
      repeat: -1,
    }).play();
  }



  move() {
    // this.model.rotation.z = (this.model.rotation.z - this.theda);
    this.model.rotation.z = this.theda + Math.PI / 2

    this.model.position.set(
      this.movingRadius * Math.sin(this.theda),
      this.movingHeight,
      this.movingRadius * Math.cos(this.theda)
    )
  }

  update() {
    this.setWingsRotation(this.wingRotation);
    this.move();
  }




}





window.onload = () => {
  main();
}
import { AxesHelper,  Clock,  MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer,LoadingManager, MeshNormalMaterial, Mesh, TorusGeometry } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { debounce } from 'lodash';

function main() {
  const scene = new Scene();
  const material = new MeshBasicMaterial({
    color: 'red',
    wireframe: true
  })

  const loadingManager = new LoadingManager();

  loadingManager.onStart = ()=>{
    console.log('texture load start')
  }
  loadingManager.onLoad = ()=>{
    console.log('texture loaded')
  }
  loadingManager.onError = ()=>{
    console.log('texture load error')
  }

  const fontLoader = new FontLoader(loadingManager);

  fontLoader.load('../static/font/droid_sans_regular.typeface.json',(font)=>{
      const textGeo = new TextGeometry('Mizok',{
        font:font,
        size:0.5,
        height:0.2,
        curveSegments:12,
        bevelEnabled: true,
        bevelThickness:0.03,
        bevelSize:0.02,
        bevelOffset:0,
        bevelSegments:5
      })

      textGeo.computeBoundingBox();
      const bbox = textGeo.boundingBox;
      textGeo.translate(
        -(bbox.max.x  - 0.02) * 0.5,
        -(bbox.max.y - 0.02) * 0.5,
        -(bbox.max.z - 0.03) * 0.5,
      )
      
      
      const mat = new MeshNormalMaterial();
      // mat.wireframe = true;
      const textMesh = new Mesh(textGeo,mat);
      scene.add(textMesh);

      const torusGeo = new TorusGeometry(0.1,0.1,20,20);

      for(let i =0;i<100;i++){
        const torusMesh = new Mesh(torusGeo,mat);
        torusMesh.position.x = (Math.random() - 0.5)*2 * 2;
        torusMesh.position.y =  (Math.random() - 0.5)*2 * 2;
        torusMesh.position.z =  (Math.random() - 0.5)*2 * 2;

        torusMesh.rotation.x = Math.random()*5;
        torusMesh.rotation.y = Math.random()*5;
        torusMesh.rotation.z = Math.random()*5;

        const scale = Math.random()

        torusMesh.scale.x = scale;
        torusMesh.scale.y = scale;
        torusMesh.scale.z = scale;

        scene.add(torusMesh);
      }

      
  });




  // const axis = new AxesHelper(5);
  // scene.add(axis);

  //camera
  const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;
  scene.add(camera);

  //renderer
  const renderer = new WebGLRenderer({
    antialias: true, // 反鋸齒
    alpha: true // 開放渲染rgba透明通道
  })
  const clock = new Clock();

  document.body.appendChild(renderer.domElement);
  renderer.setClearColor(0x000000, 0) // 把背景色設置為透明
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio);

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true;

  window.addEventListener('resize', debounce(() => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, 200))

  const tick = () => {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  tick();
}


window.onload = () => {
  main();
}
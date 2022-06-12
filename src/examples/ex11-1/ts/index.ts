import { AmbientLight, AxesHelper, BoxGeometry, BufferAttribute, BufferGeometry, Clock, Color, DirectionalLight, DoubleSide, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, PointLight, Scene, SphereGeometry, Texture, TextureLoader, Vector3, WebGLRenderer,LoadingManager } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { debounce } from 'lodash';
const boxWidth = 5;
const ballRadius = 0.25;
function main() {
  const scene = new Scene();

  const mat = new MeshStandardMaterial({
    roughness:0.4
  });
  const matWire = new MeshBasicMaterial({
    wireframe :true
  });
  const matWall = new MeshStandardMaterial({
    color:new Color('rgba(200,200,200,1)'),
    transparent:true,
    opacity:0.2,
    side:DoubleSide,
    roughness:0.8,
  });
  const matGround = new MeshStandardMaterial({
    color:new Color('rgba(100,100,100,1)'),
    side:DoubleSide,
    roughness:0.4
  });
 
  const boxGeo = new BoxGeometry(boxWidth,boxWidth,boxWidth);
  const ballGeo = new SphereGeometry(ballRadius,20,20);

  boxGeo.addGroup(0, 6, 0);
  boxGeo.addGroup(6, 6, 1);
  boxGeo.addGroup(12, 6, 2);
  boxGeo.addGroup(18, 6, 3);
  boxGeo.addGroup(24, 6, 4);
  boxGeo.addGroup(30, 6, 5);

  const boxMesh = new Mesh(boxGeo,[matWall,matWall,matWall,matGround,matWall,matWall]);
  const boxWireMesh = new Mesh(boxGeo,matWire);
  boxMesh.receiveShadow = true;
  scene.add(boxMesh,boxWireMesh);

  const statusPool:Status[] = [];
  const meshPool:Mesh[] = [];

  const launchBall = ()=>{
    const mesh = new Mesh(ballGeo,mat);
    mesh.castShadow = true;
    scene.add(mesh);
    meshPool.push(mesh);
    statusPool.push(new Status());
  }

  window.addEventListener('click',launchBall)
  window.addEventListener('touchstart',launchBall)
  
  const aLight = new AmbientLight(0xffffff,0.5);
  const pLight = new PointLight(0xffffff,0.5);
  pLight.castShadow = true;
  pLight.position.set(-1,1,-1);

  scene.add(aLight,pLight);

  const axis = new AxesHelper(5);
  axis.visible = false;
  scene.add(axis);

  //camera
  const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.rotation.x = -0.21421998888194424;
  camera.rotation.y = -1.006939485502568;
  camera.rotation.z = -0.18184877574565966;
  camera.position.set(-7.0581927454849795,0.948799309207947,6.361128348986736);
  scene.add(camera);

  //renderer
  const renderer = new WebGLRenderer({
    antialias: true, // 反鋸齒
    // alpha: true // 開放渲染rgba透明通道
  })
  renderer.shadowMap.enabled = true;
  const clock = new Clock();
  document.body.appendChild(renderer.domElement);
  renderer.setClearColor(0x000000, 0.3) // 把背景色設置為透明
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
    meshPool.forEach((o,i)=>{
      o.position.set(statusPool[i].position.x,statusPool[i].position.y,statusPool[i].position.z);
    })
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  tick();
}

class Status{
  private velocity:Vector3 = new Vector3();
  position:Vector3 = new Vector3(0,2,0);
  private acceleration:Vector3 = new Vector3(0,-15,0);
  private timer:number = performance.now();
  constructor(){
    this.init();
  }
  init(){
    this.velocity.set(
      Math.random()*5,
      Math.random()*5,
      Math.random()*5
    )
    this.update(performance.now());
  }
  update(now:number){
    const halfLife = 0.9;
    const elapsedTime = (now - this.timer) / 1000;
    this.timer = now;
    //update velicity
    this.velocity.x+=this.acceleration.x * elapsedTime;
    this.velocity.y+=this.acceleration.y * elapsedTime;
    this.velocity.z+=this.acceleration.z * elapsedTime;
    
    
    if(this.position.x + this.velocity.x * elapsedTime + ballRadius>boxWidth/2||this.position.x +
     this.velocity.x * elapsedTime - ballRadius< -boxWidth/2){
      this.velocity.x = - this.velocity.x * halfLife; 
    }
    if(this.position.y + this.velocity.y * elapsedTime + ballRadius>boxWidth/2||this.position.y +
    this.velocity.y * elapsedTime - ballRadius< -boxWidth/2){
      this.velocity.y = - this.velocity.y  * halfLife; 
    }
    if(this.position.z + this.velocity.z * elapsedTime + ballRadius>boxWidth/2||this.position.z +
    this.velocity.z * elapsedTime - ballRadius< -boxWidth/2){
      this.velocity.z = - this.velocity.z  * halfLife; 
    }
    //update position
    this.position.x+=this.velocity.x * elapsedTime
    this.position.y+=this.velocity.y * elapsedTime
    this.position.z+=this.velocity.z * elapsedTime
    
    requestAnimationFrame((now)=>{
      this.update(now)
    })
  }
}


window.onload = () => {
  main();
}
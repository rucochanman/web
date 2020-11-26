//ページの読み込みを待つ
window.addEventListener('load', init);

function init() {

  ////////////////////////////////////////////////////////
  //                     画面設定                        //
  ////////////////////////////////////////////////////////


  //画面サイズを指定
  const width = 800;
  const height = 400;

  //レンダラーを作成
  const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#myCanvas'),
      });
  renderer.setClearColor(new THREE.Color('grey'));//背景色の設定
  document.body.appendChild( renderer.domElement );
  renderer.setSize(width, height);

  //シーンを作成
  const scene = new THREE.Scene();

  //カメラを作成
  const camera = new THREE.PerspectiveCamera(45, width / height);
  camera.position.set(0, 0, 100);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  //ライトを設置
  const envlight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(envlight);


  ////////////////////////////////////////////////////////
  //                   メッシュ作成                      //
  ////////////////////////////////////////////////////////

  //const loader = new THREE.GLTFLoader();

  const url = 'bullet.gltf';

  const loader = new THREE.GLTFLoader();
  loader.load( './model/bullet.gltf' , function( gltf ){
    //console.log( gltf );
    //var sofa = gltf.scene;
    //scene.add(sofa);
  });


  const geometry = new THREE.ConeGeometry( 5, 20, 32 );
  const material = new THREE.MeshNormalMaterial(  );
  const cone = new THREE.Mesh( geometry, material );
  cone.rotation.x = -Math.PI / 2;
  cone.position.x = 25;
  scene.add( cone );


  const vectort = new THREE.Vector3( 2, 1, -1 ).normalize();
  const vectoro = new THREE.Vector3( 0, 0, -1 ).normalize();
  const cross = vectort.clone().cross(vectoro);
  const dot = vectoro.clone().dot(vectort);

  const quaternion = new THREE.Quaternion();
  quaternion.setFromAxisAngle( cross.normalize(), Math.cos(dot) );
  cone.applyQuaternion( quaternion );

  ////////////////////////////////////////////////////////
  //                   レンダリング                      //
  ////////////////////////////////////////////////////////

  render();

  function render(){



    /* render回す */
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }
}

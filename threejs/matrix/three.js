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
  renderer.setClearColor(new THREE.Color('black'));//背景色の設定
  document.body.appendChild( renderer.domElement );
  renderer.setSize(width, height);

  //シーンを作成
  const scene = new THREE.Scene();

  //カメラを作成
  const camera = new THREE.PerspectiveCamera(45, width / height);
  camera.position.set(0, 0, 15);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  //ライトを設置
  const envlight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(envlight);
  const light3 = new THREE.DirectionalLight( 0xdddddd );
  light3.position.set(  0, 1, -1 );
  scene.add( light3 );


  ////////////////////////////////////////////////////////
  //                   メッシュ作成                      //
  ////////////////////////////////////////////////////////


  const origin = new THREE.Vector3( 0, 0, -1 );
  //const cross = target.clone().cross(origin);
  //const dot = origin.clone().dot(target);

  const quaternion = new THREE.Quaternion();
  //quaternion.setFromAxisAngle( cross.normalize(), Math.cos(dot) );

  let bullet;
  let bullets = [];
  const wrap = new THREE.Group();

  const loader = new THREE.GLTFLoader();
  for(let i=0; i<150; i++){
  loader.load( './model/bullet.gltf' , function( gltf ){
    bullet = gltf.scene.children[0];
    //bullet.applyQuaternion( quaternion );
    let x = (Math.random()-0.5)*18;
    let y = (Math.random()-0.5)*10;
    let z = Math.random()*10;
    bullet.position.set(x, y, z);
    //const target = new THREE.Vector3( 2, 0, -1 ).normalize();
    wrap.add(bullet); // 任意のObject3Dを追加
    scene.add(bullet);
    //bullets.push(bullet);
  });
  }

  //画像ローダー&ジオメトリ（共通）用意
 const texLoader = new THREE.TextureLoader();

 const geometry1 = new THREE.PlaneGeometry( 24, 12 );
 const tex1 = texLoader.load('./img/back.png');
 const mat1 = new THREE.MeshLambertMaterial({ map: tex1 });
 const plane1 = new THREE.Mesh( geometry1, mat1 );
 //scene.add( plane1 );

 const geometry2 = new THREE.PlaneGeometry( 12, 6 );
 const tex2 = texLoader.load('./img/neo2.png');
 const mat2 = new THREE.MeshLambertMaterial({ map: tex2, transparent: true});
 const plane2 = new THREE.Mesh( geometry2, mat2 );
 scene.add( plane2 );


  //let bs = bullet.clone();
  //bs.position.x = 2;
  //scene.add(bullet);





  ////////////////////////////////////////////////////////
  //                   レンダリング                      //
  ////////////////////////////////////////////////////////

  let count =  0;
  render();

  function render(){

    if (wrap != null){
      scene.traverse(function(obj) {
        if(obj.name == "Sphere"){
          if(obj.position.z < 0){
          }else if (obj.position.z < 1) {
            obj.position.z -= 0.05;

          }else{
            obj.position.z -= 0.2;
          }
          //obj.applyQuaternion( quaternion);
          count++;
        }
      });
    }

    for(let i=0; i<10; i++){
      //wrap.position.x += 0.01;
    };

    /* render回す */
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }
}

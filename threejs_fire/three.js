//ページの読み込みを待つ
window.addEventListener('load', init);

function init() {


/////////////////////////////////////////////////////////
//                    画面の基本設定                    //
////////////////////////////////////////////////////////


  //画面サイズを指定
  const width = 800;
  const height = 400;

  //レンダラーを作成
  let renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#myCanvas')
      });
  renderer.setClearColor(new THREE.Color('black'));//背景色の設定
  document.body.appendChild( renderer.domElement );
  renderer.setSize(width, height);

  //シーンを作成
  let scene = new THREE.Scene();

  //カメラを作成
  let camera = new THREE.PerspectiveCamera(45, width / height);
  camera.position.set(0, 0, 100);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  //ライトを設置
  const envlight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(envlight);


  /////////////////////////////////////////////////////////
  //                  オブジェクト追加                    //
  ////////////////////////////////////////////////////////

  //(1)Planeジオメトリ(座標)を作成
  const geometry = new THREE.PlaneGeometry( 20, 20, 1 );
  //(2)テクスチャローダーを作成し画像を読み込み
  const loader = new THREE.TextureLoader();
  const tex = loader.load('img/fire.png');
  //(3)マテリアル(材質)にShaderMaterialを指定する
  const vert = document.getElementById('vert').textContent;
  const frag = document.getElementById('frag').textContent;
  //let rnd = 0;
  let material = new THREE.ShaderMaterial({
    uniforms: {
      uTex: { value: tex },
      uRnd: { value: 0.0 }, //シェーダにrandomな値を渡す
    },
    transparent: true, //透明度を有効に
    vertexShader: vert,
    fragmentShader: frag,
  });
  //(4)ジオメトリとマテリアルからメッシュを作成
  const plane = new THREE.Mesh( geometry, material );
  //(5)メッシュをシーンに追加
  scene.add( plane );


  /////////////////////////////////////////////////////////
  //                     レンダリング                     //
  ////////////////////////////////////////////////////////
　//レンダリング開始
  render();

  function render(){
      var scale = Math.random();
      material.uniforms.uRnd.value = scale; //シェーダに乱数渡す
      plane.scale.set(1, 1+scale, 1); //planeの縦をランダムに拡大する
      plane.position.y = 10*scale; //拡大した分planeのy位置をずらす
      requestAnimationFrame(render);
      renderer.render(scene, camera);
  }
}

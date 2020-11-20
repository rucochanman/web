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
  camera.position.set(0, 0, 100);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  //ライトを設置
  const envlight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(envlight);


  ////////////////////////////////////////////////////////
  //                   メッシュ作成                      //
  ////////////////////////////////////////////////////////

  /* 炎パーティクルを設定する変数 */
  const fireParticles = []; //パーティクルを格納する配列
  const fireParticlesNum = 50; //炎パーティクルの数
  const firePos = -5; //炎パーティクルのy軸初期位置
  const fireSize = 20;

  /* テクスチャの用意 */
  const loader = new THREE.TextureLoader();
  const texture = loader.load('img/tex.png');

  /* 炎パーティクルを作成する */
  const geometry = new THREE.PlaneGeometry( fireSize, fireSize, 1 );
  for(let i = 0; i < fireParticlesNum; i++){
    const material = new THREE.MeshLambertMaterial({
      map: texture, //読み込んだテクスチャを貼る
      transparent: true, //画像の透明度有効にする
    })
    /* パーティクルをランダムな座標に配置 */
    const particle = new THREE.Mesh(geometry,material);
    particle.position.y = Math.random() * fireSize + firePos;
    particle.position.z = Math.random() * 10;
    particle.rotation.z = Math.random() * 360;
    fireParticles.push(particle);
    scene.add(particle);
  }

  ////////////////////////////////////////////////////////
  //                   レンダリング                      //
  ////////////////////////////////////////////////////////

  render();

  function render(){

     /* パーティクルのアニメーション設定 */
    const limit = fireSize*1.5; //炎が上昇する距離
    for(let i = 0; i < fireParticlesNum; i++){
      if(fireParticles[i].position.y < firePos+limit){
        fireParticles[i].position.y += Math.random()*(fireSize/20); //上昇
      }else{
        fireParticles[i].position.y = firePos; //上昇限界位置まで行ったら初期位置に戻る
      }
      /* 大きさ */
      let y = ((firePos+limit)-fireParticles[i].position.y)/limit; //y座標を1～0に変換
      fireParticles[i].material.opacity = 2*Math.pow(y,4); //上に行くほど透明に
      fireParticles[i].rotation.z += (1-y)*0.01; //上にいくほど回転強く
      fireParticles[i].scale.x = y*0.6; //上に行くほど横幅小さく
      fireParticles[i].scale.y = y; //上に行くほど横幅小さく
      /* うねうね */
      let amp = (fireSize/15)*Math.random(); //うねうね大きさ
      let freq = 2*Math.random()+5; //うねうね量
      fireParticles[i].position.x = amp * Math.sin(freq*y*Math.PI);
      /* 色 */
      let r = Math.sin(Math.PI/4*y+Math.PI/2);
      let b = Math.pow(y, 20);
      fireParticles[i].material.color = new THREE.Color(r, y, b);
    }

    //render回す
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }
}

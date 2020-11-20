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
  const fireParticles = [];
  const fireParticlesNum = 50;
  const firePos = -5;
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

  /* 根本の炎作る */
  const fireRoot = [];
  const fireRootNum = 4;
  for(let i = 0; i < fireRootNum; i++){
    const material = new THREE.MeshLambertMaterial({
      map: texture,
      transparent: true,
      color: new THREE.Color(0.85,0.85,1.0)
    })
    const particle = new THREE.Mesh(geometry,material);
    particle.position.y = firePos-2;
    fireRoot.push(particle);
    scene.add(particle);
  }


  ////////////////////////////////////////////////////////
  //                   レンダリング                      //
  ////////////////////////////////////////////////////////

  render();

  function render(){

     /* パーティクルのアニメーション設定 */
    for(let i = 0; i < fireParticlesNum; i++){

      /* 座標の動き */
      const limit = fireSize*1.5; //炎が上昇する距離
      if(fireParticles[i].position.y < firePos+limit){
        fireParticles[i].position.y += Math.random()*(fireSize/20); //上昇
        fireParticles[i].rotation.z += 0.01; //回転
      }else{
        fireParticles[i].position.y = firePos; //limitまで行ったら初期位置に戻る
      }

      /* y座標を1～0に変換 */
      let y = ((firePos+limit)-fireParticles[i].position.y)/limit;

        /* 大きさ */
      fireParticles[i].scale.x = y*0.6; //上に行くほど横幅小さく
      fireParticles[i].scale.y = y; //上に行くほど横幅小さく

      /* うねうね */
      let amp = (fireSize/15)*Math.random(); //うねうね大きさ
      let freq = 2*Math.random()+5; //うねうね量
      fireParticles[i].position.x = amp * Math.sin(freq*y*Math.PI);

      /* 色 */
      fireParticles[i].material.opacity = Math.pow(y,4); //上に行くほど透明に
      let r = Math.sin(Math.PI/4*y+Math.PI/2);
      let b = Math.pow(y, 20);
      fireParticles[i].material.color = new THREE.Color(r, y, b);
    }

    /* 根本のアニメーション */
    for(let i = 0; i < fireRootNum; i++){
      fireRoot[i].material.opacity = Math.random()*0.8;
      let size = 0.5*Math.random() + 0.5;
      fireRoot[i].scale.y = size;
      fireRoot[i].rotation.z = Math.random()*Math.PI*2;
    }

    /* render回す */
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }
}

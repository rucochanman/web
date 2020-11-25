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
  let renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#myCanvas'),
      });
  renderer.setClearColor(new THREE.Color('black'));//背景色の設定
  document.body.appendChild( renderer.domElement );
  renderer.setSize(width, height);

  //シーンを作成
  let scene = new THREE.Scene();

  //カメラを作成
  let camera = new THREE.PerspectiveCamera(45, width / height);
  camera.position.set(0, 0, 20);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  //ライトを設置
  const envlight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(envlight);
  const light = new THREE.SpotLight(0xFF3800, 30, 10, Math.PI / 2, 0, 0.4);
  scene.add(light);
  light.position.set(0,0,0.5);

  ////////////////////////////////////////////////////////
  //                   メッシュ作成                      //
  ////////////////////////////////////////////////////////

  //画像ローダー&ジオメトリ（共通）用意
  const loader = new THREE.TextureLoader();
  const geometry = new THREE.PlaneGeometry( 1, 1, 10, 10 );

  //fireメッシュを作成
  const fireTex = loader.load('img/fire.png');
  const vert = document.getElementById('vert').textContent;
  const frag = document.getElementById('frag').textContent;

  const fireNum = 30;

  const fireParticle1 = [];
  const fireParticle2 = [];
  for(let i=0; i<fireNum; i++){
    let material = new THREE.ShaderMaterial({
      uniforms: {
        uTex: { value: fireTex },
        uRnd: { value: 1.0 },
        uNum: { value: i }
    },
      transparent: true,
      vertexShader: vert,
      fragmentShader: frag,
      blending: THREE.AdditiveBlending,
    });
    const plane = new THREE.Mesh( geometry, material );
    scene.add( plane );

    const plane2 = new THREE.Mesh( geometry, material );
    scene.add( plane2 );

    plane.scale.set((i/fireNum+1)+(Math.random()*(i/fireNum+1)),i/fireNum+1,1.0);
    plane.position.set(2.3, 0, 0);
    plane.position.x += i*0.1+(0.2*(Math.random()-0.5));
    plane.position.y += i*-0.25;

    plane2.scale.set((i/fireNum+1)+(Math.random()*(i/fireNum+1)),i/fireNum+1,1.0);
    plane2.position.set(-2.3, 0, 0);
    plane2.position.x += i*-0.1+(0.2*(Math.random()-0.5));
    plane2.position.y += i*-0.25;

    fireParticle1.push(plane);
    fireParticle2.push(plane2);
  };

  //sprite
  const character = [];
  const ground = [];

  for(let i=0; i<5; i++){
    const tex = loader.load('img/' + i + '.png');
    const groundtex = loader.load('img/ground' + i + '.png');
    character.push(tex);
    ground.push(groundtex);
  }
  const chara_geo = new THREE.PlaneGeometry( 15, 15 );
  const chara_mat = new THREE.MeshLambertMaterial({
    map: character[0],
    transparent: true
  });
  const chara_plane = new THREE.Mesh( chara_geo, chara_mat );
  scene.add( chara_plane );
  chara_plane.position.y = 3;

  const skytex = loader.load('img/sky.png');
  const bg_geo = new THREE.PlaneGeometry( 60, 25 );

  const ground_mat = new THREE.MeshLambertMaterial({map: ground[0]});
  const ground_plane = new THREE.Mesh( bg_geo, ground_mat );
  scene.add( ground_plane );
  ground_plane.position.y = -5;
  ground_plane.position.z = -8;
  ground_plane.rotation.x = -0.8;

  const sky_mat = new THREE.MeshLambertMaterial({map: skytex});
  const sky_plane = new THREE.Mesh( bg_geo, sky_mat );
  scene.add( sky_plane );
  sky_plane.position.z = -25;
  sky_plane.position.y = 20;
  sky_plane.scale.x = 1.3;


  ////////////////////////////////////////////////////////
  //                   レンダリング                      //
  ////////////////////////////////////////////////////////

  let count = 0;
  let index = 0;
  render();

  function render(){
  count += 1.2;
    for(let i=0; i<fireNum; i++){

      fireParticle1[i].material.uniforms.uRnd.value = Math.random();
      fireParticle2[i].material.uniforms.uRnd.value = Math.random();
      fireParticle1[i].material.uniforms.uNum.value = i - count;
      fireParticle2[i].material.uniforms.uNum.value = i - count;
    }
    index += 0.14;
    if(index > 3){index = 4;}
    chara_mat.map = character[Math.round(index)];
    ground_mat.map = ground[Math.round(index)];

    //render回す
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }
}

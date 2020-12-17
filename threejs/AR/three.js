window.addEventListener("DOMContentLoaded", init);

function init() {

  //////////////////////////////////////////////////////////////////////////////////
  //		Init
  //////////////////////////////////////////////////////////////////////////////////

  // init renderer
  var renderer	= new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setClearColor(new THREE.Color('lightgrey'), 0)
  renderer.setSize( 640, 480 );
  renderer.domElement.style.position = 'absolute'
  renderer.domElement.style.top = '0px'
  renderer.domElement.style.left = '0px'
  document.body.appendChild( renderer.domElement );


  // init scene and camera
  var scene	= new THREE.Scene();
  var camera = new THREE.Camera();
  scene.add(camera);
  const light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 0.5, 0, 1 );
  scene.add( light );
  //handle resize
  window.addEventListener('resize', function(){
    onResize()
  })

  function onResize(){
    const width = window.innerWidth;
    const height = window.innerHeight;

    // レンダラーのサイズを調整する
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    arToolkitSource.onResizeElement()
    arToolkitSource.copyElementSizeTo(renderer.domElement)
    if( arToolkitContext.arController !== null ){
      arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)
    }
  }

  ////////////////////////////////////////////////////////////////////////////////
  //          handle arToolkit
  ////////////////////////////////////////////////////////////////////////////////

  //arToolkitSource
  var arToolkitSource = new THREEx.ArToolkitSource({
    sourceType : 'webcam',
  })
  arToolkitSource.init(function onReady(){
    onResize()
  })

  //atToolkitContext
  var arToolkitContext = new THREEx.ArToolkitContext({
    cameraParametersUrl: 'data/camera_para.dat',
    detectionMode: 'mono',
    //imageSmoothingEnabled: true,                        // 画像をスムージングするか（デフォルトfalse）
    //maxDetectionRate: 60,                               // マーカの検出レート（デフォルト60）
    //canvasWidth: 500,         // マーカ検出用画像の幅（デフォルト640）
    //canvasHeight: 500,
  })
  arToolkitContext.init(function onCompleted(){
    camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
  })

  var marker1 = new THREE.Group();
  scene.add(marker1);

  // init controls for camera
  var markerControls = new THREEx.ArMarkerControls(arToolkitContext, marker1, {
    type : 'pattern',
    patternUrl : 'patt.hiro',
    //changeMatrixMode: 'cameraTransformMatrix'
  })


  const mesh = new THREE.Mesh(
    new THREE.CubeGeometry(0.5, 0.5, 0.5),
    new THREE.MeshNormalMaterial(),
  );
  mesh.position.y = 1.0;
  scene.add(mesh);

  sceneUpdate();

  const clock = new THREE.Clock();
  function sceneUpdate(){
    requestAnimationFrame( sceneUpdate );
    if( arToolkitSource.ready === false ){return;}
    arToolkitContext.update( arToolkitSource.domElement );

    const delta = clock.getDelta();
    mesh.rotation.x += delta * 1.0;
    mesh.rotation.y += delta * 1.5;

    renderer.render( scene, camera );
  }
}

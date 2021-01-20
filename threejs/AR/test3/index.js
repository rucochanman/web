window.addEventListener( "DOMContentLoaded", init );
function init() {

    ///////////////////////////////////////////////
    //    　　　　　　 画面設定                   //
    //////////////////////////////////////////////

    //レンダラーの作成
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setClearColor( new THREE.Color(), 0 );
    renderer.setSize( 640, 480 );
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0px';
    renderer.domElement.style.left = '0px';
    document.body.appendChild( renderer.domElement );
    //画面設定
    const scene = new THREE.Scene();
    scene.visible = false;
    const camera = new THREE.Camera();
    scene.add(camera);
    const light = new THREE.AmbientLight( 0xFFFFFF, 1.0 );
    scene.add(light);
    //画面リサイズの設定
    window.addEventListener('resize', () => { onResize() });
    function onResize() {
        arToolkitSource.onResizeElement();
        arToolkitSource.copyElementSizeTo( renderer.domElement );
        if ( arToolkitContext.arController !== null ) {
            arToolkitSource.copyElementSizeTo( arToolkitContext.arController.canvas );
        }
    };
    //AR周りの設定
    const arToolkitSource = new THREEx.ArToolkitSource({
        sourceType: 'webcam'
    });
    arToolkitSource.init(() => {
        setTimeout(() => {
            onResize();
        }, 2000 );
    });
    const arToolkitContext = new THREEx.ArToolkitContext({
        cameraParametersUrl: 'data/camera_para.dat',
        detectionMode: 'mono'
    });
    arToolkitContext.init(() => {
        camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
    });

    ///////////////////////////////////////////////
    //    　　       マーカーの設定               //
    //////////////////////////////////////////////

    const marker1 = new THREE.Group();
    scene.add( marker1 );
    const arMarkerControls = new THREEx.ArMarkerControls( arToolkitContext, marker1, {
        type: 'pattern',
        patternUrl: 'data/pattern-sneak.patt',
    });

    ///////////////////////////////////////////////
    //    　　      モデルの読み込み              //
    //////////////////////////////////////////////

    
    let apple;
    const gltfloader = new THREE.GLTFLoader();
    gltfloader.load( './data/apple.glb',function( gltf ){
        apple = gltf.scene;
        apple.scale.set( 0.5, 0.5, 0.5 );
        marker1.add( apple );
    });
    

    const armMat = new THREE.MeshNormalMaterial({
        side:THREE.DoubleSide,
    });

    const upperArmLength = 20;
    const lowerArmLength = 20;
    const upperArmThick = 5;
    const fingerLength = 2;
    const fingerThick = 1;

    const upperArmObj = new Limbs();
    const jointArmObj = new Limbs();
    const lowerArmObj = new Limbs();
    const fingerObj = new Limbs();

    let upperArmGeo;
    let jointArmGeo;
    let lowerArmGeo;

    const armG = new THREE.Group();
    const lowerArmG = new THREE.Group();
    const handG = new THREE.Group();

    const mesh = new THREE.Mesh(
      new THREE.CubeGeometry(1, 1, 1),
      new THREE.MeshNormalMaterial(),
    );
    mesh.position.y = 1.0;
    //marker1.add(mesh);
    
    

    ///////////////////////////////////////////////
    //    　　　　  　レンダリング開始             //
    //////////////////////////////////////////////

    requestAnimationFrame( function animate(){
        requestAnimationFrame( animate );
        if ( arToolkitSource.ready ) {
            arToolkitContext.update( arToolkitSource.domElement );
            scene.visible = camera.visible;
        }
        //apple.rotation.z += 0.01;
        renderer.render( scene, camera );
    });
}

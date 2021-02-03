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
    scene.add( camera );
    const envlight = new THREE.AmbientLight( 0xFFFFFF, 0.5 );
    scene.add( envlight );
    const light = new THREE.DirectionalLight( 0xffffff, 0.7 );
    light.position.set(0, 1, 1);
    scene.add( light );
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

    const marker = new THREE.Group();
    scene.add( marker );
    const arMarkerControls = new THREEx.ArMarkerControls( arToolkitContext, marker, {
        type: 'pattern',
        patternUrl: "data/pattern-sneak.patt",
    });

    ///////////////////////////////////////////////
    //    　　      モデルの読み込み              //
    //////////////////////////////////////////////

    //(1)Planeジオメトリ(座標)を作成
    const planeGeo = new THREE.BoxGeometry( 1, 1, 1 );
    //(2)マテリアル(材質)にShaderMaterialを指定する
    const testMat = new THREE.ShaderMaterial({
        vertexShader: document.getElementById('vert').textContent,
        fragmentShader: document.getElementById('frag').textContent,
        side:THREE.DoubleSide,
        lights: true
    });
    //(3)ジオメトリとマテリアルからメッシュを作成
    const plane = new THREE.Mesh( planeGeo, testMat );
    plane.position.y = 1;
    //(4)メッシュをシーンに追加
    marker.add( plane );


    ///////////////////////////////////////////////
    //    　　　　  　レンダリング開始             //
    //////////////////////////////////////////////

    function update(){
    }

    requestAnimationFrame( function animate(){

        //update();

        requestAnimationFrame( animate );
        if ( arToolkitSource.ready ) {
            arToolkitContext.update( arToolkitSource.domElement );
            scene.visible = camera.visible;
        }

        renderer.render( scene, camera );
    });
}

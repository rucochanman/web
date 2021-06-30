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
    const light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set(1, 0, 1);
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

    /*
    const markerNames = [ "sneak", "box", "stop", "wing" ];
    const markerArray = [];

    for ( let i=0; i<markerNames.length ; i++ ){
        const marker = new THREE.Group();
        scene.add( marker );
        markerArray.push( marker );
        const arMarkerControls = new THREEx.ArMarkerControls( arToolkitContext, marker, {
            type: 'pattern',
            patternUrl: "data/pattern/pattern-" + markerNames[i] + ".patt",
        });
    }

    */

    const marker = new THREE.Group();
    scene.add( marker );
    const arMarkerControls = new THREEx.ArMarkerControls( arToolkitContext, marker, {
        type: 'pattern',
        patternUrl: "data/pattern/pattern-box.patt",
    });

    ///////////////////////////////////////////////
    //    　　     モデルの読み込み               //
    //////////////////////////////////////////////

    const gltfloader = new THREE.GLTFLoader();

    let crowleyHead;
    gltfloader.load( './data/model/crowley.glb',function( gltf ){
        crowleyHead = gltf.scene;
        crowleyHead.scale.set( 0.5, 0.5, 0.5 );
        crowleyHead.position.y = 0.3;
        crowleyHead.position.z = 0.2;
        crowleyHead.position.x = 0.3;
        marker.add( crowleyHead );
    });
    
    let apple;
        gltfloader.load( './data/model/apple.glb',function( gltf ){
        apple = gltf.scene;
        apple.scale.set( 0.5, 0.5, 0.5 );
        marker.add( apple );
    });

    makeModel( marker );

    ///////////////////////////////////////////////
    //    　　　　  　animation設定               //
    //////////////////////////////////////////////

    // arm
    /*
    const move = new THREE.Object3D();
    const dur1 = [ 0, 1.5, 3 ];
    const dur2 = [ 0, 1, 2.2, 3 ];

    const move1KF = new THREE.NumberKeyframeTrack( '.position', dur1, [-0.2, 0, 0, 0.5, 0, 0, -0.2, 0, 0] );
    const move2KF = new THREE.NumberKeyframeTrack( '.scale', dur2,
        [-0.2, 0.5, 0.5, 0.2, 0, 0, 0.3, 0, 0, -0.2, 0.5, 0.5] );
    const clip = new THREE.AnimationClip( 'Action', 3, [ move1KF, move2KF ] );
    const mixer = new THREE.AnimationMixer( move );
    const clipAction = mixer.clipAction( clip );
    clipAction.play();

    // road
    function roadUpdate(){
        const zpos = road.geometry.faceVertexUvs[0][0][2].x - 0.03;
        const pos1 = zpos < 0.2 ? 1.0 : zpos;
        const pos0 = pos1 - 0.2;
        road.geometry.faceVertexUvs[0][0][0].x = pos0;
        road.geometry.faceVertexUvs[0][0][1].x = pos0;
        road.geometry.faceVertexUvs[0][0][2].x = pos1;
        road.geometry.faceVertexUvs[0][1][0].x = pos0;
        road.geometry.faceVertexUvs[0][1][1].x = pos1;
        road.geometry.faceVertexUvs[0][1][2].x = pos1;
        road.geometry.uvsNeedUpdate = true;
    }
    */

    ///////////////////////////////////////////////
    //    　　　　  　レンダリング開始             //
    //////////////////////////////////////////////

    const clock = new THREE.Clock();

    function update(){
        /*
        if ( markerArray[1].visible ){
            mixer.update( clock.getDelta() );
            let arm = move.position.x;
            let pos = move.scale.x;
            let leg1 = move.scale.y;
            let leg2 = move.scale.z;
            aziraphale2.bodyG.position.y = pos;
            aziraphaleHead2.position.y = -0.1 + pos;
            aziraphaleBody2.position.y = pos;
            armUpdate( LEFT, aziraphale2, arm, 0.2, 0, 0 );
            armUpdate( RIGHT, aziraphale2, arm, 0.2, 0, 0 );
            legUpdate( LEFT, aziraphale2, leg1, leg2, 0, 0 );
            legUpdate( RIGHT, aziraphale2, leg1, leg2, 0, 0 );
        }
        if ( markerArray[2].visible ){
            roadUpdate();
        }
        if ( markerArray[3].visible ){
            mixer.update( clock.getDelta() );
            let angle1 = move.position.x;
            armUpdate( RIGHT, crowley, angle1, 0.2, 0, 0 );
            armUpdate( LEFT, aziraphale, angle1, 0.2, 0, 0 );
        }
        */
    }

    requestAnimationFrame( function animate(){
        update();
        requestAnimationFrame( animate );
        if ( arToolkitSource.ready ) {
            arToolkitContext.update( arToolkitSource.domElement );
            scene.visible = camera.visible;
        }
        renderer.render( scene, camera );
    });
}

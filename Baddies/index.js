window.addEventListener( "DOMContentLoaded", init );
function init() {

    ///////////////////////////////////////////////
    //    　　　　　　 画面設定                   //
    //////////////////////////////////////////////
    console.log("ver2");

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

    ///////////////////////////////////////////////
    //    　　       モデルの設定                 //
    //////////////////////////////////////////////

    const gltfloader = new THREE.GLTFLoader();
    
    let body;
    gltfloader.load( './data/model/body.glb',function( gltf ){
        body = gltf.scene;
        body.scale.set( 0.5, 0.5, 0.5 );
        //markerArray[0].add( body );
    });

    let apple;
    gltfloader.load( './data/model/apple.glb',function( gltf ){
        apple = gltf.scene;
        apple.scale.set( 0.5, 0.5, 0.5 );
        markerArray[0].add( apple );
    });

    let bentley;
    gltfloader.load( './data/model/bentley.glb',function( gltf ){
        bentley = gltf.scene;
        bentley.scale.set( 0.65, 0.65, 0.65 );
        bentley.position.y = 0.5;
        bentley.position.z = -0.25;
        bentley.rotation.y = -PI/2;
        markerArray[2].add( bentley );
    });

    let bench;
    gltfloader.load( './data/model/bench.glb',function( gltf ){
        bench = gltf.scene;
        bench.scale.set( 0.7, 0.7, 0.7 );
        markerArray[3].add( bench );
    });

    const grassTex = texLoader.load( './data/tex/grass.png' );
    const grass = new THREE.Mesh(
        new THREE.PlaneGeometry( 1.2, 1.2 ),
        new THREE.MeshBasicMaterial( {map:grassTex} )
    );
    grass.rotation.x = -PI/2;
    markerArray[3].add( grass );

    const roadTex = texLoader.load( './data/tex/road.png' );
    const road = new THREE.Mesh(
        new THREE.PlaneGeometry( 1.5, 1.5 ),
        new THREE.MeshBasicMaterial( {map:roadTex} )
    );
    const roadUv1 = [
        new THREE.Vector2(0, 1),
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0.2, 1)
    ];
    const roadUv2 = [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0.2, 0),
        new THREE.Vector2(0.2, 1.0)
    ];
    road.geometry.faceVertexUvs[0][0] = roadUv1;
    road.geometry.faceVertexUvs[0][1] = roadUv2;
    road.rotation.x = -PI/2;
    markerArray[2].add( road );
    
    makeModel( markerArray );

    ///////////////////////////////////////////////
    //    　　　　  　animation設定               //
    //////////////////////////////////////////////

    // arm
    const upperArmMove = new THREE.Object3D();
    const dur = [ 0, 2, 4 ];
    const posVal1 = [ -0.2, 1, -0.2 ];
    const posVal2 = [ 0, 1.5, 0 ];
    const rotVal1 = [ 0, 0, 0 ];
    const rotVal2 = [ 0, -PI/2, 0 ];

    const upperArmPos = [];
    const upperArmRot = [];
    for( let i=0; i<dur.length; i++ ){
        upperArmPos.push( posVal1[i] );
        upperArmPos.push( posVal2[i] );
        upperArmPos.push( 0 );
        upperArmRot.push( rotVal1[i] );
        upperArmRot.push( rotVal2[i] );
        upperArmRot.push( 0 );
    }

    const uppperArmKF1 = new THREE.NumberKeyframeTrack( '.position', dur, upperArmPos );
    const uppperArmKF2 = new THREE.NumberKeyframeTrack( '.scale', dur, upperArmRot );
    const clip = new THREE.AnimationClip( 'Action', 4, [ uppperArmKF1, uppperArmKF2 ] );
    const mixer = new THREE.AnimationMixer( upperArmMove );
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

    ///////////////////////////////////////////////
    //    　　　　  　レンダリング開始             //
    //////////////////////////////////////////////

    const clock = new THREE.Clock();

    function update(){
        if ( markerArray[1].visible ){
            mixer.update( clock.getDelta() );
            let angle1 = upperArmMove.position.x;
            let angle2 = upperArmMove.position.y;
            let rot1 = upperArmMove.scale.x;
            let rot2 = upperArmMove.scale.y;
            //armUpdate( LEFT, crowley, angle1, angle2, rot1, rot2 );
            //armUpdate( RIGHT, crowley, 1, 0, 0, 0 );
            //legUpdate( crowley, 0, 0, 0, 0 );
        }
        if ( markerArray[2].visible ){
            roadUpdate();
        }
        if ( markerArray[0].visible ){
            apple.rotation.y += 0.03;
        }
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

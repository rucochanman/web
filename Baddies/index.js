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
        markerArray[3].add( crowleyHead );
    });
    
    let aziraphaleHead;
    gltfloader.load( './data/model/aziraphale.glb',function( gltf ){
        aziraphaleHead = gltf.scene;
        aziraphaleHead.scale.set( 0.5, 0.5, 0.5 );
        aziraphaleHead.position.y = 0.3;
        aziraphaleHead.position.z = 0.2;
        aziraphaleHead.position.x = -0.3;
        markerArray[3].add( aziraphaleHead );
    });
 
    let aziraphaleHead2;
    gltfloader.load( './data/model/aziraphale.glb',function( gltf ){
        aziraphaleHead2 = gltf.scene;
        aziraphaleHead2.position.y = -0.1;
        aziraphaleHead2.scale.set( 0.5, 0.5, 0.5 );
        markerArray[1].add( aziraphaleHead2 );
    });
       
    let crowleyBody;
    gltfloader.load( './data/model/crowleyBody.glb',function( gltf ){
        crowleyBody = gltf.scene;
        crowleyBody.scale.set( 0.25, 0.25, 0.25 );
        crowleyBody.position.y = 0.4;
        crowleyBody.position.z = 0.2;
        crowleyBody.position.x = 0.3;
        markerArray[3].add( crowleyBody );
    });
    
    let aziraphaleBody;
    gltfloader.load( './data/model/aziraphaleBody.glb',function( gltf ){
        aziraphaleBody = gltf.scene;
        aziraphaleBody.scale.set( 0.25, 0.25, 0.25 );
        aziraphaleBody.position.y = 0.4;
        aziraphaleBody.position.z = 0.2;
        aziraphaleBody.position.x = -0.3;
        markerArray[3].add( aziraphaleBody );
    });
    
    let aziraphaleBody2;
    gltfloader.load( './data/model/aziraphaleBody.glb',function( gltf ){
        aziraphaleBody2 = gltf.scene;
        aziraphaleBody2.scale.set( 0.25, 0.25, 0.25 );
        markerArray[1].add( aziraphaleBody2 );
    });
    
    let ice1;
    gltfloader.load( './data/model/ice1.glb',function( gltf ){
        ice1 = gltf.scene;
        ice1.scale.set( 0.25, 0.25, 0.25 );
        ice1.position.x = -0.5;
        ice1.position.z = 0.28;
        ice1.position.y = 0.47;
        ice1.rotation.z = PI/4;
        markerArray[3].add( ice1 );
    });

    let ice2;
    gltfloader.load( './data/model/ice2.glb',function( gltf ){
        ice2 = gltf.scene;
        ice2.scale.set( 0.25, 0.25, 0.25 );
        ice2.position.x = 0.5;
        ice2.position.z = 0.28;
        ice2.position.y = 0.47;
        ice2.rotation.z = -PI/4;
        markerArray[3].add( ice2 );
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
        bench.position.z = -0.25;
        markerArray[3].add( bench );
    });

    const grassTex = texLoader.load( './data/tex/grass.png' );
    const grass = new THREE.Mesh(
        new THREE.PlaneGeometry( 1.65, 1.6 ),
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
    
    //box
    const planeSize = 0.9;
    const planeGeo = new THREE.PlaneGeometry( planeSize, planeSize );
    const planeMat = new THREE.MeshLambertMaterial( {
      color: 0x550055,
      opacity: 0.8,
      transparent: true,
      side: THREE.DoubleSide
    } );
    const plane = new THREE.Mesh( planeGeo, planeMat );
    plane.rotation.x = PI/2;
    plane.position.y = -planeSize/2;
    markerArray[1].add( plane );
    for( let i=0; i<4; i++ ){
        const side = new THREE.Mesh( planeGeo, planeMat );
        const rot = i * -PI/2;
        const posx = [0, -planeSize/2, 0, planeSize/2];
        const posz = [planeSize/2, 0, -planeSize/2, 0];
        side.rotation.y = rot;
        side.position.x = posx[i];
        side.position.z = posz[i];
        markerArray[1].add( side );
    }
    
    makeModel( markerArray );

    ///////////////////////////////////////////////
    //    　　　　  　animation設定               //
    //////////////////////////////////////////////

    // arm
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

    ///////////////////////////////////////////////
    //    　　　　  　レンダリング開始             //
    //////////////////////////////////////////////

    const clock = new THREE.Clock();

    function update(){
        if ( markerArray[0].visible ){
            apple.rotation.y += 0.03;
        }
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

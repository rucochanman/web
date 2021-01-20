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

    /*
    let apple;
    const gltfloader = new THREE.GLTFLoader();
    gltfloader.load( './data/apple.glb',function( gltf ){
        apple = gltf.scene;
        apple.scale.set( 0.5, 0.5, 0.5 );
        marker1.add( apple );
    });
    */

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



    ///////////////////////////////////////////////
    //    　　　　 マテリアル配置                  //
    //////////////////////////////////////////////

    //limbsクラス
    function Limbs(){
        this.seg = limbSeg;
        this.edge = limbEdge;
        this.ep = new THREE.Vector2( 1,0 );
        this.cp = new THREE.Vector2( 1,0 );
        this.thick = 0;
        this.width = 0;
    }

    function armInit(){
        //thicks
        const upperArmThicks = new Array( limbSeg );
        const lowerArmThicks = new Array( limbSeg );
        const lowerArmWidths = new Array( limbSeg );
        const fingerThicks = new Array( limbSeg );

        for( let i=0; i<( limbSeg+1 ); i++ ){
            const t = i / limbSeg;
            upperArmThicks[i] = upperArmThick;
            lowerArmWidths[i] = upperArmThick - Math.pow( t, 3 ) * upperArmThick;
            lowerArmThicks[i] = upperArmThick - Math.pow( t, 5 ) * upperArmThick;
            fingerThicks[i] = fingerThick - Math.pow( t, 3 ) * fingerThick;
        }

        //set parameter
        upperArmObj.thick = upperArmThicks;
        upperArmObj.width = upperArmThicks;
        jointArmObj.seg *= 2;
        lowerArmObj.thick = lowerArmThicks;
        lowerArmObj.width = lowerArmWidths;
        fingerObj.ep = new THREE.Vector2( fingerLength,0 );
        fingerObj.cp = new THREE.Vector2( fingerLength,0 );
        fingerObj.thick = fingerThicks;
        fingerObj.width = fingerThicks;

        //make pt
        const fingerPt = makePipePt( fingerObj );
        const upperArmpt = makePipePt( upperArmObj );
        const jointArmPt = makeJointPt( upperArmObj, -1 );
        const lowerArmPt = makePipePt( lowerArmObj );
        const lowerArmPts = jointArmPt.concat( lowerArmPt );

        //makeGeo
        upperArmGeo = makeGeometry( upperArmObj, upperArmpt );
        lowerArmGeo = makeGeometry( jointArmObj, lowerArmPts );
        const fingerGeo = makeGeometry( fingerObj, fingerPt );

        //makeMesh
        const upperArmMesh = new THREE.Mesh( upperArmGeo, armMat );
        const lowerArmMesh = new THREE.Mesh( lowerArmGeo, armMat );

        const fingerAngles = [ -PI/4, -PI/8, 0, PI/4 ];
        const handLength = ( upperArmLength + lowerArmLength ) * 0.11;
        for( let i=0; i<4; i++ ){
            const fingerMesh = new THREE.Mesh( fingerGeo, armMat );
            const z = ( upperArmThick*0.8 ) * Math.sin( fingerAngles[i] );
            const x = ( upperArmThick*0.8 ) * Math.cos( fingerAngles[i] );
            fingerMesh.rotation.y = -fingerAngles[i];
            fingerMesh.position.set( x - ( handLength ), 0, z );
            handG.add( fingerMesh );
        }

        //grouping
        lowerArmG.add( lowerArmMesh );
        lowerArmG.add( handG );
        armG.add( upperArmMesh );
        armG.add( lowerArmG );
        //add mesh to scene
        armG.position.y = 0.1;
        armG.scale.set( 0.05, 0.05, 0.05 );
        marker1.add( armG );
    }

    function upperArmUpdate( angle ){
        const bend = mapping( angle, -1.0, 2.0, PI/4, -PI/2 );
        const { ep, cp } = getBezierPt( upperArmLength, bend );
        upperArmObj.ep = ep;
        upperArmObj.cp = cp;
        const pt = makePipePt( upperArmObj );
        updateGeometry( upperArmObj, pt, upperArmGeo );
    }

    function lowerArmUpdate( angle ){
        const bend = mapping( angle, 0.0, 1.5, -0.05, -3*PI/4 );
        const jointArmPt = makeJointPt( upperArmObj, bend );
        const { ep, cp } = getBezierPt2( bend, upperArmLength, upperArmThick );
        lowerArmObj.ep = ep;
        lowerArmObj.cp = cp;
        const lowerArmPt = makePipePt( lowerArmObj );
        const lowerArmPts = jointArmPt.concat( lowerArmPt );
        updateGeometry( jointArmObj, lowerArmPts, lowerArmGeo );
        lowerArmG.position.set( upperArmObj.ep.x, upperArmObj.ep.y, 0 );
    }

    function armUpdate( angle1, angle2, rot1, rot2 ){
        //reset
        lastAngle = 0;
        lastPos = new THREE.Vector2();
        upperArmUpdate( angle1 );
        //lowerArm
        const r = lastAngle;
        lowerArmUpdate( angle2 );
        //hand
        handG.rotation.z = lastAngle;
        handG.position.set( lastPos.x, lastPos.y, 0 );
        //rotation
        const axis1 = new THREE.Vector3( 1,0,0 );
        const axis2 = new THREE.Vector3( Math.cos(r),Math.sin(r),0 ).normalize();
        const q1 = new THREE.Quaternion().setFromAxisAngle( axis1, rot1 );
        const q2 = new THREE.Quaternion().setFromAxisAngle( axis2, rot2 );
        armG.applyQuaternion( q1 );
        lowerArmG.applyQuaternion( q2 );
    }

    armInit();
    armUpdate( 0.5, 0.5, -PI/4, -PI/8 );

    ///////////////////////////////////////////////
    //    　　　　  　animation設定               //
    //////////////////////////////////////////////

    // POSITION
    const upperArmMove = new THREE.Object3D();
    const dur = [ 0, 2, 4 ];
    const val1 = [ 2, -1, 2 ];
    const val2 = [ 0, 1.5, 0 ];

    const upperArmPos = [];
    for( let i=0; i<dur.length; i++ ){
        upperArmPos.push( val1[i] );
        upperArmPos.push( val2[i] );
        upperArmPos.push( 0 );
    }

    //const move = [];
    const uppperArmKF = new THREE.NumberKeyframeTrack( '.position', dur, upperArmPos );
    const clip = new THREE.AnimationClip( 'Action', 4, [ uppperArmKF ] );
    const mixer = new THREE.AnimationMixer( upperArmMove );
    const clipAction = mixer.clipAction( clip );
    clipAction.play();

    ///////////////////////////////////////////////
    //    　　　　  　レンダリング開始             //
    //////////////////////////////////////////////

    requestAnimationFrame( function animate(){
        requestAnimationFrame( animate );
        if ( arToolkitSource.ready ) {
            arToolkitContext.update( arToolkitSource.domElement );
            scene.visible = camera.visible;
        }
        //animation update
        mixer.update(clock.getDelta());
        let angle1 = upperArmMove.position.x;
        let angle2 = upperArmMove.position.y;
        armUpdate( angle1, angle2, -PI/4, -PI/8 );
        renderer.render( scene, camera );
    });
}

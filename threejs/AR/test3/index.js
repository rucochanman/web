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
    //    　　       　　 defs                   //
    //////////////////////////////////////////////

    const upperArmLength = 13;
    const lowerArmLength = 18;
    const upperArmThick = 5;

    const upperArmObj = new Limbs();
    const jointArmObj = new Limbs();
    const lowerArmObj = new Limbs();
    const fingerObj = new Limbs();

    const armG = new THREE.Group();
    const lowerArmG = new THREE.Group();
    const handG = new THREE.Group();

    //limbsクラス
    function Limbs(){
        this.seg = limbSeg;
        this.edge = limbEdge;
        this.ep = new THREE.Vector2( 1,0 );
        this.cp = new THREE.Vector2( 1,0 );
        this.thick = 0;
        this.width = 0;
    }

    ///////////////////////////////////////////////
    //    　　      material設定              //
    //////////////////////////////////////////////

    const texLoader = new THREE.TextureLoader();
    const armTex = texLoader.load( './data/tex/arm.png' );
    const bleckTex = texLoader.load( './data/tex/black.png' );
    const skinTex = texLoader.load( './data/tex/skin.png' );
    const roadTex = texLoader.load( './data/tex/road.png' );

    const uniform = THREE.UniformsUtils.merge([
        THREE.UniformsLib['lights'],{
            'uTexture': { value: null },
        }
    ]);

    const material = new THREE.ShaderMaterial({
        vertexShader: document.getElementById('vert').textContent,
        fragmentShader: document.getElementById('frag').textContent,
        uniforms: uniform,
        side:THREE.DoubleSide,
        lights: true
    });

    ///////////////////////////////////////////////
    //    　　          arm作成                  //
    //////////////////////////////////////////////

    
    function armInit(){
        //set thickss
        const upperArmThicks = new Array( limbSeg );
        const lowerArmThicks = new Array( limbSeg );
        const lowerArmWidths = new Array( limbSeg );
        const fingerThicks = new Array( limbSeg );
        const armLength = upperArmLength + lowerArmLength;
        const fingerLength = armLength / 12;
        const fingerThick = upperArmThick / 5;

        for( let i=0; i<( limbSeg+1 ); i++ ){
            const t = i / limbSeg;
            upperArmThicks[i] = upperArmThick;
            lowerArmWidths[i] = upperArmThick - Math.pow( t, 2.5 ) * upperArmThick;
            lowerArmThicks[i] = upperArmThick - Math.pow( t, 4 ) * upperArmThick;
            fingerThicks[i] = fingerThick - Math.pow( t, 3 ) * fingerThick;
        }

        //set parameters
        upperArmObj.thick = upperArmThicks;
        upperArmObj.width = upperArmThicks;
        jointArmObj.seg *= 2;
        lowerArmObj.thick = lowerArmThicks;
        lowerArmObj.width = lowerArmWidths;
        fingerObj.ep = new THREE.Vector2( fingerLength,0 );
        fingerObj.cp = new THREE.Vector2( fingerLength,0 );
        fingerObj.thick = fingerThicks;
        fingerObj.width = fingerThicks;

        //material
        const armMat = material.clone();
        armMat.uniforms.uTexture.value = armTex;
        const blackMat = material.clone();
        blackMat.uniforms.uTexture.value = bleckTex;
        const skinMat = material.clone();
        skinMat.uniforms.uTexture.value = skinTex;

        //upper arm
        const upperArmUv = makeUvmap( upperArmObj );
        const upperArmpt = makePipePt( upperArmObj );
        const upperArmMesh = new THREE.Mesh(
            makeGeometry( upperArmObj, upperArmpt, upperArmUv ),
            blackMat
        );

        //lower arm
        const jointArmPt = makeJointPt( upperArmObj, -1 );
        const lowerArmPt = makePipePt( lowerArmObj );
        const lowerArmPts = jointArmPt.concat( lowerArmPt );
        const jointArmUv = makeUvmap( jointArmObj );
        const lowerArmMesh = new THREE.Mesh(
            makeGeometry( jointArmObj, lowerArmPts, jointArmUv ),
            armMat
        );

        //hand
        lastValClear();
        const fingerPt = makePipePt( fingerObj );
        const fingerGeo = makeGeometry( fingerObj, fingerPt, upperArmUv );
        const fingerAngles = [ -PI/5, -PI/12, PI/32, PI/4 ];
        for( let i=0; i<4; i++ ){
            const fingerMesh = new THREE.Mesh( fingerGeo, skinMat );
            const z = ( upperArmThick*0.8 ) * Math.sin( fingerAngles[i] );
            const x = ( upperArmThick*0.8 ) * Math.cos( fingerAngles[i] );
            fingerMesh.rotation.y = -fingerAngles[i];
            fingerMesh.position.set( x - fingerLength*2, 0, z );
            handG.add( fingerMesh );
        }

        //grouping
        lowerArmG.add( lowerArmMesh );
        lowerArmG.add( handG );
        armG.add( upperArmMesh );
        armG.add( lowerArmG );

        //add mesh to scene
        armG.scale.set( 0.05, 0.05, 0.05 );
        markerArray[0].add( armG );
    }

    function upperArmUpdate( angle ){
        const bend = mapping( angle, -1.0, 2.0, PI/4, -PI/2 );
        const { ep, cp } = getBezierPt( upperArmLength, bend );
        upperArmObj.ep = ep;
        upperArmObj.cp = cp;
        const pt = makePipePt( upperArmObj );
        updateGeometry( upperArmObj, pt, armG.children[0].geometry );
    }

    function lowerArmUpdate( angle ){
        const bend = mapping( angle, 0.0, 1.5, -0.05, -3*PI/4 );
        const jointArmPt = makeJointPt( upperArmObj, bend );
        const { ep, cp } = getBezierPt2( bend, lowerArmLength, upperArmThick );
        lowerArmObj.ep = ep;
        lowerArmObj.cp = cp;
        const lowerArmPt = makePipePt( lowerArmObj );
        const lowerArmPts = jointArmPt.concat( lowerArmPt );
        updateGeometry( jointArmObj, lowerArmPts, lowerArmG.children[0].geometry );
        lowerArmG.position.set( upperArmObj.ep.x, upperArmObj.ep.y, 0 );
    }

    function armUpdate( angle1, angle2, rotate1, rotate2 ){
        //upperArm
        lastValClear();
        upperArmUpdate( angle1 );
        //lowerArm
        const r = lastAngle;
        lowerArmUpdate( angle2 );
        //hand
        handG.rotation.z = lastAngle;
        handG.position.set( lastPos.x, lastPos.y, 0 );
        //rotation
        armG.quaternion.set( 0,0,0,1 );
        lowerArmG.quaternion.set( 0,0,0,1 );
        const axis1 = new THREE.Vector3( 1,0,0 );
        const axis2 = new THREE.Vector3( Math.cos(r),Math.sin(r),0 ).normalize();
        const q1 = new THREE.Quaternion().setFromAxisAngle( axis1, rotate1 );
        const q2 = new THREE.Quaternion().setFromAxisAngle( axis2, rotate2 );
        armG.applyQuaternion( q1 );
        lowerArmG.applyQuaternion( q2 );
    }

    armInit();
    armUpdate( 0, 0, 0, 0 );    
    






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

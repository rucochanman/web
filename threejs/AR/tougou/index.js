//ページの読み込みを待つ
window.addEventListener('load', init);
function init() {

    ///////////////////////////////////////////////
    //    　　　　　　 画面設定                   //
    //////////////////////////////////////////////

    //画面サイズを指定
    const width = window.innerWidth;
    const height = window.innerHeight;
    //レンダラーを作成
    const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector( '#myCanvas' )
    });
    renderer.setClearColor( new THREE.Color( 'grey' ) );
    document.body.appendChild( renderer.domElement );
    renderer.setSize( width, height );
    //シーンを作成
    const scene = new THREE.Scene();
    //カメラを作成
    const camera = new THREE.PerspectiveCamera( 45, width / height );
    camera.position.set( 20, 0, 100 );
    camera.lookAt(new THREE.Vector3( 20, 0, 0 ));
    //ライトを設置
    const envlight = new THREE.AmbientLight( 0xffffff, 0.2 );
    scene.add(envlight);
    const light1 = new THREE.DirectionalLight( 0xffffff, 0.5 );
    light1.position.set(0, 20, 10);
    scene.add(light1);
    const light2 = new THREE.DirectionalLight( 0xffffff, 0.25 );
    light2.position.set(0, 0, 10);
    scene.add(light2);

    ///////////////////////////////////////////////
    //    　　       　　 defs                   //
    //////////////////////////////////////////////



    //const armMat = new THREE.MeshLambertMaterial({
        //side:THREE.DoubleSide,
        //wireframe: true
    //});

    const upperArmLength = 13;
    const lowerArmLength = 18;
    const upperArmThick = 5;

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
    //    　　　　 マテリアル配置                  //
    //////////////////////////////////////////////

    const texLoader = new THREE.TextureLoader();
    const textTex = texLoader.load( './data/tex/tex.png' );

    const vert = document.getElementById('vert').textContent;
    const frag = document.getElementById('frag').textContent;

    const uniform = THREE.UniformsUtils.merge([
        THREE.UniformsLib['lights'],{
            'uTexture': { value: null },
            //'uTone': { value: null },
            //'uColor1': { value: null },
            //'uColor2': { value: null }
        }
    ]);

    const material = new THREE.ShaderMaterial({
        side:THREE.DoubleSide,
        uniforms: uniform,
        vertexShader: vert,
        fragmentShader: null,
        lights: true
    });

    //let monoMat = material.clone();
    //monoMat.fragmentShader = mono_frag;

    const uvMat = material.clone();
    uvMat.fragmentShader = frag;
    uvMat.uniforms.uTexture = textTex;

    const cubegeometry = new THREE.BoxGeometry( 20, 20, 20 );
    const cubematerial = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    const cube = new THREE.Mesh( cubegeometry, uvMat );
    scene.add( cube );



    const armMat = new THREE.MeshNormalMaterial({
        side:THREE.DoubleSide,
        //wireframe: true
    });



    ///////////////////////////////////////////////
    //    　　　　      arm関連                   //
    //////////////////////////////////////////////

    function armInit(){
        //set thickss
        const upperArmThicks = new Array( limbSeg );
        const lowerArmThicks = new Array( limbSeg );
        const lowerArmWidths = new Array( limbSeg );
        const fingerThicks = new Array( limbSeg );
        const fingerLength = upperArmLength / 10;
        const fingerThick = upperArmThick / 5;

        for( let i=0; i<( limbSeg+1 ); i++ ){
            const t = i / limbSeg;
            upperArmThicks[i] = upperArmThick;
            lowerArmWidths[i] = upperArmThick - Math.pow( t, 3 ) * upperArmThick;
            lowerArmThicks[i] = upperArmThick - Math.pow( t, 5 ) * upperArmThick;
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

        //upper arm
        const upperArmpt = makePipePt( upperArmObj );
        upperArmGeo = makeGeometry( upperArmObj, upperArmpt );
        const upperArmMesh = new THREE.Mesh( upperArmGeo, armMat );

        //lower arm
        const jointArmPt = makeJointPt( upperArmObj, -1 );
        const lowerArmPt = makePipePt( lowerArmObj );
        const lowerArmPts = jointArmPt.concat( lowerArmPt );
        lowerArmGeo = makeGeometry( jointArmObj, lowerArmPts );
        const lowerArmMesh = new THREE.Mesh( lowerArmGeo, armMat );

        //hand
        lastValClear();
        const fingerPt = makePipePt( fingerObj );
        const fingerGeo = makeGeometry( fingerObj, fingerPt );
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
        //scene.add( armG );
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
        const { ep, cp } = getBezierPt2( bend, lowerArmLength, upperArmThick );
        lowerArmObj.ep = ep;
        lowerArmObj.cp = cp;
        const lowerArmPt = makePipePt( lowerArmObj );
        const lowerArmPts = jointArmPt.concat( lowerArmPt );
        updateGeometry( jointArmObj, lowerArmPts, lowerArmGeo );
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
    //    　　　　  　model  設定                 //
    //////////////////////////////////////////////


    /*
    const gltfloader = new THREE.GLTFLoader();
    const modelLight = new THREE.DirectionalLight( 0xFFFFFF, 1 );
    modelLight.position.set( 0, 0.5, 1 );
    let bentley;
    gltfloader.load( './data/model/bentley.glb',function( gltf ){
        bentley = gltf.scene;
        bentley.scale.set( 2, 2, 2 );
        scene.add( bentley );
        scene.add( modelLight );
        //markerArray[2].children[0].add( bentley );
        //markerArray[2].children[0].add( modelLight );
    });
    */

    ///////////////////////////////////////////////
    //    　　　　  　animation設定               //
    //////////////////////////////////////////////

    // POSITION
    const upperArmMove = new THREE.Object3D();
    const dur = [ 0, 2, 4 ];
    const posVal1 = [ -0.5, 0, -0.5 ];
    const posVal2 = [ 0, 1.5, 0 ];
    const rotVal1 = [ 0, 0, 0 ];
    const rotVal2 = [ 0, -PI, 0 ];

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

    //const move = [];
    const uppperArmKF1 = new THREE.NumberKeyframeTrack( '.position', dur, upperArmPos );
    const uppperArmKF2 = new THREE.NumberKeyframeTrack( '.scale', dur, upperArmRot );
    const clip = new THREE.AnimationClip( 'Action', 4, [ uppperArmKF1, uppperArmKF2 ] );
    const mixer = new THREE.AnimationMixer( upperArmMove );
    const clipAction = mixer.clipAction( clip );
    clipAction.play();

    ///////////////////////////////////////////////
    //    　　　　  　レンダリング開始             //
    //////////////////////////////////////////////

    const clock = new THREE.Clock();
    render();

    function update(){
        mixer.update(clock.getDelta());
        let angle1 = upperArmMove.position.x;
        let angle2 = upperArmMove.position.y;
        let rot1 = upperArmMove.scale.x;
        let rot2 = upperArmMove.scale.y;
        armUpdate( angle1, angle2, rot1, rot2 );
    }

    function render(){
        //update();
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }
}

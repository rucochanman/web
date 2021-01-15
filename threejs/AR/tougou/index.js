
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
    const light1 = new THREE.DirectionalLight(0xffffff, 0.8);
    light1.position.set(0, 20, 10);
    scene.add(light1);

    ///////////////////////////////////////////////
    //    　　       　　 defs                   //
    //////////////////////////////////////////////

    const armMat = new THREE.MeshNormalMaterial({
        side:THREE.DoubleSide,
        //wireframe: true
    });

    //const armMat = new THREE.MeshLambertMaterial({
        //side:THREE.DoubleSide,
        //wireframe: true
    //});

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


    function upperArmInit(){


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
            lowerArmWidths[i] = upperArmThick - pow( t, 3 ) * upperArmThick;
            lowerArmThicks[i] = upperArmThick - pow( t, 5 ) * upperArmThick;
            fingerThicks[i] = fingerThick - pow( t, 4 ) * fingerThick;
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
        const jointArmPt = makeJointPt( upperArmObj, -0.05 );
        const lowerArmPt = makePipePt( lowerArmObj );
        const lowerArmPts = jointArmPt.concat( lowerArmPt );

        //makeGeo
        upperArmGeo = makeGeometry( upperArmObj, upperArmpt );
        lowerArmGeo = makeGeometry( jointArmObj, lowerArmPts );
        const fingerGeo = makeGeometry( fingerObj, fingerPt );

        //makeMesh
        const upperArmMesh = new THREE.Mesh( upperArmGeo, armMat );
        const lowerArmMesh = new THREE.Mesh( lowerArmGeo, armMat );
        const fingerMesh = new THREE.Mesh( fingerGeo, armMat );

        //grouping
        handG.add( fingerMesh );
        lowerArmG.add( lowerArmMesh );
        lowerArmG.add( handG );
        armG.add( upperArmMesh );
        armG.add( lowerArmG );

        //add mesh to scene
        scene.add( armG );
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

    function armUpdate( angle1, angle2, rotate1, rotate2 ){
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
        const axis2 = new THREE.Vector3( cos(r),sin(r),0 ).normalize();
        const q1 = new THREE.Quaternion();
        const q2 = new THREE.Quaternion();
        q1.setFromAxisAngle( axis1, rotate1 );
        q2.setFromAxisAngle( axis2, rotate2 );
        armG.applyQuaternion( q1 );
        lowerArmG.applyQuaternion( q2 );
    }

    armInit();
    armUpdate( 0.8, 0.5, -PI/4, 0 );


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

    const clock = new THREE.Clock();
    let count = 0;
    render();
    function render(){
        //animation update
        //mixer.update(clock.getDelta());
        //let angle1 = upperArmMove.position.x;
        //let angle2 = upperArmMove.position.y;
        //armUpdate( angle1, angle2 );

        //cycle
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }
}

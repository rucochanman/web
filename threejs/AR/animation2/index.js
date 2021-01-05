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
        canvas: document.querySelector('#myCanvas')
    });
    renderer.setClearColor(new THREE.Color('grey'));
    document.body.appendChild( renderer.domElement );
    renderer.setSize(width, height);
    //シーンを作成
    const scene = new THREE.Scene();
    //カメラを作成
    const camera = new THREE.PerspectiveCamera(45, width / height);
    camera.position.set(0, 50, 100);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    //ライトを設置
    const envlight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(envlight);

    ///////////////////////////////////////////////
    //    　　　　 マテリアル配置                  //
    //////////////////////////////////////////////

    const upperArmLength = 20;
    const upperArmThick = 5;
    const upperArmObj = new Limbs();
    const upperArmMat = new THREE.MeshNormalMaterial({
        side:THREE.DoubleSide,
    });
    let upperArmGeo;
    let jointArmGeo;
    let lowerArmGeo;
    let jointArmMesh;


    //limbsクラス
    function Limbs(){
        this.seg = limbSeg;
        this.edge = limbEdge;
        this.ep = new THREE.Vector2();
        this.cp = new THREE.Vector2();
        this.thick = 0;
        this.width = 0;
    }

    function limbUpdate( angle ){
        const bend = mapping( angle, -1.0, 2.0, PI/4, -PI/2 );
        const { ep, cp } = getBezierPt2( upperArmLength, bend );
        upperArmObj.ep = ep;
        upperArmObj.cp = cp;
        const pt = makePipePt( upperArmObj );
        updateGeometry( upperArmObj, pt, upperArmGeo );
    }

    function upperArmInit(){
        //set thick/width
        const upperArmThicks = new Array( limbSeg );
        for( let i=0; i<( limbSeg+1 ); i++ ){
            upperArmThicks[i] = upperArmThick;
        }
        //set parameter
        upperArmObj.ep = new THREE.Vector2(upperArmLength,0);
        upperArmObj.thick = upperArmThicks;
        upperArmObj.width = upperArmThicks;
        //make mesh
        const pt = makePipePt( upperArmObj );
        upperArmGeo = makeGeometry( upperArmObj, pt );
        const mesh = new THREE.Mesh( upperArmGeo, upperArmMat );
        scene.add( mesh );
    }

    function lowerArmInit(){


    }

    function jointInit(){
        const pt = makeJointPt( upperArmObj, -0.01 );
        jointArmGeo = makeGeometry( upperArmObj, pt );
        jointArmMesh = new THREE.Mesh( jointArmGeo, upperArmMat );
        scene.add( jointArmMesh );
    }

    function jointUpdate( angle ){
        const bend = mapping( angle, 0.0, 1.5, -0.01, -3*PI/4 );
        const pt = makeJointPt( upperArmObj, bend );
        updateGeometry( upperArmObj, pt, jointArmGeo );
        jointArmMesh.position.set( upperArmObj.ep.x,  upperArmObj.ep.y, 0 );
    }

    upperArmInit();
    jointInit();
    limbUpdate( 1 );
    jointUpdate( 1 );







    ///////////////////////////////////////////////
    //    　　　　  　animation設定               //
    //////////////////////////////////////////////

    // POSITION
    const upperArmMove = new THREE.Object3D();
    const dur = [ 0, 2, 4 ];
    const val = [ -1, 2, -1 ];

    const v2 = [ 0, 0 ];
    const v3 = [ 0, 0 ];
    const upperArmPos = [];
    for( let i=0; i<dur.length; i++ ){
        upperArmPos.push( val[i] );
        upperArmPos.push( v2[i] );
        upperArmPos.push( v3[i] );
    }

    //const move = [];
    const uppperArmKF = new THREE.NumberKeyframeTrack( '.userData', dur, val );
    const clip = new THREE.AnimationClip( 'Action', 4, [ uppperArmKF ] );
    const mixer = new THREE.AnimationMixer( upperArmMove );
    const clipAction = mixer.clipAction( clip );
    clipAction.play();

    ///////////////////////////////////////////////
    //    　　　　  　レンダリング開始             //
    //////////////////////////////////////////////

    const clock = new THREE.Clock();
    let armAngle;
    render();
    function render(){
        //animation update
        //mixer.update(clock.getDelta());
        //armAngle = upperArmMove.userData;
        //limbUpdate( armAngle );
        //cycle
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }
}


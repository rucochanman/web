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
    //const light1 = new THREE.DirectionalLight(0xffffff, 0.8);
    //light1.position.set(0, 20, 10);
    //scene.add(light1);

    ///////////////////////////////////////////////
    //    　　       　　 defs                   //
    //////////////////////////////////////////////

    const armMat = new THREE.MeshNormalMaterial({
        side:THREE.DoubleSide,
    });

    const upperArmLength = 20;
    const lowerArmLength = 20;
    const upperArmThick = 5;

    const upperArmObj = new Limbs();
    const jointArmObj = new Limbs();
    const lowerArmObj = new Limbs();

    let upperArmGeo;
    let jointArmGeo;
    let lowerArmGeo;


    ///////////////////////////////////////////////
    //    　　　　 マテリアル配置                  //
    //////////////////////////////////////////////

    //limbsクラス
    function Limbs(){
        this.seg = limbSeg;
        this.edge = limbEdge;
        this.ep = new THREE.Vector2();
        this.cp = new THREE.Vector2();
        this.thick = 0;
        this.width = 0;
    }

    function limbInit(){
        //upperArm
        const upperArmThicks = new Array( limbSeg );
        for( let i=0; i<( limbSeg+1 ); i++ ){
            upperArmThicks[i] = upperArmThick;
        }
        //set parameter
        upperArmObj.ep = new THREE.Vector2( upperArmLength,0 );
        upperArmObj.thick = upperArmThicks;
        upperArmObj.width = upperArmThicks;
        jointArmObj.seg *= 2;
        //make mesh
        const pt1 = makePipePt( upperArmObj );
        const pt2 = makeJointPt( upperArmObj, -0.05 );
        const pt = pt1.concat(pt2);
        upperArmGeo = makeGeometry( jointArmObj, pt );
        const mesh = new THREE.Mesh( upperArmGeo, armMat );
        scene.add( mesh );
    }



    function limbupdate( angle1, angle2 ){
        //upperArm
        lastAngle = 0;
        lastBonePos = new THREE.Vector2();
        const bend1 = mapping( angle1, -1.0, 2.0, PI/4, -PI/2 );
        const { ep, cp } = getBezierPt( upperArmLength, bend1 );
        upperArmObj.ep = ep;
        upperArmObj.cp = cp;
        const pt1 = makePipePt( upperArmObj );
        //jointArm
        const bend2 = mapping( angle2, 0.0, 1.5, -0.05, -3*PI/4 );
        const pt2 = makeJointPt( upperArmObj, bend2 );
        const pt = pt1.concat( pt2 );
        updateGeometry( jointArmObj, pt, upperArmGeo );
    }


    limbInit();
    limbupdate( 0, 1 );
    const { ep2, cp2 } = getBezierPt2( PI/2, upperArmLength, upperArmThick );
    //console.log(lastAngle);
    //console.log( ep2 );


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
    render();
    function render(){
        //animation update
        //mixer.update(clock.getDelta());
        //let angle1 = upperArmMove.position.x;
        //let angle2 = upperArmMove.position.y;
        //limbupdate( angle1, angle2 );
        //cycle
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }
}

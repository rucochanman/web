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

    //limbsクラス
    function Limbs( ep, cp, thick, width ){
        this.seg = limbSeg;
        this.edge = limbEdge;
        this.ep = ep;
        this.cp = cp;
        this.thick = thick;
        this.width = width;
    }

    const armAngle = 1;
    const bend1 = mapping( armAngle, -1.0, 2.0, PI/4, -PI/2 );
    const { ep, cp } = getBezierPt2( 20, bend1 );

    //armの設定
    const upperArmThick = new Array( limbSeg );
    for( let i=0; i<( limbSeg+1 ); i++ ){
        upperArmThick[i] = 5;
    }
    const upperArm = new Limbs(
      ep,
      cp,
      upperArmThick,
      upperArmThick
    );

    //Armを作成
    const upperArmPt = makePipePt( upperArm );
    const upperArmGeo = makeGeometry( upperArm, upperArmPt );
    const upperArmMat = new THREE.MeshNormalMaterial({
        side:THREE.DoubleSide,
    });
    const upperArmMesh = new THREE.Mesh( upperArmGeo, upperArmMat );
    scene.add( upperArmMesh );

    ///////////////////////////////////////////////
    //    　　　　  　animation設定               //
    //////////////////////////////////////////////

    // POSITION
    const upperArmMove = new THREE.Object3D();
    const dur = [ 0, 3 ];
    const val = [ 0, 10 ];
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
    const clip = new THREE.AnimationClip( 'Action', 3, [ uppperArmKF ] );
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
        //const v = upperArmMove.userData;
        //upperArm.ep = new THREE.Vector2( 10, v );
        //const upperArmPt2 = makePipePt( upperArm );
        //updateGeometry( upperArm, upperArmPt2, upperArmGeo );
        //loop
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }
}

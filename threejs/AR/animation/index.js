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
    camera.position.set(-50, 50, 100);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    //ライトを設置
    const envlight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(envlight);

    ///////////////////////////////////////////////
    //    　　　　 マテリアル配置                  //
    //////////////////////////////////////////////

    const armThick = 5;
    const upperArmThick = new Array(limbSeg);
    for( let i=0; i<limbSeg+1; i++ ){
        upperArmThick[i] = armThick;
    }
    function Limb(){
        this.ep = new THREE.Vector2( 10, 10 );
        this.cp = new THREE.Vector2( 10, 0 );
        this.thick = upperArmThick;
        this.width = upperArmThick;
        this.seg = limbSeg;
        this.edge = limbEdge;
    }
    const arm = new Limb();
    //パイプを作成
    const pt = makePipe( arm );
    //メッシュの作成
    const geometry = makeGeometry( arm, pt );
    const material = new THREE.MeshNormalMaterial({
        side:THREE.DoubleSide,
    });
    const plane = new THREE.Mesh( geometry, material );
    scene.add( plane );

    ///////////////////////////////////////////////
    //    　　　　  　レンダリング開始               //
    //////////////////////////////////////////////

    const clock = new THREE.Clock();
    render();
    function render(){
        requestAnimationFrame(render);
        let y = 10 * Math.abs(sin(clock.getElapsedTime()));
        arm.ep = new THREE.Vector2( 10, y );
        const pt2 = makePipe( arm );
        updateGeometry( arm, pt2, geometry );
        renderer.render(scene, camera);
    }
}

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



    function armInit(){
        const armThick = 5;
        const upperArmThick = new Array(sect);
        //thick
        for( let i=0; i<( sect+1 ); i++ ){
            let t = i / sect;
            upperArmThick[i] = armThick;
        }
        const ep = new THREE.Vector2( 10, 10 );
        const cp = new THREE.Vector2( 10, 0 );
        //パイプを作成
        const pt = makePipe( sect, edge, cp, ep, upperArmThick, upperArmThick );
    　　//メッシュの作成
        const geometry = makeGeometry(sect, edge, pt);
        const material = new THREE.MeshNormalMaterial({
            side:THREE.DoubleSide,
        });
        const plane = new THREE.Mesh( geometry, material );
        scene.add( plane );
    }

    armInit();


    ///////////////////////////////////////////////
    //    　　　　　レンダリング開始               //
    //////////////////////////////////////////////

    render();
    function render(){
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }
}

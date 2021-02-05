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
    camera.position.set( 20, 0, 80 );
    camera.lookAt(new THREE.Vector3( 20, 0, 0 ));
    //ライトを設置
    const envlight = new THREE.AmbientLight( 0xffffff, 0.8 );
    scene.add(envlight);
    const light1 = new THREE.DirectionalLight( 0xffffff, 0.8 );
    light1.position.set(0, 0, 10);
    scene.add(light1);
    //const light2 = new THREE.DirectionalLight( 0xffffff, 0.25 );
    //light2.position.set(0, 0, 10);
    //scene.add(light2);

    ///////////////////////////////////////////////
    //    　　　　  　 model作成                 //
    //////////////////////////////////////////////


    makeModel( scene );

    ///////////////////////////////////////////////
    //    　　　　  　animation設定               //
    //////////////////////////////////////////////

    // POSITION
    const upperArmMove = new THREE.Object3D();
    const dur = [ 0, 2, 4 ];
    const posVal1 = [ -0.2, 1, -0.2 ];
    const posVal2 = [ 0, 1.5, 0 ];
    const rotVal1 = [ 0, 0, 0 ];
    const rotVal2 = [ 0, -PI/2, 0 ];

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

    const uppperArmKF1 = new THREE.NumberKeyframeTrack( '.position', dur, upperArmPos );
    const uppperArmKF2 = new THREE.NumberKeyframeTrack( '.scale', dur, upperArmRot );
    const clip = new THREE.AnimationClip( 'Action', 4, [ uppperArmKF1, uppperArmKF2 ] );
    const mixer = new THREE.AnimationMixer( upperArmMove );
    const clipAction = mixer.clipAction( clip );
    clipAction.play();


    function roadUpdate(){
        const zpos = road.geometry.faceVertexUvs[0][0][2].x - 0.01;
        const pos1 = zpos < 0.5 ? 1.0 : zpos;
        const pos0 = pos1 - 0.5;
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
    render();

    function update(){
        mixer.update( clock.getDelta() );
        let angle1 = upperArmMove.position.x;
        let angle2 = upperArmMove.position.y;
        let rot1 = upperArmMove.scale.x;
        let rot2 = upperArmMove.scale.y;
        armUpdate( crowley, angle1, angle2, rot1, rot2 );

    }

    function render(){
        update();
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }
}

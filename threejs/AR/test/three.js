window.addEventListener("DOMContentLoaded", init);

function init() {
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
      });
      renderer.setClearColor(new THREE.Color(), 0);
      renderer.setSize(640, 480);
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.style.top = '0px';
      renderer.domElement.style.left = '0px';
      document.body.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.visible = false;
      const camera = new THREE.Camera();
      scene.add(camera);

      const arToolkitSource = new THREEx.ArToolkitSource({
        sourceType: 'webcam'
      });

      window.addEventListener('resize', () => {
        onResize();
      });
      
      arToolkitSource.init(() => {
          setTimeout(() => {
          onResize();
      }, 2000);
      });

      function onResize() {
        arToolkitSource.onResizeElement();
        arToolkitSource.copyElementSizeTo(renderer.domElement);
        if (arToolkitContext.arController !== null) {
          arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
        }
      };

      const arToolkitContext = new THREEx.ArToolkitContext({
        cameraParametersUrl: 'data/camera_para.dat',
        detectionMode: 'mono'
      });

      arToolkitContext.init(() => {
        camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
      });
      
      const marker1 = new THREE.Group();
      scene.add(marker1);

      const arMarkerControls = new THREEx.ArMarkerControls(arToolkitContext, marker1, {
        type: 'pattern',
        patternUrl: 'data/patt.hiro',
        //changeMatrixMode: 'cameraTransformMatrix'
      });
      

      const mesh = new THREE.Mesh(
        new THREE.CubeGeometry(0.5, 1, 1),
        new THREE.MeshNormalMaterial(),
      );
      mesh.position.y = 1.0;
      //marker1.add(mesh);
       //scene.add(mesh);
      
      let sofa;
      const gltfloader = new THREE.GLTFLoader();
      gltfloader.load('./data/sofa.gltf',function(gltf){
           //sofa = gltf.scene;
          
          //sofa1.scale.set(0.3,0.3,0.3);
          marker1.add(gltf.scene);
          //sofa1.rotation.y = -PI/2;
          //sofa1.position.x = 2;
          //sofa1.position.y = 0.2;
          //sofa1.position.z = 2;
      });
       //marker1.add(sofa);

      const clock = new THREE.Clock();
      requestAnimationFrame(function animate(){
        requestAnimationFrame(animate);
        if (arToolkitSource.ready) {
          arToolkitContext.update(arToolkitSource.domElement);
          scene.visible = camera.visible;
        }
        const delta = clock.getDelta();
         //mesh.rotation.x += delta * 1.0;
         //mesh.rotation.y += delta * 1.5;
        renderer.render(scene, camera);
      });

}

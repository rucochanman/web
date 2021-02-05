function makeModel( markerArray ){

    ///////////////////////////////////////////////
    //    　　　　 マテリアル配置                  //
    //////////////////////////////////////////////

    const armTex = texLoader.load( './data/tex/arm.png' );
    const monoTex = texLoader.load( './data/tex/mono.png' );

    const uniform = THREE.UniformsUtils.merge([
        THREE.UniformsLib['lights'],{
            'uTexture': { value: null },
            'uColor1': { value: new THREE.Color( 'grey' ) },
            'uColor2': { value: new THREE.Color( 'white' ) },
        }
    ]);

    const frag2 = document.getElementById( 'frag2' ).textContent;

    const material = new THREE.ShaderMaterial({
        vertexShader: document.getElementById( 'vert' ).textContent,
        fragmentShader: document.getElementById( 'frag' ).textContent,
        uniforms: uniform,
        side:THREE.DoubleSide,
        lights: true
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
        const armLength = upperArmLength + lowerArmLength;
        const fingerLength = armLength / 12;
        const fingerThick = upperArmThick / 4;
        for( let i=0; i<( limbSeg+1 ); i++ ){
            const t = i / limbSeg;
            upperArmThicks[i] = upperArmThick;
            lowerArmWidths[i] = upperArmThick - Math.pow( t, 2 ) * upperArmThick;
            lowerArmThicks[i] = upperArmThick - Math.pow( t, 4 ) * upperArmThick;
            fingerThicks[i] = fingerThick - Math.pow( t, 2 ) * fingerThick;
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
        armMat.uniforms.uColor1.value = new THREE.Color('red');
        armMat.uniforms.uColor2.value = new THREE.Color('white');
        const blackMat = material.clone();
        blackMat.uniforms.uTexture.value = monoTex;
        blackMat.uniforms.uColor1.value = new THREE.Color('red');
        const skinMat = material.clone();
        skinMat.uniforms.uTexture.value = monoTex;
        skinMat.uniforms.uColor1.value = new THREE.Color('white');

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
        markerArray[1].add( armG );
    }
    armInit();
}

///////////////////////////////////////////////
//    　　　　 update用関数                   //
//////////////////////////////////////////////

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

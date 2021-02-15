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
    //    　　　　    モデル作成                   //
    //////////////////////////////////////////////

    limbInit( crowley );

    ///////////////////////////////////////////////
    //    　　　　     limb関連                   //
    //////////////////////////////////////////////

    function limbInit( model ){

        const upperArmThicks = new Array( limbSeg );
        const lowerArmThicks = new Array( limbSeg );
        const lowerArmWidths = new Array( limbSeg );
        const upperLegThicks = new Array( limbSeg );
        const lowerLegThicks = new Array( limbSeg );
        const lowerLegWidths = new Array( limbSeg );
        const fingerThicks = new Array( limbSeg );
        const armLength = upperArmLength + lowerArmLength;
        const fingerLength = armLength / 12;
        const fingerThick = upperArmThick / 4;

        for( let i=0; i<( limbSeg+1 ); i++ ){
            const t = i / limbSeg;
            upperArmThicks[i] = upperArmThick;
            lowerArmWidths[i] = upperArmThick - Math.pow( t, 2 ) * upperArmThick;
            lowerArmThicks[i] = upperArmThick - Math.pow( t, 4 ) * upperArmThick;
            upperLegThicks[i] = upperLegThick;
            lowerLegWidths[i] = upperLegThick - Math.pow( t, 2 ) * upperLegThick;
            fingerThicks[i] = fingerThick - Math.pow( t, 2 ) * fingerThick;
        }

        //set parameters
        upperArmObj.thick = upperArmThicks;
        upperArmObj.width = upperArmThicks;
        upperArmObj.length = upperArmLength;
        jointObj.seg = limbSeg * 2;
        lowerArmObj.thick = lowerArmThicks;
        lowerArmObj.width = lowerArmWidths;
        lowerArmObj.length = lowerArmLength;

        fingerObj.ep = new THREE.Vector2( fingerLength,0 );
        fingerObj.cp = new THREE.Vector2( fingerLength,0 );
        fingerObj.thick = fingerThicks;
        fingerObj.width = fingerThicks;

        upperLegObj.thick = upperLegThicks;
        upperLegObj.width = upperLegThicks;
        upperLegObj.length = upperLegLength;
        lowerLegObj.thick = lowerLegWidths;
        lowerLegObj.width = lowerLegWidths;
        lowerLegObj.length = lowerLegLength;

        //material
        const biArmMat = material.clone();
        biArmMat.uniforms.uTexture.value = armTex;
        biArmMat.uniforms.uColor1.value = model.armCol;
        biArmMat.uniforms.uColor2.value = model.skinCol;
        const monoArmMat = material.clone();
        monoArmMat.uniforms.uTexture.value = monoTex;
        monoArmMat.uniforms.uColor1.value = model.armCol;
        const skinMat = material.clone();
        skinMat.uniforms.uTexture.value = monoTex;
        skinMat.uniforms.uColor1.value = model.skinCol;
        const legMat = material.clone();
        legMat.uniforms.uTexture.value = monoTex;
        legMat.uniforms.uColor1.value = model.legCol;
        const shoeMat = material.clone();
        shoeMat.uniforms.uTexture.value = monoTex;
        shoeMat.uniforms.uColor1.value = model.shoeCol;

        //upper arm
        lastValClear();
        const upperArmUv = makeUvmap( upperArmObj );
        const upperArmpt = makePipePt( upperArmObj );
        const upperArmMeshL = new THREE.Mesh(
            makeGeometry( upperArmObj, upperArmpt, upperArmUv ),
            monoArmMat
        );
        const upperArmMeshR = new THREE.Mesh(
            makeGeometry( upperArmObj, upperArmpt, upperArmUv ),
            monoArmMat
        );
        const upperLegMesh = new THREE.Mesh(
            makeGeometry( upperLegObj, upperArmpt, upperArmUv ),
            legMat
        );

        //lower arm
        const jointArmPt = makeJointPt( upperArmObj, -1 );
        const lowerArmPt = makePipePt( lowerArmObj );
        const lowerArmPts = jointArmPt.concat( lowerArmPt );
        const jointArmUv = makeUvmap( jointObj );
        const lowerArmMeshL = new THREE.Mesh(
            makeGeometry( jointObj, lowerArmPts, jointArmUv ),
            biArmMat
        );
        const lowerArmMeshR = new THREE.Mesh(
            makeGeometry( jointObj, lowerArmPts, jointArmUv ),
            biArmMat
        );
        const lowerLegMesh = new THREE.Mesh(
            makeGeometry( jointObj, lowerArmPts, jointArmUv ),
            legMat
        );

        //hand
        lastValClear();
        const fingerPt = makePipePt( fingerObj );
        const fingerGeo = makeGeometry( fingerObj, fingerPt, upperArmUv );
        const fingerAnglesL = [ -PI/5, -PI/12, PI/32, PI/4 ];
        const fingerAnglesR = [ -PI/4, -PI/32, PI/12, PI/5 ];
        for( let i=0; i<4; i++ ){
            const fingerMeshL = new THREE.Mesh( fingerGeo, skinMat );
            const fingerMeshR = fingerMeshL.clone();
            const zl = ( upperArmThick*0.8 ) * Math.sin( fingerAnglesL[i] );
            const xl = ( upperArmThick*0.8 ) * Math.cos( fingerAnglesL[i] );
            fingerMeshL.rotation.y = -fingerAnglesL[i];
            fingerMeshL.position.set( xl - fingerLength*2, 0, zl );
            model.handGL.add( fingerMeshL );
            const zr = ( upperArmThick*0.8 ) * Math.sin( fingerAnglesR[i] );
            const xr = ( upperArmThick*0.8 ) * Math.cos( fingerAnglesR[i] );
            fingerMeshR.rotation.y = -fingerAnglesR[i];
            fingerMeshR.position.set( xr - fingerLength*2, 0, zr );
            model.handGR.add( fingerMeshR );
        }

        //toe
        const toePt = makeToePt();
        const toeMesh = new THREE.Mesh(
            makeGeometry( upperArmObj, toePt, upperArmUv ),
            shoeMat
        );

        //grouping
        model.lowerarmGL.add( lowerArmMeshL );
        model.lowerarmGL.add( model.handGL );
        model.armGL.add( upperArmMeshL );
        model.armGL.add( model.lowerarmGL );

        model.lowerarmGR.add( lowerArmMeshR );
        model.lowerarmGR.add( model.handGR );
        model.armGR.add( upperArmMeshR );
        model.armGR.add( model.lowerarmGR );

        model.lowerlegGL.add( lowerLegMesh );
        model.lowerlegGL.add( toeMesh );
        model.legGL.add( upperLegMesh );
        model.legGL.add( model.lowerlegGL );

        //add mesh to scene
        model.armGL.scale.set( 0.02, 0.02, 0.02 );
        model.legGL.scale.set( 0.02, 0.02, 0.02 );
        markerArray[1].add( model.armGL );
        markerArray[1].add( model.legGL );
    }
}

///////////////////////////////////////////////
//    　　　　 update用関数                   //
//////////////////////////////////////////////

function upperLimbUpdate( group, obj, angle ){
    const bend = mapping( angle, -1.0, 2.0, PI/4, -PI/2 );
    const { ep, cp } = getBezierPt( obj.length, bend );
    obj.ep = ep;
    obj.cp = cp;
    const pt = makePipePt( obj );
    updateGeometry( obj, pt, group.children[0].geometry );
}

function lowerLimbUpdate( group, upperObj, lowerObj, angle ){
    const bend = mapping( angle, 0.0, 1.5, -0.05, -3*PI/4 );
    const jointPt = makeJointPt( upperObj, bend );
    const { ep, cp } = getBezierPt2( bend, lowerObj.length, upperObj.thick[0] );
    lowerObj.ep = ep;
    lowerObj.cp = cp;
    const lowerPt = makePipePt( lowerObj );
    const lowerPts = jointPt.concat( lowerPt );
    updateGeometry( jointObj, lowerPts, group.children[0].geometry );
    group.position.set( upperObj.ep.x, upperObj.ep.y, 0 );
}

function legUpdate( model, angle1, angle2, rotate1, rotate2 ){
    //upperArm
    lastValClear();
    upperLimbUpdate( model.legGL, upperLegObj, angle1 );
    //lowerArm
    const r = lastAngle;
    lowerLimbUpdate( model.lowerLegGL, upperLegObj, lowerLegObj, angle2 );
    //toe
    model.lowerLegGL.children[1].rotation.z = lastAngle;
    model.lowerLegGL.children[1].position.set( lastPos.x*0.9, lastPos.y*0.9, 0 );
    //rotation
    model.legGL.quaternion.set( 0,0,0,1 );
    model.lowerLegGL.quaternion.set( 0,0,0,1 );
    const axis1 = new THREE.Vector3( 1,0,0 );
    const axis2 = new THREE.Vector3( Math.cos(r),Math.sin(r),0 ).normalize();
    const q1 = new THREE.Quaternion().setFromAxisAngle( axis1, rotate1-PI/2 );
    const q2 = new THREE.Quaternion().setFromAxisAngle( axis2, rotate2-PI );
    model.legGL.applyQuaternion( q1 );
    model.lowerLegGL.applyQuaternion( q2 );
    //model.legGL.position.y = -10;
    model.legGL.rotation.y = PI/2;
}

function armUpdate( side, model, angle1, angle2, rotate1, rotate2 ){
    const armG = side == 0 ? model.armGL : model.armGR;
    const lowerarmG = side == 0 ? model.lowerarmGL : model.lowerarmGR;
    const handG = side == 0 ? model.handGL : model.handGR;
    const sideRot = side * PI;
    //upperArm
    lastValClear();
    upperLimbUpdate( armG, upperArmObj, angle1 );
    //lowerArm
    const r = lastAngle;
    lowerLimbUpdate( lowerarmG, upperArmObj, lowerArmObj, angle2 );
    //hand
    handG.rotation.z = lastAngle;
    handG.position.set( lastPos.x, lastPos.y, 0 );
    //rotation
    armG.quaternion.set( 0,0,0,1 );
    lowerarmG.quaternion.set( 0,0,0,1 );
    const axis1 = new THREE.Vector3( 1,0,0 );
    const axis2 = new THREE.Vector3( Math.cos(r),Math.sin(r),0 ).normalize();
    const q1 = new THREE.Quaternion().setFromAxisAngle( axis1, rotate1 );
    const q2 = new THREE.Quaternion().setFromAxisAngle( axis2, rotate2 );
    armG.applyQuaternion( q1 );
    lowerarmG.applyQuaternion( q2 );
    //armG.position.x = 10;
    armG.rotation.y = sideRot;
}

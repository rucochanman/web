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
        const armMat = material.clone();
        armMat.uniforms.uTexture.value = armTex;
        armMat.uniforms.uColor1.value = model.armCol;
        armMat.uniforms.uColor2.value = model.skinCol;
        const blackMat = material.clone();
        blackMat.uniforms.uTexture.value = monoTex;
        blackMat.uniforms.uColor1.value = model.armCol;
        const skinMat = material.clone();
        skinMat.uniforms.uTexture.value = monoTex;
        skinMat.uniforms.uColor1.value = model.skinCol;

        //upper limb
        lastValClear();
        const upperArmUv = makeUvmap( upperArmObj );
        const upperArmpt = makePipePt( upperArmObj );
        const upperArmMesh = new THREE.Mesh(
            makeGeometry( upperArmObj, upperArmpt, upperArmUv ),
            blackMat
        );
        const upperLegMesh = new THREE.Mesh(
            makeGeometry( upperLegObj, upperArmpt, upperArmUv ),
            blackMat
        );

        //lower limb
        const jointArmPt = makeJointPt( upperArmObj, -1 );
        const lowerArmPt = makePipePt( lowerArmObj );
        const lowerArmPts = jointArmPt.concat( lowerArmPt );
        const jointArmUv = makeUvmap( jointObj );
        const lowerArmMesh = new THREE.Mesh(
            makeGeometry( jointObj, lowerArmPts, jointArmUv ),
            armMat
        );
        const lowerLegMesh = new THREE.Mesh(
            makeGeometry( jointObj, lowerArmPts, jointArmUv ),
            blackMat
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
            model.handGL.add( fingerMesh );
        }

        //toe
        const toePt = makeToePt();
        const toeMesh = new THREE.Mesh(
            makeGeometry( upperArmObj, toePt, upperArmUv ),
            blackMat
        );

        //grouping
        model.lowerArmGL.add( lowerArmMesh );
        model.lowerArmGL.add( model.handGL );
        model.armGL.add( upperArmMesh );
        model.armGL.add( model.lowerArmGL );

        model.lowerLegGL.add( lowerLegMesh );
        model.lowerLegGL.add( toeMesh );
        model.legGL.add( upperLegMesh );
        model.legGL.add( model.lowerLegGL );

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

function armUpdate( model, angle1, angle2, rotate1, rotate2 ){
    //upperArm
    lastValClear();
    upperLimbUpdate( model.armGL, upperArmObj, angle1 );
    //lowerArm
    const r = lastAngle;
    lowerLimbUpdate( model.lowerArmGL, upperArmObj, lowerArmObj, angle2 );
    //hand
    model.handGL.rotation.z = lastAngle;
    model.handGL.position.set( lastPos.x, lastPos.y, 0 );
    //rotation
    model.armGL.quaternion.set( 0,0,0,1 );
    model.lowerArmGL.quaternion.set( 0,0,0,1 );
    const axis1 = new THREE.Vector3( 1,0,0 );
    const axis2 = new THREE.Vector3( Math.cos(r),Math.sin(r),0 ).normalize();
    const q1 = new THREE.Quaternion().setFromAxisAngle( axis1, rotate1 );
    const q2 = new THREE.Quaternion().setFromAxisAngle( axis2, rotate2 );
    model.armGL.applyQuaternion( q1 );
    model.lowerArmGL.applyQuaternion( q2 );
}

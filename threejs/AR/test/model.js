function makeModel( scene ){

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


    limbInit( aziraphale );
    legUpdate( aziraphale, 0, 0, 0, 0 );
    makebody( aziraphale );



    ///////////////////////////////////////////////
    //    　　　　     body関連                   //
    //////////////////////////////////////////////

    function makebody( model ){

        //set thickss
        //const seg = limbEdge / 4;
        //const bodyThicks = new Array( limbSeg );
        //const bodyWidths = new Array( limbSeg );
        const pt = [];
        
        for( let i=0; i<( limbSeg+1 ); i++ ){
            pt[i] = [];
            const t = i / limbSeg;
            const width = bodyWidth - Math.pow( t, 2 ) * bodyWidth;
            const thick = width * 0.7;
            //bodyObj.whidth = 
            const x = t * ( -bodyLength / 2 );
            for( let j=0; j<limbEdge; j++ ){
                const theta = j * 2 * PI / limbEdge;
                const x1 = Math.pow( width * Math.cos( theta ), 2 );
                const z1 = Math.pow( thick * Math.sin( theta ), 2 );
                const r = ( width * thick ) / Math.sqrt( x1 + z1 );
                const v = new THREE.Vector2( r,0 ).rotateAround( center2D, theta );
                pt[i][j] = [x, v.x, v.y];
            }
        }

        

        


        model.bodyG.add( model.armG );
        model.bodyG.add( model.legG );

        //add mesh to scene
        scene.add( model.bodyG );

    }

    function makeHip(){
      //defs
      const node = 8;
      const edge = 12;
      const h = 10/1.8;
      const seg = edge/4;

      let left = new THREE.Vector3(1,0,0);
      let right = new THREE.Vector3(-1,0,0);
      let front = new THREE.Vector3(0,0,1);
      let back = new THREE.Vector3(0,0,-1);

      let pt = [];
      for( let i=0; i<node; i++ ){
        pt[i] = [];
        let t = i / (node-1);
        let width = 10 * Math.cos( Math.pow(t,1.9) * PI/2.4);
        let thick = width * 0.7;
        let z = new THREE.Vector3(0,t*-h,0);
        for(let j=0; j<seg; j++){
          //defs
          let div = j / seg;
          let d1 = div * PI/2;
          let d2 = PI/2 - d1;
          //radius
          let r1 = Math.pow(Math.cos(d1)/width,2) + Math.pow(Math.sin(d1)/thick,2);
          console.log(r1);
          r1 = Math.sqrt(1/r1);
          let r2 = Math.pow(Math.cos(d2)/width,2) + Math.pow(Math.sin(d2)/thick,2);
          r2 = Math.sqrt(1/r2);
          //units
          let front_left = front.clone().lerp(left,div).normalize();
          let left_back = left.clone().lerp(back,div).normalize();
          let back_right = front_left.clone().negate();
          let right_front = left_back.clone().negate();

          //set points
          pt[i][j+0*seg] = front_left.multiplyScalar(r2).add(z).toArray();
          pt[i][j+1*seg] = left_back.multiplyScalar(r1).add(z).toArray();
          pt[i][j+2*seg] = back_right.multiplyScalar(r2).add(z).toArray();
          pt[i][j+3*seg] = right_front.multiplyScalar(r1).add(z).toArray();

        }
      }
    }

    makeHip();






    ///////////////////////////////////////////////
    //    　　　　     limb関連                   //
    //////////////////////////////////////////////

    function limbInit( model ){

        //set thickss
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
        const upperArmMesh = new THREE.Mesh(
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
        const lowerArmMesh = new THREE.Mesh(
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
        const fingerAngles = [ -PI/5, -PI/12, PI/32, PI/4 ];
        for( let i=0; i<4; i++ ){
            const fingerMesh = new THREE.Mesh( fingerGeo, skinMat );
            const z = ( upperArmThick*0.8 ) * Math.sin( fingerAngles[i] );
            const x = ( upperArmThick*0.8 ) * Math.cos( fingerAngles[i] );
            fingerMesh.rotation.y = -fingerAngles[i];
            fingerMesh.position.set( x - fingerLength*2, 0, z );
            model.handG.add( fingerMesh );
        }

        //toe
        const toePt = makeToePt();
        const toeMesh = new THREE.Mesh(
            makeGeometry( upperArmObj, toePt, upperArmUv ),
            shoeMat
        );

        //grouping
        model.lowerArmG.add( lowerArmMesh );
        model.lowerArmG.add( model.handG );
        model.armG.add( upperArmMesh );
        model.armG.add( model.lowerArmG );

        model.lowerLegG.add( lowerLegMesh );
        model.lowerLegG.add( toeMesh );
        model.legG.add( upperLegMesh );
        model.legG.add( model.lowerLegG );

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
    upperLimbUpdate( model.legG, upperLegObj, angle1 );
    //lowerArm
    const r = lastAngle;
    lowerLimbUpdate( model.lowerLegG, upperLegObj, lowerLegObj, angle2 );
    //toe
    model.lowerLegG.children[1].rotation.z = lastAngle;
    model.lowerLegG.children[1].position.set( lastPos.x*0.9, lastPos.y*0.9, 0 );
    //rotation
    model.legG.quaternion.set( 0,0,0,1 );
    model.lowerLegG.quaternion.set( 0,0,0,1 );
    const axis1 = new THREE.Vector3( 1,0,0 );
    const axis2 = new THREE.Vector3( Math.cos(r),Math.sin(r),0 ).normalize();
    const q1 = new THREE.Quaternion().setFromAxisAngle( axis1, rotate1-PI/2 );
    const q2 = new THREE.Quaternion().setFromAxisAngle( axis2, rotate2-PI );
    model.legG.applyQuaternion( q1 );
    model.lowerLegG.applyQuaternion( q2 );
    model.legG.position.y = -10;
    model.legG.rotation.y = PI/2;
}


function armUpdate( model, angle1, angle2, rotate1, rotate2 ){
    //upperArm
    lastValClear();
    upperLimbUpdate( model.armG, upperArmObj, angle1 );
    //lowerArm
    const r = lastAngle;
    lowerLimbUpdate( model.lowerArmG, upperArmObj, lowerArmObj, angle2 );
    //hand
    model.handG.rotation.z = lastAngle;
    model.handG.position.set( lastPos.x, lastPos.y, 0 );
    //rotation
    model.armG.quaternion.set( 0,0,0,1 );
    model.lowerArmG.quaternion.set( 0,0,0,1 );
    const axis1 = new THREE.Vector3( 1,0,0 );
    const axis2 = new THREE.Vector3( Math.cos(r),Math.sin(r),0 ).normalize();
    const q1 = new THREE.Quaternion().setFromAxisAngle( axis1, rotate1 );
    const q2 = new THREE.Quaternion().setFromAxisAngle( axis2, rotate2 );
    model.armG.applyQuaternion( q1 );
    model.lowerArmG.applyQuaternion( q2 );
}

///////////////////////////////////////////////
//    　　　     　   defs                   //
//////////////////////////////////////////////

const limbSeg = 8;
const limbEdge = 12;
const PI = Math.PI;
const center2D = new THREE.Vector2();

////////////////////////////////////////////////
//    　　　　　　　 Math関数                  //
///////////////////////////////////////////////

function cos( r ){
    return Math.cos( r );
};
function sin( r ){
    return Math.sin( r );
};
function pow( base,exp ){
    return Math.pow( base,exp );
};
function abs( r ){
    return Math.abs( r );
};


////////////////////////////////////////////////
//    　　　 　ベジエポイント取得               //
///////////////////////////////////////////////


function getBezierPt( len1, len2, bend1, bend2 ){
    //angle adjust
    const diff = abs( bend1 ) * -PI/8;
    const rad = bend1 + bend2 + diff;

    //arm1
    const x1 = len1 * cos( bend1 );
    const y1 = len1 * sin( bend1 );
    const ep1 = new THREE.Vector2( x1,y1 );
    const cp1 = new THREE.Vector2();
    ep1.y > 0 ? cp1.y = y1 / 2 : cp1.x = -y1 / 2;

    //arm2
    const joint_len = armThick * abs( bend2 );
    len2 -= joint_len;
    const x2 = len2 * cos( rad );
    const y2 = len2 * sin( rad );
    const ep2 = new THREE.Vector2( x2,y2 );
    const cp2 = new THREE.Vector2( 0,0 );
    return { ep1, cp1, ep2, cp2 }
}


function getBezierPt2( len, bend ){
    const ep_x = len * cos( bend );
    const ep_y = len * sin( bend );
    const cp_x = abs( ep_y / 2 );
    const cp_y = Math.max( ep_y / 2, 0 );
    const ep = new THREE.Vector2( ep_x, ep_y );
    const cp = new THREE.Vector2( cp_x, cp_y );

    return { ep, cp }
}


////////////////////////////////////////////////
//    　　　　　　　 pipe作成                  //
///////////////////////////////////////////////

function makeBone( obj ){


}

function makePipePt( obj ){
    //make bone
    const curve = new THREE.QuadraticBezierCurve( center2D, obj.cp, obj.ep );
    const bone = curve.getPoints( obj.seg );
    let zpos = bone[0];
    //set points
    const pt = [];
    for( let i=0; i<( obj.seg+1 ); i++ ){
        //calc angle
        const diff = new THREE.Vector2().subVectors( bone[i], zpos );
        const angle = Math.atan2( diff.y, diff.x );
        //calc coords
        pt[i] = [];
        for( let j=0; j<obj.edge; j++ ){
            const theta = j * 2 * PI / obj.edge;
            const w = obj.thick[i] * cos( theta );
            const h = obj.width[i] * sin( theta );
            const v = new THREE.Vector2( 0, h );
            v.add( bone[i] );
            v.rotateAround( bone[i], angle );
            pt[i][j] = [v.x, v.y, w];
        }
        zpos = bone[i];
    }
    return pt;
}

////////////////////////////////////////////////
//    　　　　　  vertexの作成                 //
///////////////////////////////////////////////

function setVertices( seg, edge, pt ){
    const vert = [];
    for( let i=0; i<seg; i++ ){
        vert[i] = [];
        for( let j=0; j<edge; j++ ){
            vert[i][j] = [];
            vert[i][j][0] = pt[i][j];
            vert[i][j][1] = pt[i][( j+1 ) % edge];
            vert[i][j][2] = pt[i+1][( j+1 ) % edge];
            vert[i][j][3] = pt[i+1][j];
        }
    }
    return new Float32Array( vert.flat(3) );
}

////////////////////////////////////////////////
//    　　　 　　  indexの作成                 //
///////////////////////////////////////////////

function setIndices( seg, edge ){
    const num_rect = seg * edge;
    const order = [0,3,2,2,1,0];
    const index = [];
    for( let i=0; i<num_rect; i++ ){
        for( let j=0; j<order.length; j++ ){
            index.push( order[j]+(4*i) );
        }
    }
    return new Uint16Array( index );
}

////////////////////////////////////////////////
//    　　   BufferGeometryの作成             //
///////////////////////////////////////////////

function makeGeometry( obj, pt ){
    const vertices = setVertices( obj.seg, obj.edge, pt );
    const indices = setIndices( obj.seg, obj.edge );
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute( vertices, 3 ));
    geometry.setIndex(new THREE.BufferAttribute( indices, 1 ));
    const merg = new THREE.Geometry().fromBufferGeometry( geometry );
    merg.mergeVertices();
    merg.computeVertexNormals();
    return merg;
}

////////////////////////////////////////////////
//    　　   geometryのアップデート            //
///////////////////////////////////////////////

function updateGeometry( obj, pt, geometry ){
    const vertices = setVertices( obj.seg, obj.edge, pt );
    const newGeo = new THREE.BufferGeometry();
    newGeo.setAttribute('position', new THREE.BufferAttribute( vertices, 3 ));
    const merg = new THREE.Geometry().fromBufferGeometry( newGeo );
    merg.mergeVertices();
    geometry.vertices = merg.vertices;
    geometry.elementsNeedUpdate = true;
    geometry.computeVertexNormals();
}

////////////////////////////////////////////////
//    　　　 　　　　 map関数                  //
///////////////////////////////////////////////

function mapping( inVal, inMin, inMax, outMin, outMax ){
    const ratio = ( inVal - inMin ) / ( inMax - inMin );
    const outVal = ratio * ( outMax - outMin ) + outMin;
    return outVal;
};

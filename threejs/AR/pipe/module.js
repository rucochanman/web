///////////////////////////////////////////////
//    　　　     　   defs                   //
//////////////////////////////////////////////

const seg = 5;
const edge = 12;
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

////////////////////////////////////////////////
//    　　　　　　　 pipe作成                  //
///////////////////////////////////////////////

function makePipe( seg, edge, cp, ep, sw, sh ){
    //make bone
    const curve = new THREE.QuadraticBezierCurve( center2D, cp, ep );
    const bone = curve.getPoints( seg );
    let zpos = bone[0];
    //set points
    const pt = [];
    for( let i=0; i<( seg+1 ); i++ ){
        //calc angle
        const diff = new THREE.Vector2().subVectors( bone[i], zpos );
        const angle = Math.atan2( diff.y, diff.x );
        //calc coords
        pt[i] = [];
        for( let j=0; j<edge; j++ ){
            const theta = j * 2 * PI / edge;
            const w = sw[i] * cos( theta );
            const h = sh[i] * sin( theta );
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

function makeGeometry( seg, edge, pt ){
  const vertices = setVertices( seg, edge, pt );
  const indices = setIndices( seg, edge );
  const geometry = new THREE.BufferGeometry();
  geometry.addAttribute('position', new THREE.BufferAttribute( vertices, 3 ));
  geometry.setIndex(new THREE.BufferAttribute( indices, 1 ));
  const merg = new THREE.Geometry().fromBufferGeometry( geometry );
  merg.mergeVertices();
  merg.computeVertexNormals();
  return merg;
}

////////////////////////////////////////////////
//    　　   geometryのアップデート            //
///////////////////////////////////////////////

function updateGeometry( seg, edge, pt, geometry ){
    let geometry2 = makeGeometry( seg, edge, pt );
    geometry.verticesNeedUpdate = true;
    geometry.vertices = geometry2.vertices;
    //geometry.elementNeedUpdate = true;

    //geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
}

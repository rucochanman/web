
///////////////////////////////////////////////
//    　　　     　   defs                   //
//////////////////////////////////////////////

const sect = 5;
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

function makePipe( sect, edge, cp, ep, sw, sh ){
    //make bone
    const curve = new THREE.QuadraticBezierCurve( center2D, cp, ep );
    const bone = curve.getPoints( sect );
    let zpos = bone[0];
    //set points
    const pt = [];
    for( let i=0; i<( sect+1 ); i++ ){
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

function setVertices( sect, edge, pt ){
    const vert = [];
    for( let i=0; i<sect; i++ ){
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

function setIndices( sect, edge ){
    const num_rect = sect * edge;
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

function makeGeometry( sect, edge, pt ){
  const vertices = setVertices( sect, edge, pt );
  const indices = setIndices( sect, edge );
  const geometry = new THREE.BufferGeometry();
  geometry.addAttribute('position', new THREE.BufferAttribute( vertices, 3 ));
  geometry.setIndex(new THREE.BufferAttribute( indices, 1 ));
  geometry.computeVertexNormals();
  return geometry;
}

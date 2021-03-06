///////////////////////////////////////////////
//    　　　     　   defs                   //
//////////////////////////////////////////////

const PI = Math.PI;
const LEFT = 0;
const RIGHT = 1;
const limbSeg = 8;
const limbEdge = 12;
const initLength = 10;
const center2D = new THREE.Vector2();
const texLoader = new THREE.TextureLoader();
const gltfloader = new THREE.GLTFLoader();
let lastAngle = 0;
let lastPos = new THREE.Vector2();

//size
const upperArmLength = 4;
const lowerArmLength = 7;
const upperArmThick = 2.8;
const upperLegLength = 3.5;
const lowerLegLength = 5.2;
const upperLegThick = 3;
const toeLength = 2;
const bodyLength = 6;
const bodyWidth = 4;

//object
const upperArmObj = new Limbs();
const jointObj = new Limbs();
const lowerArmObj = new Limbs();
const fingerObj = new Limbs();
const upperLegObj = new Limbs();
const lowerLegObj = new Limbs();
const bodyObj = new Limbs();

function model( color ){
    //color
    this.armCol = color.armCol;
    this.skinCol = color.skinCol;
    this.legCol = color.legCol;
    this.shoeCol = color.shoeCol;
    //group
    this.bodyG = new THREE.Group();
    this.armGL = new THREE.Group();
    this.armGR = new THREE.Group();
    this.lowerarmGL = new THREE.Group();
    this.lowerarmGR = new THREE.Group();
    this.handGL = new THREE.Group();
    this.handGR = new THREE.Group();
    this.legGL = new THREE.Group();
    this.legGR = new THREE.Group();
    this.lowerlegGL = new THREE.Group();
    this.lowerlegGR = new THREE.Group();
}

//limbsクラス
function Limbs(){
    this.seg = limbSeg;
    this.edge = limbEdge;
    this.ep = new THREE.Vector2( 1,0 );
    this.cp = new THREE.Vector2( 1,0 );
    this.thick = 0;
    this.width = 0;
    this.length = 0;
}

const crowleyCol = {
    armCol: new THREE.Color( 'black' ),
    skinCol: new THREE.Color( 'darksalmon' ),
    legCol: new THREE.Color( 'black' ),
    shoeCol: new THREE.Color( 'black' )
};

const aziraphaleCol = {
    armCol: new THREE.Color( 'azure' ),
    skinCol: new THREE.Color( 'darksalmon' ),
    legCol: new THREE.Color( 'gray' ),
    shoeCol: new THREE.Color( 'gray' )
};

const crowley = new model( crowleyCol );
const aziraphale = new model( aziraphaleCol );
const aziraphale2 = new model( aziraphaleCol );

////////////////////////////////////////////////
//    　　　       　 reset                   //
///////////////////////////////////////////////

function lastValClear(){
    lastAngle = 0;
    lastPos = new THREE.Vector2();
}

////////////////////////////////////////////////
//    　　　 　ベジエポイント取得               //
///////////////////////////////////////////////

function getBezierPt( len, bend ){
    const ep_x = len * Math.cos( bend );
    const ep_y = len * Math.sin( bend );
    const cp_x = Math.abs( ep_y / 2 );
    const cp_y = Math.max( ep_y / 2, 0 );
    const ep = new THREE.Vector2( ep_x, ep_y );
    const cp = new THREE.Vector2( cp_x, cp_y );
    return { ep, cp }
}

function getBezierPt2( bend, len, thick ){
    const joint_len = thick * Math.abs( bend );
    const v = new THREE.Vector2( len - joint_len, 0 );
    const ep = v.rotateAround( center2D, lastAngle );
    const cp = ep.clone();
    return { ep, cp }
}

////////////////////////////////////////////////
//    　　　　　　　 pipe作成                  //
///////////////////////////////////////////////

function makePipePt( obj ){
    //make bone
    const curve = new THREE.QuadraticBezierCurve( center2D, obj.cp, obj.ep );
    const bone = curve.getPoints( obj.seg );
    let zpos = center2D;
    //set points
    const pt = [];
    for( let i=0; i<( obj.seg+1 ); i++ ){
        //calc angle
        const diff = new THREE.Vector2().subVectors( bone[i], zpos );
        const angle = i==0 ? lastAngle : Math.atan2( diff.y, diff.x );
        //calc coords
        pt[i] = [];
        for( let j=0; j<obj.edge; j++ ){
            const theta = j * 2 * PI / obj.edge;
            const w = obj.thick[i] * Math.cos( theta );
            const h = obj.width[i] * Math.sin( theta );
            const v = new THREE.Vector2( 0, h );
            v.add( bone[i] );
            v.rotateAround( bone[i], angle );
            v.add( lastPos );
            pt[i][j] = [v.x, v.y, w];
        }
        zpos = bone[i];
        lastAngle = angle;
    }
    lastPos = bone[obj.seg].add( lastPos );
    return pt;
}

function makeJointPt( obj, bend ){
    //make bone center
    const radius = obj.thick[0];
    const origin = new THREE.Vector2( 0, -radius );
    origin.rotateAround( center2D, lastAngle );
    //set points
    const bone = new THREE.Vector2();
    const pt = [];
    for( let i=0; i<obj.seg; i++ ){
        pt[i] = [];
        let angle = i==0 ? 0 : bend / ( obj.seg-1 );
        bone.rotateAround( origin, angle );
        for( let j=0; j<obj.edge; j++ ){
            const theta = j * 2 * Math.PI / obj.edge;
            const w = radius * Math.cos( theta );
            const h = radius * Math.sin( theta );
            const v = new THREE.Vector2( 0, h );
            v.add( bone );
            v.rotateAround( bone, i * angle + lastAngle );
            pt[i][j] = [ v.x, v.y, w ];
        }
    }
    //update values
    lastAngle += bend;
    lastPos = bone;
    return pt;
}

function makeToePt(){
    //set thicks
    const toeFront = new Array( limbSeg );
    const toeBack = new Array( limbSeg );
    const toeWidth = new Array( limbSeg );
    for( let i=0; i<( limbSeg+1 ); i++ ){
        const t = i / limbSeg;
        toeFront[i] = toeLength * Math.pow( t, 0.8 ) + toeLength;
        toeBack[i] = toeFront[i] / 2;
        toeWidth[i] = toeBack[i];
    }

    //make points
    const pt = [];
    for( let i=0; i<limbSeg+1; i++ ){
        pt[i] = [];
        const x = i / limbSeg * ( toeLength / 1.5 );
        for( let j=0; j<limbEdge; j++ ){
            if( i == limbSeg ){
                pt[i][j] = [x, 0, 0];
            }else{
                const theta = j * 2 * PI / limbEdge;
                const r = theta < PI ? toeFront[i] : toeBack[i];
                const y = r * Math.sin( theta );
                const z = toeWidth[i] * Math.cos( theta );
                pt[i][j] = [x, y, z];
            }
        }
    }
    return pt;
}

////////////////////////////////////////////////
//    　　　 　　  uvmapの作成                 //
///////////////////////////////////////////////

function makeUvmap( obj ){
    const uvmap = [];
    for( let i=0; i<( obj.seg+1 ); i++ ){
        uvmap[i] = [];
        const y = i / obj.seg;
        for( let j=0; j<( obj.edge+1 ); j++ ){
              const x = j / obj.edge;
              uvmap[i][j] = [x, y];
        }
    }
    return uvmap;
}

////////////////////////////////////////////////
//    　　　　　     uvの作成                  //
///////////////////////////////////////////////

function setUvs( seg, edge, pt ){
    const vert = [];
    for( let i=0; i<seg; i++ ){
        vert[i] = [];
        for( let j=0; j<edge; j++ ){
            vert[i][j] = [];
            vert[i][j][0] = pt[i][j];
            vert[i][j][1] = pt[i][j+1];
            vert[i][j][2] = pt[i+1][j+1];
            vert[i][j][3] = pt[i+1][j];
        }
    }
    return new Float32Array( vert.flat(3) );
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
            vert[i][j][1] = pt[i][(j+1) % edge];
            vert[i][j][2] = pt[i+1][(j+1) % edge];
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

function makeGeometry( obj, pt, uv ){
    const vertices = setVertices( obj.seg, obj.edge, pt );
    const uvs = setUvs( obj.seg, obj.edge, uv );
    const indices = setIndices( obj.seg, obj.edge );
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute( vertices, 3 ));
    geometry.setAttribute('uv', new THREE.BufferAttribute( uvs, 2 ));
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
    const indices = setIndices( obj.seg, obj.edge );
    const vertices = setVertices( obj.seg, obj.edge, pt );
    const newGeo = new THREE.BufferGeometry();
    newGeo.setAttribute('position', new THREE.BufferAttribute( vertices, 3 ));
    newGeo.setIndex(new THREE.BufferAttribute( indices, 1 ));
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

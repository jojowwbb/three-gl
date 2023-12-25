import * as THREE from 'three'
import * as CANNON from 'cannon-es'


function createTrimeshFromMesh(mesh){
    mesh.geometry.computeBoundingBox();
    mesh.geometry.computeBoundingSphere();
    mesh.geometry.computeTangents();
    mesh.geometry.computeVertexNormals();

    const position = mesh.geometry.attributes.position;
    const normals = mesh.geometry.index;
    var vertices = [], faces = [];

    for (var i = 0; i < position.array.length; i += 1)
      vertices.push(position.array[i]);

    for (var i = 0; i < normals.array.length; i += 1)
      faces.push(normals.array[i]);

    return new CANNON.Trimesh(vertices, faces);
}

function createShapeBody(object3d,shapeType,options){
    const box = new THREE.Box3().setFromObject(object3d)
    const size=box.getSize(new THREE.Vector3())
    if(CANNON.SHAPE_TYPES.BOX==shapeType){
        var shape= new CANNON.Box(new CANNON.Vec3(size.x/2,size.y/2,size.z/2));
        const body = new CANNON.Body({...options});
        body.addShape(shape);
        return body
    }else if(CANNON.SHAPE_TYPES.SPHERE==shapeType){
        const shape = new CANNON.Sphere(size.x);
        const body = new CANNON.Body({...options});
        body.addShape(shape);
        return body
    }
}

function createBodyFromMesh(mesh,mass=0){
    const shape=createTrimeshFromMesh(mesh);
    const body = new CANNON.Body({ mass,type: CANNON.Body.STATIC });
    body.quaternion.setFromEuler(-Math.PI / 2, 0, 0) 
    body.addShape(shape);
    return body
}

function createBoxBodyFromObject3d(object3d){

    const size=new THREE.Vector3()
    const box = new THREE.Box3().setFromObject(object3d)
    box.getSize(size)

    const boxShape = new CANNON.Box(new CANNON.Vec3(size.x/2,size.y/2,size.z/2))

    const boxBody = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(0, 100, 0),
    })

    boxBody.angularVelocity.set(0, 10, 0)
    boxBody.angularDamping = 0.5

    boxBody.addShape(boxShape)

    return boxBody
    // this.playerBody=boxBody
    // this.physicsWorld.addBody(boxBody)
}

function createFromIndexed(mesh){
    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', mesh.geometry.getAttribute('position'));
    geometry = mergeVertices(geometry); 
    let position = geometry.attributes.position.array;  
    let geomFaces = geometry.index.array;   
  
    const points = [];  
    const faces = [];  
  
    for(var i = 0; i < position.length; i += 3){  
      points.push(new CANNON.Vec3(position[i], position[i+1], position[i+2]));  
    }  
  
    for(var i = 0; i < geomFaces.length; i += 3){  
      faces.push([geomFaces[i], geomFaces[i+1], geomFaces[i+2]]);
    }  
  
    console.log(points,faces)

    //var shape= new CANNON.ConvexPolyhedron({vertices:points,faces:faces});  
    var shape=  new CANNON.Trimesh(points, geomFaces)
    return shape;
  }


export default {
    createTrimeshFromMesh,
    createBodyFromMesh,
    createBoxBodyFromObject3d,
    createShapeBody
}
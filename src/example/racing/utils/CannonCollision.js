import * as THREE from 'three'
import * as CANNON from 'cannon-es'

export default class ConnonCollision {
    static TYPES = {
        BOX: 1,
        SHPERE: 2,
        TRIMESH: 3
    }
    static create(mesh, type, options = {}) {
        var shape = null
        if (type === ConnonCollision.TYPES.BOX) {
            shape = ConnonCollision.createBoxShape(mesh)
        } else if (type === ConnonCollision.TYPES.SHPERE) {
            shape = ConnonCollision.createSphereShape(mesh)
        } else if (type === ConnonCollision.TYPES.TRIMESH) {
            shape = ConnonCollision.createTrimesh(mesh)
        }
        return new CANNON.Body({
            shape,
            ...options
        })
    }


    static createTrimesh(mesh) {
       
        // const position = mesh.geometry.attributes.position
        // const normals = mesh.geometry.index
        // var vertices = [],
        //     faces = []

        // for (var i = 0; i < position.array.length; i += 1) vertices.push(position.array[i])

        // for (var i = 0; i < normals.array.length; i += 1) faces.push(normals.array[i])

        return new CANNON.Trimesh(mesh.geometry.attributes.position.array, mesh.geometry.index.array)
    }

    static createBoxShape(object) {
        var shape,
            localPosition,
            box = new THREE.Box3()
        var clone = object.clone()
        clone.quaternion.set(0, 0, 0, 1)
        clone.updateMatrixWorld()

        box.setFromObject(clone)

        if (!isFinite(box.min.lengthSq())) return null

        shape = new CANNON.Box(new CANNON.Vec3((box.max.x - box.min.x) / 2, (box.max.y - box.min.y) / 2, (box.max.z - box.min.z) / 2))

        localPosition = box.translate(clone.position.negate()).getCenter(new THREE.Vector3())
        if (localPosition.lengthSq()) {
            shape.offset = localPosition
        }

        return shape
    }

    static createSphereShape(obj) {
        const boundingBox = new THREE.Box3().setFromObject(obj)
        const size = new THREE.Vector3()
        boundingBox.getSize(size)
        return new CANNON.Sphere(size.y)
    }
}

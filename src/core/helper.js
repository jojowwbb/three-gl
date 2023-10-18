import * as THREE from 'three'

export class PickHelper {
    constructor(pickColor) {
        this.raycaster = new THREE.Raycaster()
        this.pickedObject = null
        this.pickedObjectSavedColor = 0
        this.pickColor = pickColor || 0xff0000
    }
    pick(normalizedPosition, scene, camera) {
        // 恢复上一个被拾取对象的颜色
        if (this.pickedObject) {
            this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor)
            this.pickedObject = undefined
        }
        // 发出射线
        this.raycaster.setFromCamera(normalizedPosition, camera)
        // 获取与射线相交的对象
        const intersectedObjects = this.raycaster.intersectObjects(scene.children)
        if (intersectedObjects.length) {
            // 找到第一个对象，它是离鼠标最近的对象
            var obj = intersectedObjects[0].object
            if (obj.isMesh) {
                this.pickedObject = obj
                console.log('current pick object',this.pickedObject)
                // 保存它的颜色
                this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex()
                // 设置它的发光为 黄色/红色闪烁
                this.pickedObject.material.emissive.setHex(this.pickColor)
            }
        }
    }
}

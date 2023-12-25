import * as THREE from 'three'

export default class BBox {
    constructor(model) {
        this.box3 = new THREE.Box3();
        this.vector3=new THREE.Vector3()
        this.box3.expandByObject(model);
        this.init()
    }

    init(){
        this.getCenter();
        this.getSize();
        this.getCapsule()
    }

    getCenter(){
        this.box3.getCenter(this.vector3)
        this.center=this.vector3.clone();
    }
    getSize(){
        this.box3.getSize(this.vector3)
        this.size=this.vector3.clone();
    }

    getCapsule(){
        const R = 0.8;
        const H = this.size.y;//胶囊总高度
        const start = new THREE.Vector3(0, R, 0);//底部半球球心坐标
        const end = new THREE.Vector3(0, H - 2*R, 0);//顶部半球球心坐标
        this.capsule={
            start,
            end,
            r:R
        }
    }
   
}

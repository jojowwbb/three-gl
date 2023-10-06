import * as THREE from 'three'
import BaseEffect from '../base/index'
import gsap from 'gsap'

export default class LightLocation extends BaseEffect {
    defaultOptions = {
        data: [0.1, 0.3, 4]
    }

    constructor(options = {}) {
        super('LightLocation')
        this.options = Object.assign(this.defaultOptions, options)
        this.init()
    }

    init() {
        let { position, color, data } = this.options
        const length = 1.5
        this.geometry = new THREE.ConeGeometry(...data)
        this.material = new THREE.MeshBasicMaterial({
            depthTest:false,
            depthWrite:false,
            color: color
        })
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.name = this.name
        this.mesh.rotation.x = Math.PI

        this.mesh.position.set(position.x, position.y, position.z)

        gsap.to(this.mesh.scale, {
            x: length,
            z: length,
            duration: 1,
            ease: 'none',
            repeat: -1,
            yoyo: true
        })
        gsap.to(this.mesh.rotation, {
            y: Math.PI,
            duration: 1,
            ease: 'none',
            repeat: -1,
            yoyo: true
        })
    }
}

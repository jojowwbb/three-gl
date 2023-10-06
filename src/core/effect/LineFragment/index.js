import * as THREE from 'three'
import BaseEffect from '../base/index'
import gsap from 'gsap'

/**
 * 模型添加包围线效果
 */
export default class LineFragment extends BaseEffect {
    defaultConfig = {
        color: 0xffffff,
        geometry: null
    }

    constructor(options = {}) {
        super('LineFragment')
        this.options = Object.assign(this.defaultConfig, options)
        this.init()
    }

    init() {
        let { color, geometry } = this.options
        const edges = new THREE.EdgesGeometry(geometry)
        const line = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.8 })
        )
        this.mesh = line
        this.mesh.name = this.name
    }
}

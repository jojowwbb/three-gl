import * as THREE from 'three'
import BaseEffect from '../base/index'
import gsap from 'gsap'

/**
 * Sprite标志
 */
export default class Symbol extends BaseEffect {
    defaultConfig = {
        spritePath: '',
        color: 0xfff000
    }

    constructor(options = {}) {
        super('Symbol')
        this.options = Object.assign(this.defaultConfig, options)
        this.init()
    }

    init() {
        let { color, spritePath } = this.options
        const textureLoader = new THREE.TextureLoader()
        const geometry = new THREE.PlaneGeometry(0.5, 0.5, 1, 1);
        const map = textureLoader.load(spritePath)
        this.material = new THREE.SpriteMaterial({
            map: map,
            color: color,
            transparent: true,
            depthTest: false
        })

        this.mesh = new THREE.Sprite(this.material)
        this.mesh.geometry=geometry
        this.mesh.name = this.name
    }
}

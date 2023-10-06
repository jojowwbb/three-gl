import * as THREE from 'three'
import BaseEffect from '../base/index'
import vertexShader from './shader/vertex.glsl'
import fragmentShader from './shader/fragment.glsl'
import gsap from 'gsap'

/**
 * 六芒星效果
 */
export default class LightHexgram extends BaseEffect {
    defaultConfig = {
        color: 0xffffff,
        radius: 10
    }

    constructor(options = {}) {
        super('LightHexgram')
        this.options = Object.assign(this.defaultConfig, options)
        this.init()
    }

    init() {
        let { color, radius } = this.options
        var geometry = new THREE.CircleGeometry(radius, 36)
        var material = new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
            uniforms: {
                uColor: {
                    value: new THREE.Color(color)
                },
                uTime: {
                    value: 0
                }
            },
            transparent: true,
            depthTest:false,
            depthWrite:false,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        })
        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.name = this.name

        gsap.to(material.uniforms.uTime, {
            value: 5,
            duration: 5,
            ease: 'none',
            repeat: -1
        })
    }
}

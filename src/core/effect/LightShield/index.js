import * as THREE from 'three'
import BaseEffect from '../base'
import fragmentShader from './shader/fragment.glsl'
import vertexShader from './shader/vertex.glsl'
import gsap from 'gsap'

/**
 * 光罩网格对象
 */
export default class LightShield extends BaseEffect {
    defaultOptions = {
        radius: 5, //半径
        color: 0xfff000
    }

    constructor(options = {}) {
        super('LightShield')
        this.options = Object.assign(this.defaultOptions, options)
        this.init()
    }
    init() {
        let { radius, position, color } = this.options

        const depth = new THREE.WebGLRenderTarget(1, 1, {
            wrapS: THREE.ClampToEdgeWrapping,
            wrapT: THREE.ClampToEdgeWrapping,
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            type: THREE.UnsignedByteType,
            stencilBuffer: false,
            depthBuffer: true
        })

        const textureLoader = new THREE.TextureLoader()
        const texture = textureLoader.load('./assets/texture/noise3.jpeg')
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping

        this.geometry = new THREE.SphereGeometry(radius, 128,128,0,Math.PI * 2,Math.PI /2)
        this.material = new THREE.ShaderMaterial({
            depthTest:false,
            depthWrite:false,
            uniforms: {
                uDepthBuffer: { value: depth.texture },
                uBufferColor: { value: depth.texture },
                uTexture: {
                    value: texture
                },
                uColor: {
                    value: new THREE.Vector4(0.0, 0.9, 0.0, 0.1)
                },
                uTime: {
                    value: 0
                }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            side: THREE.DoubleSide
        })

        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.rotation.x=Math.PI;

        this.material.uniforms.uColor = {
            value: new THREE.Color(color)
        }

        this.material.uniforms.uTime = {
            value: -3
        }
 

        var clock=new THREE.Clock()
        const animate = () => {
            this.material.uniforms.uTime.value += clock.getDelta()
            requestAnimationFrame(animate)
        }
        animate()
    }
}

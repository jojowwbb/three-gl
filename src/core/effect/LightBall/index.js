import * as THREE from 'three'
import BaseEffect from '../base'
import fragment from './shader2/fragment.glsl'
import vertex from './shader2/vertex.glsl'

/**
 * 光罩网格对象
 */
export default class LightBall extends BaseEffect {
    defaultOptions = {
        radius: 5, //半径
        position: [], //圆心位置
        color: 0xfff000
    }

    constructor(options = {}) {
        super('LightBall')
        this.options = Object.assign(this.defaultOptions, options)
        this.init()
    }
    init() {
        let { radius, position, color } = this.options

        this.geometry = new THREE.SphereGeometry(radius, radius * 12, radius * 12)

        this.material = new THREE.ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,
            transparent: true
        })

        this.mesh = new THREE.Mesh(this.geometry, this.material)

        this.mesh.position.set(...position)
        // 必须先调用计算函数
        this.mesh.geometry.computeBoundingBox()

        // 从上到下的高度获取
        let { min, max } = this.mesh.geometry.boundingBox

        let uHeight = max.y - min.y
        this.material.uniforms.uHeight = {
            value: uHeight
        }

        this.material.uniforms.uColor = {
            value: new THREE.Color(color)
        }

        this.material.uniforms.uTime = {
            value: -3
        }
        this.material.uniforms.uTopLineWidth = {
            value: 0.001
        }

        // gsap.to(this.material.uniforms.uTime, {
        //     value: 15,
        //     duration: 8,
        //     repeat: -1,
        // })

        var clock = new THREE.Clock()
        var _self = this
        function animate() {
            if (_self.material.uniforms.uTime.value > 0) {
                _self.material.uniforms.uTime.value = -3
            }
            _self.material.uniforms.uTime.value += clock.getDelta()
            requestAnimationFrame(animate)
        }
        animate()
    }
}

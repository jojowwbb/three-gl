import * as THREE from 'three'
import gsap from 'gsap'
import vertex from './shader/vertex.glsl'
import fragment from './shader/fragment.glsl'
import BaseEffect from '../base'

export default class LightWall extends BaseEffect {
    defaultOptions = {
        radius: 5, //半径
        height: 1,
        radialSegments: 4,
        position: [], //圆心位置
        color: 0xfff000
    }

    constructor(options = {}) {
        super('LightWall')
        this.options = Object.assign(this.defaultOptions, options)
        this.init()
    }
    init() {
        let { radius, position, color, height, radialSegments } = this.options
        this.geometry = new THREE.CylinderGeometry(radius, radius, height, radialSegments, 1, true)
        this.material = new THREE.ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,
            transparent: true,
            side: THREE.DoubleSide
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
            value: 0
        }
    }
}

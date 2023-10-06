import * as THREE from 'three'
import gsap from 'gsap'
import vertex from './shader/vertex.glsl'
import fragment from './shader/fragment.glsl'
import BaseEffect from '../base'

export default class LightFlyLine extends BaseEffect {
    defaultOptions = {
        startPos: [],
        endPos: [],
        elevation:3,
        color: 0xfff000
    }

    constructor(options = {}) {
        super('LightFlyLine')
        this.options = Object.assign(this.defaultOptions, options)
        this.init()
    }
    init() {
        let { startPos, endPos, color,elevation } = this.options

        // 根据开始结束位置、生成一个带有中间点的数据
        let linePoints = [
            new THREE.Vector3(...startPos),
            new THREE.Vector3((startPos[0] + endPos[0]) / 2, elevation, (startPos[2] + endPos[2]) / 2),
            new THREE.Vector3(...endPos)
        ]
        // 创建曲线
        this.lineCurve = new THREE.CatmullRomCurve3(linePoints)
        // 获取曲线的顶点
        const points = this.lineCurve.getPoints(1000)

        //通过顶点生成几何体
        this.geometry = new THREE.BufferGeometry().setFromPoints(points)

        // 给每一个顶点设置属性
        const sizeArray = new Float32Array(points.length)
        for (let i = 0; i < sizeArray.length; i++) {
            sizeArray[i] = i
        }
        // 设置几何体顶点属性
        this.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizeArray, 1))
        // 3/设置着色器材质
        this.shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: {
                    value: 0
                },
                uColor: {
                    value: new THREE.Color(color)
                },
                uLength: {
                    value: points.length
                }
            },
            vertexShader: vertex,
            fragmentShader: fragment,
            transparent: true,
            depthWrite: false,
            transparent:true,
            blending: THREE.AdditiveBlending
        })

        this.mesh = new THREE.Points(this.geometry, this.shaderMaterial)

        gsap.to(this.shaderMaterial.uniforms.uTime, {
            value: 1000,
            duration: 2,
            repeat: -1,
            ease: 'none'
        })
    }
}

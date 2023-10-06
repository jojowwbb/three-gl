import * as THREE from 'three'
import BaseEffect from '../base/index'
import gsap from 'gsap'

export default class LightPoints extends BaseEffect {
    defaultConfig = {
        texturePath: './assets/texture/points/trace_05.png',
        color: 0xffffff,
        count: 5000
    }

    constructor(options = {}) {
        super('LightPoints')
        this.options = Object.assign(this.defaultConfig, options)
        this.init()
    }

    init() {
        let { count, color, texturePath } = this.options
        const particlesGeometry = new THREE.BufferGeometry()
        // 设置缓冲区数组
        const positions = new Float32Array(count * 3)
        // 设置粒子顶点颜色
        const colors = new Float32Array(count * 3)
        // 设置顶点
        for (let i = 0; i < count * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 40
            colors[i] = Math.random()
        }
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        //particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

        // 设置点材质
        const pointsMaterial = new THREE.PointsMaterial()
        pointsMaterial.size = 0.6
        pointsMaterial.color.set(color)
        // 相机深度而衰减
        pointsMaterial.sizeAttenuation = true

        // 载入纹理
        const textureLoader = new THREE.TextureLoader()
        const texture = textureLoader.load(texturePath)
        // 设置点材质纹理
        pointsMaterial.map = texture
        pointsMaterial.alphaMap = texture
        pointsMaterial.transparent = true
        pointsMaterial.depthWrite = false
        pointsMaterial.blending = THREE.AdditiveBlending
        // 设置启动顶点颜色
        //pointsMaterial.vertexColors = true
        this.mesh = new THREE.Points(particlesGeometry, pointsMaterial)
        this.mesh.name = this.name
    }
}

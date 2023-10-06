import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'

import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

import * as dat from 'dat.gui'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

import html2canvas from 'html2canvas'

import { latLonToVector3 } from './utils/index'

var EnvOptions = {
    controls: true,
    axes: true,
    grid: true,
    webglRenderer: {}
}

var defaultLabelCssObj = {
    'border-radius': '4px',
    border: '2px solid #92d2b4',
    padding: '3px 6px',
    background: '#123146',
    color: '#ccf1ff',
    display: 'inline-flex',
    'justify-content': 'center',
    'align-items': 'center'
}

/**
 * THREE场景管理器
 * 场景，相机，渲染器，加载器
 */
export default class Player {
    scene = null
    camera = null
    renderer = null
    effectComposer = null

    materialsBak = {}

    static LAYER = {
        Bloom: 30,
        Default: 0
    }

    /**
     * 初始化整个环境
     * @param {*} options
     */
    constructor(options) {
        var envOptions = Object.assign({}, EnvOptions, options)
        this.gui = new dat.GUI()

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 60000)

        const renderer = new THREE.WebGLRenderer(Object.assign({ antialias: true, logarithmicDepthBuffer: true, }, envOptions.webglRenderer))

        this.scene = scene
        this.camera = camera
        this.renderer = renderer

        this.renderer.autoClear = false

        camera.position.set(3.537729217921893, 5.64615829904671, -0.3029838282005545)

        renderer.setSize(window.innerWidth, window.innerHeight)

        document.body.appendChild(renderer.domElement)

        this.bloomLayer = new THREE.Layers()
        this.bloomLayer.set(Player.LAYER.Bloom)

        this.addAmbientLight()
        this.addBloom()
        this.initEvent()

        this.addCSSRender()

        envOptions.controls && this.addControls()
        envOptions.axes && this.addAxesHelper()
        envOptions.grid && this.addGridHelper()
    }

    initEvent() {
        window.addEventListener('resize', () => {
            // 更新摄像头
            this.camera.aspect = window.innerWidth / window.innerHeight
            //   更新摄像机的投影矩阵
            this.camera.updateProjectionMatrix()

            //   更新渲染器
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            //   设置渲染器的像素比例
            this.renderer.setPixelRatio(window.devicePixelRatio)
        })
    }

    /**
     * 场景控制器
     * OrbitControls
     */
    addControls() {
        const controls = new OrbitControls(this.camera, this.renderer.domElement)
        // controls.listenToKeyEvents(window) // optional
        controls.enableDamping = true // an animation loop is required when either damping or auto-rotation are enabled
        //controls.dampingFactor = 0.05
        //controls.screenSpacePanning = false
        controls.minDistance = 1
        controls.maxDistance = 60000
        //   controls.maxPolarAngle = Math.PI / 2
        this.controls = controls
    }

    addCSSRender() {
        const labelRenderer = new CSS2DRenderer()
        labelRenderer.domElement.style.position = 'absolute'
        labelRenderer.domElement.style.top = '0px'
        labelRenderer.domElement.style.pointerEvents = 'none'
        labelRenderer.setSize(window.innerWidth, window.innerHeight)
        document.body.appendChild(labelRenderer.domElement)
        this.labelRenderer = labelRenderer
    }

    /**
     * 辅助轴线
     */
    addAxesHelper() {
        const axesHelper = new THREE.AxesHelper(100)
        this.scene.add(axesHelper)
    }
    /**
     * 默认环境光
     */
    addAmbientLight() {
        const ambientLight = new THREE.AmbientLight(0xffffff)
        this.scene.add(ambientLight)
    }

    /**
     * 辅助网格
     */
    addGridHelper() {
        var grid = new THREE.GridHelper(300, 300, 0xff0000, 0x00ff00)
        this.scene.add(grid)
    }

    /**
     * 添加天空盒
     * 天空盒素材顺序:前，后，上，下，右、左
     * @param {*} urls
     */
    addSkyBackground(urls) {
        const textureCube = new THREE.CubeTextureLoader().load(urls)
        this.scene.background = textureCube
    }

    /**
     * 光辉特效
     * 内部初始化，如果需要光辉特效、给物体添加到Bloom Layers
     * eg: mesh.layers.enable(Player.LAYER.Bloom)
     */
    addBloom() {
        this.renderer.toneMappingExposure = 3
        this.renderer.toneMapping = THREE.ReinhardToneMapping
        // 场景渲染器
        this.effectComposer = new EffectComposer(this.renderer)
        const renderPass = new RenderPass(this.scene, this.camera)
        this.effectComposer.addPass(renderPass)

        //创建辉光效果
        this.unrealBloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0, 0, 0)
        this.unrealBloomPass.threshold = 0.26 // 辉光强度
        this.unrealBloomPass.strength = 0.49 // 辉光阈值
        this.unrealBloomPass.radius = 0.5 //辉光半径
        this.unrealBloomPass.renderToScreen = false //

        const bloom = this.gui.addFolder('辉光效果')
        bloom.open()
        bloom.add(this.unrealBloomPass, 'threshold').min(0).max(1).step(0.01)
        bloom.add(this.unrealBloomPass, 'strength').min(0).max(1).step(0.01)
        bloom.add(this.unrealBloomPass, 'radius').min(0).max(1).step(0.01)

        //辉光渲染器
        this.glowComposer = new EffectComposer(this.renderer)
        this.glowComposer.renderToScreen = false
        this.glowComposer.addPass(renderPass)
        this.glowComposer.addPass(this.unrealBloomPass)

        // 着色器
        let shaderPass = new ShaderPass(
            new THREE.ShaderMaterial({
                uniforms: {
                    baseTexture: { value: null },
                    bloomTexture: { value: this.glowComposer.renderTarget2.texture },
                    tDiffuse: {
                        value: null
                    }
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                    }
                `,
                fragmentShader: `
                    uniform sampler2D baseTexture;
                    uniform sampler2D bloomTexture;
                    varying vec2 vUv;
                    void main() {
                        gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );
                    }
                `,
                defines: {}
            }),
            'baseTexture'
        )

        shaderPass.renderToScreen = true
        shaderPass.needsSwap = true
        this.effectComposer.addPass(shaderPass)
    }

    /**
     * 向场景中添加物体
     * @param {*} obj
     */
    add(obj) {
        this.scene.add(obj)
    }

    /**
     * 渲染
     */
    render() {
        this.controls.update()
        this.scene.updateMatrixWorld(true)

        //渲染bloom
        this.scene.traverse((obj) => {
            if (this.bloomLayer.test(obj.layers) === false) {
                this.materialsBak[obj.uuid] = obj.material
                obj.material = new THREE.MeshBasicMaterial({ color: 'black' })
            }
        })
        this.glowComposer.render()

        this.scene.traverse((v) => {
            if (this.materialsBak[v.uuid]) {
                v.material = this.materialsBak[v.uuid]
            }
        })
        this.effectComposer.render()

        //渲染文本标签
        this.labelRenderer.render(this.scene, this.camera)
    }

    /**
     * 添加GLTF模型
     * @param {*} path
     * @param {*} callback
     */
    loadGLTF(path, callback) {
        var loader = new GLTFLoader()
        loader.load(path, (gltf) => {
            callback(gltf.scene)
        })
    }
    loadFBX(path, callback) {
        const loader = new FBXLoader()
        loader.load(path, function (object) {
            // object.traverse(function (child) {
            //     if (child.isMesh) {
            //         child.castShadow = true
            //         child.receiveShadow = true
            //     }
            // })
            // scene.add(object)
            callback(object)
        })
    }
    /**
     * 添加obj模型
     * @param {*} path
     * @param {*} callback
     */
    loadObj(path, callback) {
        var loader = new OBJLoader()
        loader.load(path, callback)
    }

    /**
     * 添加obj模型和mtl材质
     * @param {*} path
     * @param {*} fileName
     * @param {*} callback
     */
    loadObjMtl(path, fileName, callback) {
        new MTLLoader().setPath(path).load(`${fileName}.mtl`, function (materials) {
            materials.preload()
            new OBJLoader().setMaterials(materials).setPath(path).load(`${fileName}.obj`, callback)
        })
    }

    /**
     * 加载geojson数据
     * @param {*} geoJsonFilePath
     * @param {*} callback
     */
    loadGeoJson(geoJsonFilePath, callback) {
        const loader = new THREE.FileLoader()
        loader.load(geoJsonFilePath, (data) => {
            const jsonData = JSON.parse(data)
            callback(jsonData)
        })
    }

    getObjectByName(name) {
        return this.scene.getObjectByName(name)
    }
    /**
     * 创建文本标签精灵
     * @param {*} text 文本内容
     * @param {*} cssObject  文本样式，css style 对象
     * @param {*} callback 回调函数 (sprite,width,height)
     */
    createLabelSprite(text, cssObject, callback) {
        var css = Object.assign({}, defaultLabelCssObj, cssObject || {})
        let div = document.createElement('div')
        var cssProps = Object.keys(css).map((p) => {
            return `${p}:${css[p]};`
        })
        div.style.cssText = cssProps.join('')
        console.log(cssProps.join(''))
        div.innerText = text
        document.body.appendChild(div)
        let { width, height } = div.getBoundingClientRect()
        html2canvas(div, { width: width, height: height, scale: 2, backgroundColor: null }).then((canvas) => {
            document.body.removeChild(div)
            var spriteMaterial = new THREE.SpriteMaterial({
                map: new THREE.CanvasTexture(canvas)
            })
            var sprite = new THREE.Sprite(spriteMaterial)
            if (callback && typeof callback === 'function') {
                callback(sprite, width, height)
            }
        })
    }

    createTextLabel(name) {
        const div = document.createElement('div')
        div.style.color = '#fff'
        div.style.fontSize = '12px'
        div.style.textShadow = '1px 1px 2px #047cd6'
        div.textContent = name
        const label = new CSS2DObject(div)
        return label
    }

    /**
     * 经纬转平面坐标
     * 使用米勒投影
     * @param {*} lon
     * @param {*} lat
     * @returns
     */
    lonlatTranformMillerXY(lon, lat) {
        var L = 6381372 * Math.PI * 2, // 地球周长
            W = L, // 平面展开后，x轴等于周长
            H = L / 2, // y轴约等于周长一半
            mill = 2.3, // 米勒投影中的一个常数，范围大约在正负2.3之间
            x = (lon * Math.PI) / 180, // 将经度从度数转换为弧度
            y = (lat * Math.PI) / 180 // 将纬度从度数转换为弧度
        // 这里是米勒投影的转换
        y = 1.25 * Math.log(Math.tan(0.25 * Math.PI + 0.4 * y))
        // 这里将弧度转为实际距离
        x = W / 2 + (W / (2 * Math.PI)) * x
        y = H / 2 - (H / (2 * mill)) * y
        // 转换结果的单位是公里
        // 可以根据此结果，算出在某个尺寸的画布上，各个点的坐标
        return {
            x: x / 1000,
            y: y / 1000
        }
    }

    /**
     * 经纬转平面坐标
     * 使用米勒投影
     * @param {*} lon
     * @param {*} lat
     * @returns
     */
    lonlatTranformMectorXY(x, y) {
        return latLonToVector3(x, y)
    }
}

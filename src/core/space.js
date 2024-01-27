import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'

import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'

import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

import html2canvas from 'html2canvas'

import GUI from 'lil-gui'

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
 * 模型从中心点炸开效果
 */
class ExpandModel {
    getWorldCenterPosition(box, scalar = 0.5) {
        return new THREE.Vector3().addVectors(box.max, box.min).multiplyScalar(scalar)
    }
    constructor(modelObject) {
        if (!modelObject) return
        this.modelObject = modelObject
        // 计算模型中心
        const explodeBox = new THREE.Box3()
        explodeBox.setFromObject(modelObject)
        const explodeCenter = this.getWorldCenterPosition(explodeBox)
        const meshBox = new THREE.Box3()
        modelObject.traverse(function (value) {
            if (value.isMark || value.isMarkChild || value.isLine || value.isSprite) return
            if (value.isMesh) {
                meshBox.setFromObject(value)

                const meshCenter = this.getWorldCenterPosition(meshBox)
                // 爆炸方向
                value.userData.worldDir = new THREE.Vector3().subVectors(meshCenter, explodeCenter).normalize()
                // 爆炸距离 mesh中心点到爆炸中心点的距离
                value.userData.worldDistance = new THREE.Vector3().subVectors(meshCenter, explodeCenter)
                // 原始坐标
                value.userData.originPosition = value.getWorldPosition(new THREE.Vector3())
                // mesh中心点
                value.userData.meshCenter = meshCenter.clone()
                value.userData.explodeCenter = explodeCenter.clone()
            }
        })
    }
    expand() {
        var modelObject = this.modelObject

        modelObject.traverse(function (value) {
            if (!value.isMesh || !value.userData.originPosition) return
            const distance = value.userData.worldDir.clone().multiplyScalar(value.userData.worldDistance.length() * scalar)
            const offset = new THREE.Vector3().subVectors(value.userData.meshCenter, value.userData.originPosition)
            const center = value.userData.explodeCenter
            const newPos = new THREE.Vector3().copy(center).add(distance).sub(offset)
            const localPosition = value.parent?.worldToLocal(newPos.clone())
            localPosition && value.position.copy(localPosition)
        })
    }
}

/**
 * 选取操作
 */
class PickHelper {
    constructor(callback) {
        this.raycaster = new THREE.Raycaster()
        this.pickedObject = null
        this.pickedObjectSavedColor = 0
        this.pickColor = 0xff0000
        if (typeof callback === 'function') {
            this.callback = callback
        }
    }
    pick(normalizedPosition, scene, camera) {
        // 恢复上一个被拾取对象的颜色
        if (this.pickedObject) {
            this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor)
            this.pickedObject = undefined
        }
        // 发出射线
        this.raycaster.setFromCamera(normalizedPosition, camera)
        // 获取与射线相交的对象
        const intersectedObjects = this.raycaster.intersectObjects(scene.children)
        if (intersectedObjects.length) {
            // 找到第一个对象，它是离鼠标最近的对象
            var obj = intersectedObjects[0].object
            if (obj.isMesh) {
                this.pickedObject = obj
                // 保存它的颜色
                this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex()
                console.log(obj)
                if (this.callback) {
                    this.callback(this.pickedObject)
                } else {
                    // 设置它的发光为 黄色/红色闪烁
                    this.pickedObject.material.emissive.setHex(this.pickColor)
                }
            }
        }
    }
}

/**
 * THREE场景管理器
 * 场景，相机，渲染器，加载器
 */
class MySpace {
    scene = null
    camera = null
    renderer = null

    cache = {}

    composer = null

    keyDownListener = {}
    keyUpListener = {}
    /**
     * 初始化整个环境
     * @param {*} options
     */
    constructor(optipns = {}) {
        this.gui = new GUI()
        this.assetPath = optipns.assetPath || './assets/model/'
    }

    setCache(key, data) {
        this.cache[key] = data
    }
    getCache() {
        return this.cache[key]
    }
    hasCache(key) {
        if (this.cache[key]) {
            return true
        }
        return false
    }
    removeCache(key) {
        delete this.cache[key]
    }

    debug(name, obj) {
        console.debug(name, obj)
    }

    init() {
        if (!this.scene) {
            this.initScene()
        }
        if (!this.renderer) {
            this.initRenderer()
        }
        if (!this.camera) {
            this.initCamera()
        }
        this.initEvent()

        setTimeout(() => {
            this.render()
        }, 300)
    }

    initScene() {
        //this.scene = scene

        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0xbfe3dd)
        this.scene = scene
    }

    initCamera() {
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 60000)
        this.camera = camera
    }

    initRenderer(options = {}) {
        //Object.assign({ antialias: true, logarithmicDepthBuffer: true }, options)
        const renderer = new THREE.WebGLRenderer(options)

        this.renderer = renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight)

        document.body.appendChild(renderer.domElement)

        this.addCSSRender()
    }

    initEvent() {
        //resize事件
        window.addEventListener('resize', () => {
            // 更新摄像头
            this.camera.aspect = window.innerWidth / window.innerHeight
            //   更新摄像机的投影矩阵
            this.camera.updateProjectionMatrix()
            //   更新渲染器
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            //   设置渲染器的像素比例
            this.renderer.setPixelRatio(window.devicePixelRatio)

            this.render()
        })

        document.addEventListener('keydown', ({ code }) => {
            if (this.keyDownListener[code]) {
                this.keyDownListener[code].map((callback) => {
                    callback()
                })
            }
        })
        document.addEventListener('keyup', ({ code }) => {
            if (this.keyUpListener[code]) {
                this.keyUpListener[code].map((callback) => {
                    callback()
                })
            }
        })
    }

    regKeyDown(key, fn) {
        this.keyDownListener[key] = this.keyDownListener[key] || []
        this.keyDownListener[key].push(fn)
    }
    regKeyUp(key, fn) {
        this.keyUpListener[key] = this.keyUpListener[key] || []
        this.keyUpListener[key].push(fn)
    }
    /**
     * 场景控制器
     * OrbitControls
     */
    addControls() {
        const controls = new OrbitControls(this.camera, this.renderer.domElement)
        controls.listenToKeyEvents(window) // optional
        controls.enableDamping = true // an animation loop is required when either damping or auto-rotation are enabled
        controls.dampingFactor = 0.05
        controls.screenSpacePanning = false
        // controls.minDistance = 1
        // controls.maxDistance = 60000
        //controls.maxPolarAngle = Math.PI / 2
        this.controls = controls
    }

    //css渲染器
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
     * 辅助网格
     */
    addGridHelper(object) {
        var grid = new THREE.GridHelper(300, 300, 0xffffff, 0xffffff)
        grid.material.opacity = 0.5
        grid.material.depthWrite = false
        grid.material.transparent = true
        if (object) {
            object.add(grid)
        } else {
            this.scene.add(grid)
        }
    }

    addPickHelper(callback) {
        var pickHelper = new PickHelper(callback)
        window.addEventListener('click', (event) => {
            const mouse = new THREE.Vector2()
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1
            mouse.y = -((event.clientY / window.innerHeight) * 2 - 1)
            pickHelper.pick(mouse, this.scene, this.camera)
        })
    }

    addAmbientLight() {
        const light = new THREE.AmbientLight(0xffffff, 0.6)
        this.scene.add(light)
        var folder = this.gui.addFolder('环境光')
        folder.addColor(light, 'color').name('颜色')
        folder.add(light, 'intensity').name('强度')
    }

    addVec3Gui(object, name, onChange) {
        const folder = this.gui.addFolder(name)
        folder.add(object, 'x').onChange(onChange)
        folder.add(object, 'y').onChange(onChange)
        folder.add(object, 'z').onChange(onChange)
    }

    addPointLight() {
        const light = new THREE.PointLight(0xffffff, 1)
        this.scene.add(light)
        const folder = this.gui.addFolder('点光')
        folder.addColor(light, 'color').name('颜色')
        folder.add(light, 'intensity').name('强度')
        this.addVec3Gui(light.position, '点光位置', () => {})
    }

    addDirectionalLight() {
        const light = new THREE.DirectionalLight(0xffffff, 1)
        light.position.set(100, 100, 0)
        light.target.position.set(0, 0, 0)
        const helper = new THREE.DirectionalLightHelper(light)
        this.scene.add(helper)
        this.scene.add(light)
        this.scene.add(light.target)

        const f1 = this.gui.addFolder('平行光')
        f1.addColor(light, 'color').name('颜色')
        f1.add(light, 'intensity').name('强度')
        this.addVec3Gui(light.position, '平行光位置', updateLight)
        this.addVec3Gui(light.target.position, '平行光目标位置', updateLight)

        function updateLight() {
            light.target.updateMatrixWorld()
            helper.update()
        }
    }

    /**
     * 添加半球光
     */
    addHemisphereLight() {
        const light = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3)
        this.scene.add(light)

        const folder = this.gui.addFolder('半球光')
        folder.addColor(light, 'skyColor').name('天空颜色')
        folder.addColor(light, 'groundColor').name('地面颜色')
        folder.add(light, 'intensity').name('强度')
        this.addVec3Gui(light.position, '半球光位置', () => {})
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

    enableSkyBox() {
        var urls = ['front', 'back', 'top', 'down', 'right', 'left']
        this.addSkyBackground(
            urls.map((item) => {
                return `./assets/background/sky/bak0/${item}.jpg`
            })
        )
    }

    /**
     * 向场景中添加物体
     * @param {*} obj
     */
    add(obj) {
        this.scene.add(obj)
        this.render()
    }

    /**
     * 渲染
     */
    render() {
        this.controls.update()
        this.renderer.render(this.scene, this.camera)

        //渲染文本标签
        if (this.labelRenderer) {
            this.labelRenderer.render(this.scene, this.camera)
        }
    }

    load(file) {
        var path = `${this.assetPath}${file}`
        if (path.endsWith('gltf') || path.endsWith('glb')) {
            return this.loadGLTF(path)
        } else if (path.endsWith('fbx')) {
            return this.loadFBX(path)
        } else if (path.endsWith('obj')) {
            return this.loadObj(path)
        } else if (path.endsWith('geojson') || path.endsWith('json')) {
            return this.loadGeoJson(path)
        } else {
            return Promise.reject('不支持的格式')
        }
    }
    /**
     * 添加GLTF模型
     * @param {*} path
     */
    loadGLTF(path) {
        var loader = new GLTFLoader()
        return new Promise((resolve, reject) => {
            loader.load(path, (gltf) => {
                this.debug(path, gltf)
                resolve(gltf)
            })
        })
    }
    /**
     * 加载fbx
     * @param {*} path
     * @returns
     */
    loadFBX(path) {
        var loader = new FBXLoader()
        return new Promise((resolve, reject) => {
            loader.load(path, (object) => {
                resolve(object)
            })
        })
    }
    /**
     * 添加obj模型
     * @param {*} path
     */
    loadObj(path) {
        var loader = new OBJLoader()
        return new Promise((resolve, reject) => {
            loader.load(path, (object) => {
                resolve(object)
            })
        })
    }

    /**
     * 加载geojson数据
     * @param {*} callback
     */
    loadGeoJson(path) {
        const loader = new THREE.FileLoader()
        return new Promise((resolve, reject) => {
            loader.load(path, (data) => {
                const jsonData = JSON.parse(data)
                resolve(jsonData)
            })
        })
    }

    getObjectByName(name) {
        return this.scene.getObjectByName(name)
    }

    /**
     * 可以将中心不在几何原点的物体移动到几何原点(0,0,0)
     * @param {*} mesh 物体
     */
    center(mesh) {
        const box = new THREE.Box3().setFromObject(mesh)
        const center = box.getCenter(new THREE.Vector3())
        mesh.position.x += mesh.position.x - center.x
        mesh.position.y += mesh.position.y - center.y
        mesh.position.z += mesh.position.z - center.z
    }
    getBox(object3d) {
        const box = new THREE.Box3().setFromObject(object3d)
        return {
            size: box.getSize(size),
            center: box.getCenter(size)
        }
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

    /**
     * 创建文本标签
     * @param {*} name
     * @returns
     */
    createTextLabel(name) {
        const div = document.createElement('div')
        div.style.color = '#fff'
        div.style.fontSize = '12px'
        div.style.textShadow = '1px 1px 2px #047cd6'
        div.textContent = name
        const label = new CSS2DObject(div)
        return label
    }

    createHighLight(modelObject) {
        var composer = new EffectComposer(this.renderer)
        var renderPass = new RenderPass(this.scene, this.camera)
        composer.addPass(renderPass)

        var outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), this.scene, this.camera, modelObject)

        outlinePass.edgeStrength = 10.0 // 边框的亮度
        outlinePass.edgeGlow = 1 // 光晕[0,1]
        outlinePass.usePatternTexture = false // 是否使用父级的材质
        outlinePass.edgeThickness = 1.0 // 边框宽度
        outlinePass.downSampleRatio = 1 // 边框弯曲度
        outlinePass.pulsePeriod = 1 // 呼吸闪烁的速度
        outlinePass.visibleEdgeColor = new THREE.Color(0, 1, 0) // 呼吸显示的颜色
        outlinePass.hiddenEdgeColor = new THREE.Color(0, 0, 0) // 呼吸消失的颜色
        outlinePass.clear = true
        composer.addPass(outlinePass)
        this.composer = composer
        this.render()
    }
}

export default MySpace

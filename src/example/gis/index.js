import gcoord from 'gcoord'
import * as THREE from 'three'

import { GeoGeomtry } from '../../core/main.js'

// 121.5048
// 31.2376
/**
 * 原点经纬度坐标
 */
//var centerCoord = gcoord.transform([102.71463536, 25.04488145], gcoord.BD09, gcoord.AMap)
var centerCoord = gcoord.transform([121.5048, 31.2376], gcoord.WGS84, gcoord.AMap)

/**
 * 创建建筑物场景
 * @param {*} player
 * @param {*} map
 */
function demoBuilding(scene, map) {
    var customCoords = map.customCoords
    //原点地图坐标[x,y]
    var centerCoordPosition = customCoords.lngLatsToCoords([centerCoord])[0]

    const loader = new THREE.FileLoader()
    //加载geojson数据
    //    loader.load('./assets/geojson/building-data.json', (data) => {
    loader.load('./assets/geojson/shanghai-floor.geojson', (data) => {
        const jsonData = JSON.parse(data)
        //使用geogeomtry构建geo物体
        var geomtry = new GeoGeomtry(jsonData, { polygonLine: false })
        //设置高度转换器
        geomtry.setHeightTranformer((feature) => {
            return feature.properties.Floor * 3
        })
        //设置经纬度转换器
        geomtry.setCoordinateTranformer((coord) => {
            var [lng, lat] = gcoord.transform(coord, gcoord.WGS84, gcoord.AMap)
            return customCoords.lngLatsToCoords([[lng, lat]])[0]
        })

        geomtry.build()

        geomtry.mesh.children.map((item) => {
            item.material = new THREE.MeshStandardMaterial({ color: 0xcccccc })
            item.castShadow = true
        })

        geomtry.mesh.rotation.x = -2 * Math.PI
        geomtry.mesh.position.set(centerCoordPosition[0], centerCoordPosition[1], 0)
        scene.add(geomtry.mesh)
    })
}
function initMap() {
    const map = new AMap.Map('container', {
        skyColor: 'rgba(0,0,0,0)',
        mapStyle: 'amap://styles/grey',
        center: centerCoord,
        zooms: [2, 20],
        zoom: 14,
        viewMode: '3D',
        showBuildingBlock: false,
        pitch: 50
    })

    var camera
    var renderer
    var scene
    // 数据转换工具
    var customCoords = map.customCoords
    // 数据使用转换工具进行转换，这个操作必须要提前执行（在获取镜头参数 函数之前执行），否则将会获得一个错误信息。
    // 创建 GL 图层
    var gllayer = new AMap.GLCustomLayer({
        // 图层的层级
        zIndex: 200,
        // 初始化的操作，创建图层过程中执行一次。
        init: (gl) => {
            // 这里我们的地图模式是 3D，所以创建一个透视相机，相机的参数初始化可以随意设置，因为在 render 函数中，每一帧都需要同步相机参数，因此这里变得不那么重要。
            // 如果你需要 2D 地图（viewMode: '2D'），那么你需要创建一个正交相机
            camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 100, 1 << 30)

            renderer = new THREE.WebGLRenderer({
                context: gl // 地图的 gl 上下文
                // alpha: true,
                // antialias: true,
                // canvas: gl.canvas,
            })

            // 自动清空画布这里必须设置为 false，否则地图底图将无法显示
            renderer.autoClear = false
            scene = new THREE.Scene()

            // 环境光照和平行光
            var aLight = new THREE.AmbientLight(0xffffff, 0.3)
            var dLight = new THREE.DirectionalLight(0xffffff, 1)
            dLight.position.set(1000, -100, 900)
            scene.add(dLight)
            scene.add(aLight)
            demoBuilding(scene, map)
        },
        render: () => {
            // 这里必须执行！！重新设置 three 的 gl 上下文状态。
            renderer.resetState()
            // 重新设置图层的渲染中心点，将模型等物体的渲染中心点重置
            // 否则和 LOCA 可视化等多个图层能力使用的时候会出现物体位置偏移的问题
            customCoords.setCenter(centerCoord)
            var { near, far, fov, up, lookAt, position } = customCoords.getCameraParams()

            // 2D 地图下使用的正交相机
            // var { near, far, top, bottom, left, right, position, rotation } = customCoords.getCameraParams();

            // 这里的顺序不能颠倒，否则可能会出现绘制卡顿的效果。
            camera.near = near
            camera.far = far
            camera.fov = fov
            camera.position.set(...position)
            camera.up.set(...up)
            camera.lookAt(...lookAt)
            camera.updateProjectionMatrix()

            // 2D 地图使用的正交相机参数赋值
            // camera.top = top;
            // camera.bottom = bottom;
            // camera.left = left;
            // camera.right = right;
            // camera.position.set(...position);
            // camera.updateProjectionMatrix();

            renderer.render(scene, camera)

            // 这里必须执行！！重新设置 three 的 gl 上下文状态。
            renderer.resetState()
        }
    })
    map.add(gllayer)

    // 动画
    function animate() {
        map.render()
        requestAnimationFrame(animate)
    }
    animate()
}

const mainApp = () => {
    initMap()
}

mainApp()

export default mainApp

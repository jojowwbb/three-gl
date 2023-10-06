import * as THREE from 'three'
import gcoord from 'gcoord'

import { GeoGeomtry, Player } from '../../core/main.js'

/**
 * 场景效果
 */
function senceDemo(player) {
    var urls = ['front', 'back', 'top', 'down', 'right', 'left']
    player.addSkyBackground(
        urls.map((item) => {
            return `./assets/background/sky/bak0/${item}.jpg`
        })
    )
}

/**
 * 创建建筑物场景
 * @param {*} player
 */
function demoBuilding(player) {
    //设置中心点位置
    var centerCoord = gcoord.transform([121.5048, 31.2376], gcoord.WGS84, gcoord.WebMercator)

    const loader = new THREE.FileLoader()

    //加载geojson数据
    loader.load('./assets/geojson/shanghai-floor.geojson', (data) => {
        const jsonData = JSON.parse(data)

        //使用geogeomtry构建geo物体
        var geomtry = new GeoGeomtry(jsonData, { polygonLine: false })

        //设置高度转换器
        geomtry.setHeightTranformer((feature) => {
            return feature.properties.Floor * 4.6
        })

        //设置经纬度转换器
        geomtry.setCoordinateTranformer((coord) => {
            var [x1, y1] = gcoord.transform(coord, gcoord.WGS84, gcoord.WebMercator)
            return [x1 - centerCoord[0], y1 - centerCoord[1]]
        })

        geomtry.build()

        geomtry.mesh.rotation.x = -Math.PI / 2

        var boundingBox = new THREE.Box3()

        // 计算 obj 对象及其所有子对象的边界框
        boundingBox.setFromObject(geomtry.mesh)

        geomtry.mesh.children.map((item) => {
            item.material = new THREE.MeshStandardMaterial({ color: 0xcccccc })
            item.castShadow = true
        })

        // var plane = new THREE.PlaneGeometry(boundingBox.max.x * 2, boundingBox.max.x * 2, 100, 100)
        // var material = new THREE.MeshStandardMaterial({
        //     side: THREE.DoubleSide,
        //     color: 0xeeeeee
        // })
        // var mesh = new THREE.Mesh(plane, material)
        // mesh.receiveShadow = true
        // mesh.rotation.x = -Math.PI / 2
        // mesh.position.y = -5
        // player.add(mesh)
        player.add(geomtry.mesh)

        player.camera.position.set(0, boundingBox.max.y / 2, boundingBox.min.z / 2)
    })
}

const mainApp = () => {

    var player = new Player({
        grid:false,
        axes:false
    })
    player.renderer.shadowMap.enabled = true
    player.camera.position.set(0, 5, 0)

    senceDemo(player)

    demoBuilding(player)

    // 创建投射光线对象
    const raycaster = new THREE.Raycaster()
    // 鼠标的位置对象
    const mouse = new THREE.Vector2()
    // 监听鼠标的位置
    window.addEventListener('click', (event) => {
        //   console.log(event);
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        mouse.y = -((event.clientY / window.innerHeight) * 2 - 1)
        raycaster.setFromCamera(mouse, player.camera)
        let result = raycaster.intersectObjects(player.scene.children)
        console.log(result)
        result.forEach((item) => {})
    })

    var dirLight = new THREE.DirectionalLight(0xffffff, 1)
    dirLight.castShadow = true
    dirLight.position.set(1000, 1000, 0)
    player.add(dirLight)
    var lightHelper = new THREE.DirectionalLightHelper(dirLight)
    player.add(lightHelper)

    //实时渲染
    function animate() {
        requestAnimationFrame(animate)
        //console.log(player.camera.position)
        player.render()
    }
    animate()
}

mainApp()

export default mainApp

import gcoord from 'gcoord'
import * as THREE from 'three'
import { ScatterCircle } from '../../core/effect/index.js'
import { GeoGeomtry, Player } from '../../core/main.js'

/**
 * 场景效果
 */
function senceDemo(player) {
    //  var urls = ['front', 'back', 'top', 'down', 'right', 'left']
    var urls = ['posx', 'negx', 'posy', 'negy', 'posz', 'negz']
    player.addSkyBackground(
        urls.map((item) => {
            return `./assets/background/sky/night-star/${item}.jpg`
        })
    )

    const ambientLight = new THREE.AmbientLight(0xd4e7fd, 4)
    player.add(ambientLight)
    const directionalLight = new THREE.DirectionalLight(0xe8eaeb, 0.2)
    directionalLight.position.set(0, 20, 20)
    player.add(directionalLight)
}

function transform(coord) {
    var [x, y] = gcoord.transform(coord, gcoord.WGS84, gcoord.WebMercator)
    return [x / 1000, y / 1000]
}

const mainApp = () => {
    var player = new Player({
        grid: false
    })
    window.player = player
    player.camera.position.set(0, 5, 3000)

    senceDemo(player)

    const centerCoord = transform([108.55, 34.32])
    const loader = new THREE.FileLoader()
    loader.load('./assets/geojson/china.json', (data) => {
        const jsonData = JSON.parse(data)

        var geoGeomtry = new GeoGeomtry(jsonData, { polygonLine: true })

        geoGeomtry.setHeightTranformer((feature) => {
            return 20
        })

        geoGeomtry.setCoordinateTranformer((coord) => {
            var [x1, y1] = transform(coord)
            // console.log([x1 - centerCoord[0], y1 - centerCoord[1]])
            return [x1 - centerCoord[0], y1 - centerCoord[1]]
        })

        geoGeomtry.build()
        geoGeomtry.mesh.rotation.x = Math.PI * 2
        player.add(geoGeomtry.mesh)

        jsonData.features.map((feature) => {
            var { name, center, centroid } = feature.properties
            if (center && centroid) {
                var [x1, y1] = transform(center)
                var [x2, y2] = transform(centroid)
                let position = { x: x1 - centerCoord[0], y: y1 - centerCoord[1], z: 40 }
                let position2 = { x: x2 - centerCoord[0], y: y2 - centerCoord[1], z: 40 }

                // player.createLabelSprite(name, { color: '#ffffff' }, (label, width, height) => {
                //     label.scale.set(width * 4, height * 4, 1)
                //     label.position.set(position.x, position.y + 1, position.z)
                //     player.add(label)
                // })

                // var label = player.createTextLabel(name)
                // label.position.set(position.x, position.y + 1, position.z)
                // player.add(label)

                var scatterCircle = new ScatterCircle({ radius: 50 })
                scatterCircle.mesh.position.set(position.x + 20, position.y + 21, position.z + 20)
                //scatterCircle.setPosition({x:position.x, y:position.y,z:position.z})
                player.add(scatterCircle.mesh)

                // var scatterCircle2 = new ScatterCircle2({radius:100,color:0xff0000})
                // scatterCircle2.setPosition(position)
                // player.add(scatterCircle2.mesh)
                // var test = new Test({radius:100,color:0xff0000})
                // test.setPosition(position)
                // player.add(test.mesh)

                // var breathingCircle = new BreathingCircle({radius:100})
                // breathingCircle.setPosition(position)
                // player.add(breathingCircle.mesh)
            }
        })
    })

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

        // player.scene.traverse((mesh) => {
        //     if (mesh.isMesh && mesh.properties && mesh.properties.material) {
        //         mesh.material = mesh.properties.material
        //         mesh.properties.material = null
        //     }
        // })
        // if (result && result[0]) {
        //     var mesh = result.find((a) => a.object.name == 'geojson-shape')
        //     if (mesh && mesh.object.properties) {
        //         mesh.object.properties.material = result[0].object.material
        //         mesh.object.material = new THREE.MeshBasicMaterial({
        //             color: 0xffffff,
        //             transparent: true,
        //             opacity: 0.9
        //         })
        //     }
        // }
    })

    var clock = new THREE.Clock()
    //实时渲染
    function animate() {
        requestAnimationFrame(animate)
        player.render()
    }
    animate()
}

mainApp()

export default mainApp

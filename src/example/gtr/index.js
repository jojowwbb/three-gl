import * as THREE from 'three'
import gcoord from 'gcoord'

import { GeoGeomtry, Player, PickHelper } from '../../core/main.js'

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

function demo(player) {
    //const loader = new THREE.TextureLoader().setPath('./assets/model/gltf/free_1975_porsche_911_930_turbo/textures/')
    player.loadGLTF('./assets/model/gltf/free_1975_porsche_911_930_turbo/scene.gltf', (model) => {
        model.traverse((item) => {
            if (item.isMesh) {
                item.material.emissive = item.material.color
                item.material.emissiveMap = item.material.map
            }
        })
        player.add(model)
    })
}

function demo2(player) {
    //const loader = new THREE.TextureLoader().setPath('./assets/model/gltf/free_1975_porsche_911_930_turbo/textures/')
    player.loadGLTF('./assets/model/ccity-building-set-1/ccity_building_set_1.glb', (model) => {
        model.traverse((item) => {
            if (item.isMesh) {
                // obj.material.emissive=new THREE.Color(1,1,1);
                //     obj.material.emissiveIntensity=1;
                //     obj.material.emissiveMap=obj.material.map;

                item.material.emissive = new THREE.Color(1,1,1);
                item.material.emissiveMap = item.material.map
            }
        })
        player.add(model)
    })
}

const mainApp = () => {
    var player = new Player({
        grid: false
    })

    senceDemo(player)
    demo2(player)

    const color = 0xffffff
    const intensity = 1
    const light = new THREE.DirectionalLight(color, intensity)
    light.position.set(0, 10, 0)
    light.target.position.set(-5, 0, 0)
    player.add(light)
    player.add(light.target)

    var pickHelper = new PickHelper()
    // 监听鼠标的位置
    window.addEventListener('click', (event) => {
        const mouse = new THREE.Vector2()
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        mouse.y = -((event.clientY / window.innerHeight) * 2 - 1)
        pickHelper.pick(mouse, player.scene, player.camera)
    })

    //实时渲染
    function animate() {
        requestAnimationFrame(animate)
        player.render()
    }
    animate()
}

mainApp()

export default mainApp

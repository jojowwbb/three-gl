import * as THREE from 'three'
import { Player } from '../../core/main.js'

/**
 * 场景效果
 */
function senceDemo(player) {
    var urls = ['posx', 'negx', 'posy', 'negy', 'posz', 'negz']
    player.addSkyBackground(
        urls.map((item) => {
            return `./assets/background/sky/night-star/${item}.jpg`
        })
    )
}

const mainApp = async () => {
    var player = new Player({
        axes: true,
        grid: false
    })

    player.camera.position.set(6, 7, -43)

    player.loadGLTF('./assets/model/solar/venus.glb', (model) => {
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        // console.log(center,model.position)
        model.position.x+=model.position.x-center.x;
        model.position.y+=model.position.y-center.y;
        model.position.z+=model.position.z-center.z;
        player.add(model)
    })

    //星空背景
    senceDemo(player)

    //实时渲染
    var clock = new THREE.Clock()
    function animate() {
        requestAnimationFrame(animate)

        player.render()
    }
    animate()
}

mainApp()

export default mainApp

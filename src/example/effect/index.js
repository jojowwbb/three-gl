import * as THREE from 'three'
import { Player } from '../../core/main.js'

import { BreathingCircle, LightHexagram, RotateStar, ScatterCircle2, ScatterCircle3, ScatterCircle } from '../../core/effect/index.js'

const mainApp = () => {
    var player = new Player({ grid: false, axes: false })
    player.camera.position.set(0, 0, 20)


    var mesh2 = new ScatterCircle({ radius: 1 })
    mesh2.mesh.position.set(3, 0, 0)
    player.add(mesh2.mesh)

    var mesh3 = new ScatterCircle2({ radius: 1 })
    mesh3.mesh.position.set(5, 0, 0)
    player.add(mesh3.mesh)

    var mesh4 = new ScatterCircle3({ radius: 1 })
    mesh4.mesh.position.set(7, 0, 0)
    player.add(mesh4.mesh)

    var mesh5 = new RotateStar({ radius: 1 })
    mesh5.mesh.position.set(9, 0, 0)
    player.add(mesh5.mesh)

    var mesh6 = new LightHexagram({ radius: 1 })
    mesh6.mesh.position.set(11, 0, 0)
    player.add(mesh6.mesh)
    var mesh7 = new BreathingCircle({ radius: 1, color: 0xfff000 })
    mesh7.mesh.position.set(13, 0, 0)
    player.add(mesh7.mesh)

    const clock = new THREE.Clock()
    function animate() {
        requestAnimationFrame(animate)
        player.render()
    }
    animate()
}

mainApp()

export default mainApp

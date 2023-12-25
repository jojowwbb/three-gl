import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

import { Space } from '../../core/main.js'

import GameManager from './manager/GameManager.js'


const mainApp = () => {
    var space = new Space()

    space.init()
    space.addGridHelper()

    const environment = new RoomEnvironment()
    const pmremGenerator = new THREE.PMREMGenerator(space.renderer)
    space.scene.environment = pmremGenerator.fromScene(environment).texture

    space.camera.position.set(0, 6, 18)

    var game=new GameManager(space);

}

mainApp()

export default mainApp

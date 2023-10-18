import * as THREE from 'three'
import { Player } from '../../core/main.js'
import vertexShader from "./fire/vertex.glsl"
import fragmentShader from "./fire/fragment.glsl"

const mainApp = () => {
    var player = new Player({ grid: false })
    player.camera.position.set(0, 0, 20)

    var urls = ['front', 'back', 'top', 'down', 'right', 'left']
    player.addSkyBackground(
        urls.map((item) => {
            return `./assets/background/sky/bak0/${item}.jpg`
        })
    )

    var geometry = new THREE.BoxGeometry(2, 2, 2, 128, 128)
    var material = new THREE.ShaderMaterial({
        color: 0x339933,
        vertexShader:vertexShader,
        fragmentShader:fragmentShader,
        uniforms:{
            uTime:{
                value:0.0
            }
        },
        transparent:true
    })
    var mesh = new THREE.Mesh(geometry, material)
    var clock=new THREE.Clock()
    player.add(mesh)
    function animate() {
        requestAnimationFrame(animate)

        material.uniforms.uTime.value+=clock.getDelta()
        player.render()

        console.log('//viewMatrix')
        console.log(player.camera.matrixWorldInverse)
        console.log('//projectionMatrix')
        console.log(player.camera.projectionMatrix)
        console.log('//modelMatrix')
        console.log(mesh.matrixWorld)
        console.log('//cameraPosition')
        console.log(player.camera.position)
        console.log('//modelViewMatrix = viewMatrix * modelMatrix')
        console.log(player.camera.matrixWorldInverse.multiply(mesh.matrixWorld))
    }
    animate()
}
mainApp()

export default mainApp

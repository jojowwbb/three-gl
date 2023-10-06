import * as THREE from 'three'
import { Player } from '../../core/main.js'

import fragmentShader from './shield/fragment.glsl'
import vertexShader from './shield/vertex.glsl'

const mainApp = () => {
    var player = new Player({ grid: false })
    player.camera.position.set(0, 0, 20)

    var urls = ['front', 'back', 'top', 'down', 'right', 'left']
    player.addSkyBackground(
        urls.map((item) => {
            return `./assets/background/sky/bak0/${item}.jpg`
        })
    )

    const textureLoader = new THREE.TextureLoader()
    const texture = textureLoader.load('./assets/texture/noise3.jpeg')
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    var geometry = new THREE.SphereGeometry(0.4, 128, 128)
    //var geometry = new THREE.BoxGeometry(2,2,2,128,128)
    var material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: {
                value: 0
            },
            uBaseTexture: {
                value: texture
            },
            uColor: {
                value: new THREE.Color(0x00ff00)
            }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true,
        side: THREE.DoubleSide
    })

    var mesh = new THREE.Mesh(geometry, material)

    // var mesh=new LightShieldMesh()
    player.add(mesh)

    const clock = new THREE.Clock()
    function animate() {
        //mesh.rotation.y+=Math.sin(clock.getDelta())*Math.PI
        material.uniforms.uTime.value += clock.getDelta()
        requestAnimationFrame(animate)
        player.render()
    }
    animate()
}
mainApp()

export default mainApp

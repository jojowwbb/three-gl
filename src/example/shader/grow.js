import * as THREE from 'three'
import { Player } from '../../core/main.js'
import vertexShader from './grow/vertex.glsl'
import fragmentShader from './grow/fragment.glsl'

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

    // var geometry = new THREE.SphereGeometry(3, 128, 128)
    var geometry = new THREE.BoxGeometry(2, 2, 2, 128, 128)
    var material = new THREE.MeshBasicMaterial({
        color: 0xff0000
    })
    var mesh = new THREE.Mesh(geometry, material)
    player.add(mesh)

    var growMaterial = new THREE.ShaderMaterial({
        uniforms: {
            c: { type: 'f', value: 1.0 },
            p: { type: 'f', value: 1.4 },
            glowColor: { type: 'c', value: new THREE.Color(0xffff00) },
            viewVector: { type: 'v3', value: player.camera.position }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
        transparent: true
    })

    // var smoothCubeGeom = geometry.clone();
    // var modifier = new THREE.SubdivisionModifier( 2 );
    // modifier.modify( smoothCubeGeom );

    var growMesh = new THREE.Mesh(geometry, growMaterial)
    //growMesh.position.set(mesh.position.x, mesh.position.y, mesh.position.z)
    growMesh.scale.multiplyScalar(1.15)
    player.add(growMesh)

    const clock = new THREE.Clock()
    function animate() {
        //mesh.rotation.y+=Math.sin(clock.getDelta())*Math.PI
        //  material.uniforms.uTime.value += clock.getDelta()
        requestAnimationFrame(animate)

        growMaterial.uniforms.viewVector.value = new THREE.Vector3().subVectors(player.camera.position, growMesh.position)

        player.render()
    }
    animate()
}
mainApp()

export default mainApp

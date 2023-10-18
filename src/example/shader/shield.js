import * as THREE from 'three'
import { Player } from '../../core/main.js'
import vertexShader from "./grow/vertexShader.glsl"
import fragmentShader from "./grow/fragmentShader.glsl"

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

    //var geometry = new THREE.SphereGeometry(3, 128, 128)
    var geometry = new THREE.BoxGeometry(2,2,2,128,128)
    var material = new THREE.ShaderMaterial({
        uniforms: {
            rimColor: { value: new THREE.Color(1.0, 1.0, 1.0) },
            rimStrength: { value: 1.0 },
            rimPow: { value: 1.0 },
            insideColor: { value: new THREE.Color(0.0, 0.0, 0.0) },
            insideStrength: { value: 1.0 },
            insidePow: { value: 1.0 }
        },
        vertexShader: `
            varying vec3 vViewPosition;
            varying vec3 surfaceNormal;
            varying vec2 uvPosition;
            void main(){
                vec4 mvPosition= modelViewMatrix * vec4(position,1.0);
                surfaceNormal=normalMatrix * normal; //normalize(normal);
                uvPosition = uv;
                vViewPosition = - mvPosition.xyz;
                gl_Position= projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vViewPosition;
            varying vec3 surfaceNormal;
            varying vec2 uvPosition;

            uniform vec3 rimColor;
            uniform float rimStrength;
            uniform float rimPow;

            uniform vec3 insideColor;
            uniform float insideStrength;
            uniform float insidePow;


            void main(){
                vec4 diffuseColor = vec4(1.0,1.0,0,1.0);

                vec3 viewDir = normalize(vViewPosition);    
                
                float rimGlow = 1.0 - max(0.0, dot(surfaceNormal, viewDir));
                rimGlow = pow( rimGlow, rimPow);
                diffuseColor.rgb += rimColor * rimGlow * rimStrength;

                float insideGlow = max(0.0, dot(surfaceNormal, viewDir));
                insideGlow = pow( insideGlow, insidePow);
                diffuseColor.rgb += insideColor * insideGlow * insideStrength;

                gl_FragColor=diffuseColor;
            }
        `,
        transparent: true,
        side: THREE.DoubleSide
    })


    var mesh = new THREE.Mesh(geometry, material)

    player.add(mesh)

    const clock = new THREE.Clock()
    function animate() {
        //mesh.rotation.y+=Math.sin(clock.getDelta())*Math.PI
      //  material.uniforms.uTime.value += clock.getDelta()
        requestAnimationFrame(animate)
        player.render()
    }
    animate()
}
mainApp()

export default mainApp

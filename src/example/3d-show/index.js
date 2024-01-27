import * as THREE from 'three'

window.THREE = THREE

import { Space } from '../../core/main'
import ActionManager from './ActionManager'

const mainApp = () => {
    var space = new Space()
    var carModel = null
    var mixer = null
    var actionManager = null
    space.init()
    space.addControls()
    //space.addAmbientLight()
    space.addPickHelper()
    space.addPointLight()
    space.addDirectionalLight()

    space.load('3d-show-car/free_concept_car_005_-_public_domain_cc0.glb').then((model) => {
        carModel = model.scene
        console.log(carModel)
        // 计算模型的包围盒
        var bbox = new THREE.Box3().setFromObject(carModel)

        // 计算模型的中心点
        var center = new THREE.Vector3()
        bbox.getCenter(center)

        // 将模型居中
        carModel.position.sub(center)

        // 计算模型的最大边长
        var size = bbox.getSize(new THREE.Vector3())
        var maxSize = Math.max(size.x, size.y, size.z)

        // 计算缩放比例，使模型适应窗口大小
        var scale = 2 / maxSize
        carModel.scale.set(scale, scale, scale)

        var cameraDistance = Math.max(bbox.getSize(new THREE.Vector3()).length(), 2)
        var cameraPosition = new THREE.Vector3(center.x, center.y + 1.6, center.z + cameraDistance - 10)
        space.camera.position.copy(cameraPosition)

        // 找到车灯的材质
        var headlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, emissive: 0xffff00, emissiveIntensity: 1 })

        // 遍历汽车模型的子对象，找到车灯部分
        carModel.traverse(function (child) {
            if (child.isMesh) {
                // 假设车灯的材质命名为"headlight_material"
                if (child.name === 'Cube005_Material006_0' || child.name === 'Cube009_Material009_0' || child.name == 'Cube011_taillight_cover_0') {
                    console.log('asdsa')
                    // 将车灯的材质设置为发光材质
                    //    child.material = headlightMaterial

                    child.material.emissive = new THREE.Color(0xffff00) // 发光的颜色
                    child.material.emissiveIntensity = 1 // 发光的强度
                    child.material.needsUpdate = true // 更新材质
                }
            }
        })

        if (model.animations && model.animations.length > 0) {
            actionManager = new ActionManager(model)
            actionManager.bind('KeyJ', 'doorsOpeningAction', { loop: THREE.LoopOnce, clampWhenFinished: true, timeScale: 3 })

            // mixer = new THREE.AnimationMixer(carModel)

            // // 将所有动画添加到混合器
            // model.animations.forEach(function (clip) {
            //     console.log(clip)
            //     mixer.clipAction(clip).play()
            // })
        }

        //  space.add(carModel)
    })

    // 创建自定义着色器
    var edgeShader = {
        uniforms: {
            tDiffuse: { value: null },
            edgeColor: { value: new THREE.Color(0xffffff) },
            edgeStrength: { value: 3.0 }
        },
        vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
        fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec3 edgeColor;
        uniform float edgeStrength;
        varying vec2 vUv;
        void main() {
            vec4 texel = texture2D(tDiffuse, vUv);
            vec3 rgb = texel.rgb;
            vec2 dxy = edgeStrength * (1.0 / 300.0) * (1.0 / resolution.x) * normalize(vec2(dFdx(vUv.x), dFdy(vUv.y)));
            float edge = max(max(max(abs(dFdx(rgb.r)), abs(dFdy(rgb.r))), max(abs(dFdx(rgb.g)), abs(dFdy(rgb.g)))), max(abs(dFdx(rgb.b)), abs(dFdy(rgb.b))));
            edge = 1.0 - min(1.0, edge);
            vec3 outlined = mix(rgb, edgeColor, edge);
            gl_FragColor = vec4(outlined, texel.a);
        }
    `
    }

    var cubeGeometry = new THREE.BoxGeometry(1, 1, 1)
    // 创建 ShaderMaterial
    var edgeMaterial = new THREE.ShaderMaterial(edgeShader)

    // 应用 ShaderMaterial 到立方体
    var cubeMesh = new THREE.Mesh(cubeGeometry, edgeMaterial)

    // 将立方体添加到场景
    space.add(cubeMesh)

    var clock = new THREE.Clock()

    function animate() {
        requestAnimationFrame(animate)
        if (carModel) {
            //   carModel.rotation.y += 0.01 // 调整旋转速度
        }

        if (actionManager) {
            actionManager.update(clock.getDelta())
        }

        space.render()
    }
    animate()
}

//mainApp()

const test = () => {
    var space = new Space()
    space.init()
    space.addControls()

    const a = new THREE.Vector3(5, 0, 0)
    const b = new THREE.Vector3(3, 0, 3)

    //给箭头设置一个起点(随便给个位置就行)
    const O = new THREE.Vector3(0, 0, 0)
    // 红色箭头表示向量a
    const arrowA = new THREE.ArrowHelper(a.clone().normalize(), O, a.length(), 0xff0000)
    // 绿色箭头表示向量b
    const arrowB = new THREE.ArrowHelper(b.clone().normalize(), O, b.length(), 0x00ff00)

    // 创建一个向量c，用来保存叉乘结果
    const c = new THREE.Vector3()
    //向量a叉乘b，结果保存在向量c
    c.crossVectors(a, b)
    console.log('叉乘结果', c) //叉乘结果是一个向量对象Vector3

    // 可视化向量a和b叉乘结果：向量c
    const arrowC = new THREE.ArrowHelper(c.clone().normalize(), O, c.length() / 3, 0x0000ff)

    space.add(arrowA)
    space.add(arrowB)
    space.add(arrowC)
}

test()

export default test

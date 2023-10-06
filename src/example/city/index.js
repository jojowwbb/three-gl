import * as THREE from 'three'
import { Player } from '../../core/main.js'
import { getAltitudeDiffrence } from '../../core/shader/manager/utils.js'

import gsap from 'gsap'

import { LightFlyLine, LightLocation, LightPoints, LightWall, LightBall, Symbol, LightShield } from '../../core/effect/index.js'

import frafmentStr from './shader/TechnologyCityShader/fragment.glsl'
import vertexStr from './shader/TechnologyCityShader/vertex.glsl'

var debugParams = {
    color: 0xfff000,
    color2: 0x183d82
}

function makePath(player) {}

/**
 * 加载城市模型
 * @param {*} player
 */
function cityDemo(player) {
    player.loadObj('./assets/model/sh03.obj', (object) => {
        var basic = new THREE.MeshBasicMaterial({
            depthTest: false,
            color: debugParams.color2
        })

        var t = null

        object.children.map((item) => {
            if (item.type == 'Mesh') {
                if (item.name == 'SM_Builiding_SM_Builiding') {
                    var height = getAltitudeDiffrence(item)
                    item.material = new THREE.ShaderMaterial({
                        uniforms: {
                            uSpreadCircleCenter: {
                                value: new THREE.Vector3(0, 0, 0)
                            },
                            uSpreadCircleWidth: {
                                value: 0.008
                            },
                            uSpreadTime: {
                                value: 0
                            },
                            uCircleColor: {
                                value: new THREE.Vector3(1, 1, 1)
                            },
                            uHeight: {
                                value: height
                            },
                            uBaseColor: {
                                value: new THREE.Color(0x1378e8)
                            },
                            uTopLineWidth: {
                                value: 0.002
                            },
                            uTopLineTime: {
                                value: 0
                            }
                        },
                        vertexShader: vertexStr,
                        fragmentShader: frafmentStr
                    })

                    gsap.to(item.material.uniforms.uSpreadTime, {
                        value: 30,
                        duration: 1,
                        ease: 'none',
                        repeat: -1
                    })

                    gsap.to(item.material.uniforms.uTopLineTime, {
                        value: 3,
                        duration: 5,
                        ease: 'none',
                        repeat: -1
                    })

                    const modelFolder = player.gui.addFolder('模型效果')
                    modelFolder.open()
                    modelFolder
                        .addColor(debugParams, 'color')
                        .name('建筑颜色')
                        .onChange((value) => {
                            item.material.uniforms.uBaseColor.value = new THREE.Color(value)
                        })
                    modelFolder
                        .addColor(debugParams, 'color2')
                        .name('地面颜色')
                        .onChange((value) => {
                            basic.color = new THREE.Color(value)
                        })
                } else if (item.name == 'SM_Tower_SM_Tower') {
                    item.material = new THREE.MeshBasicMaterial({
                        transparent: true,
                        color: 0xff00b4
                    })
                    t = item
                } else {
                    item.material = basic
                }
            }
        })

        player.add(object)

        player.createLabelSprite('东方明珠', { color: '#ffff00' }, (label, width, height) => {
            label.scale.set(0.02 * width, 0.02 * height, 1)
            label.position.set(0, 4, 0)
            player.add(label)
        })
    })
}

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
    //星空粒子
    var lightPoints = new LightPoints()
    player.add(lightPoints.mesh)

    //雪花
    var lightPoints2 = new LightPoints({ count: 100, texturePath: './assets/texture/points/snow2.png' })
    player.add(lightPoints2.mesh)

    var points = lightPoints.mesh
    var points2 = lightPoints2.mesh

    //实时渲染
    function animate() {
        if (points.position.y <= -10) {
            points.position.y = 20
        }
        points.position.y -= 0.1

        if (points2.position.y <= -10) {
            points2.position.y = 20
        }
        points2.position.y -= 0.1
        requestAnimationFrame(animate)
    }
    animate()
}

/**
 * 数据、事件特效
 * @param {*} player
 */
function dataDemo(player) {
    //发光位置标记效果
    for (let i = 0; i < 5; i++) {
        let position = { x: (Math.random() - 0.5) * 20, y: 3, z: (Math.random() - 0.5) * 20 }
        const lightLocation = new LightLocation({
            data: [0.2, 0.5, 4],
            position: position,
            color: new THREE.Color(Math.random(), Math.random(), Math.random())
        })
        lightLocation.mesh.layers.enable(Player.LAYER.Bloom)
        player.add(lightLocation.mesh)
    }

    //文本标签
    for (let i = 0; i < 5; i++) {
        let position = { x: (Math.random() - 0.5) * 20, y: 3, z: (Math.random() - 0.5) * 20 }
        player.createLabelSprite('警告', { color: '#ff0000' }, (label, width, height) => {
            label.scale.set(0.02 * width, 0.02 * height, 1)
            label.position.set(position.x, position.y + 1, position.z)
            player.add(label)
        })
    }

    //Sprite标志
    for (let i = 0; i < 10; i++) {
        let position = { x: (Math.random() - 0.5) * 20, y: 3, z: (Math.random() - 0.5) * 20 }
        const symbol = new Symbol({ spritePath: `./assets/sprite/${['flash', 'x', 'alarm'][parseInt(Math.random() * 3)]}.png` })
        symbol.mesh.position.set(position.x, position.y - 0.5, position.z)
        symbol.mesh.layers.enable(Player.LAYER.Bloom)
        player.add(symbol.mesh)
    }

    var flyLine = new LightFlyLine({ startPos: [0, 0, 0], endPos: [10, 0, 0] })
    player.add(flyLine.mesh)
    var flyLine2 = new LightFlyLine({ startPos: [0, 0, 0], endPos: [-10, 0, 0] })
    player.add(flyLine2.mesh)
    var flyLine3 = new LightFlyLine({ startPos: [0, 0, 0], endPos: [0, 0, 10] })
    player.add(flyLine3.mesh)
    var flyLine4 = new LightFlyLine({ startPos: [0, 0, 0], endPos: [0, 0, -10] })
    player.add(flyLine4.mesh)

    var lightWall = new LightWall({ position: [0, 0.5, 0], radius: 10, color: 0xff0000 })
    player.add(lightWall.mesh)

    // var lightBallMesh = new LightBallMesh({ position: [8, 0, 5], radius: 3, color: 0xfff000 })
    // player.add(lightBallMesh.mesh)

    var lightShield = new LightShield({ position: [8, 0, 5], radius: 3, color: 0xfff000 })
    player.add(lightShield.mesh)
}

const mainApp = () => {
    var player = new Player({ grid: false })
    player.camera.position.set(0, 5, 10)

    cityDemo(player)
    dataDemo(player)
    senceDemo(player)


    var points = player.getObjectByName('LightPoints')

    let progress=0;
    let cameraParent = new THREE.Object3D()
    cameraParent.position.set(0, 0, 0)
    player.add(cameraParent)
console.log(player.controls.position0)
    // let progress = 0
    // let hasCamera = false
    let curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(9, 0, 9), 
        new THREE.Vector3(9, 0, -9), 
        new THREE.Vector3(-9, 0, -9),
        new THREE.Vector3(-9, 0, 9),
        new THREE.Vector3(9, 0, 9)
    ])


    //实时渲染
    function animate() {
        if (points.position.y <= -10) {
            points.position.y = 20
        }
        points.position.y -= 0.1

        if (progress <= 1 - 0.0002){
			const point = curve.getPointAt(progress) //获取样条曲线指定点坐标，作为相机的位置
			const pointBox = curve.getPointAt(progress + 0.0002) //获取样条曲线指定点坐标
			player.camera.position.set(point.x, point.y+1, point.z)
			player.camera.lookAt(pointBox.x, pointBox.y, pointBox.z)
		//	player.controls.position0.set(point.x, point.y, point.z) //非必要，场景有控件时才加上
		//	player.controls.target.set(pointBox.x, pointBox.y, pointBox.z) //非必要，场景有控件时才加上
			progress += 0.0002
		} else {
			progress = 0
		}

         // 在动画函数中调用以下程序
        // progress += 1 / 2000
        // let point = curve.getPoint(progress)
        // progress += 1 / 2000
        // let nextPosition = curve.getPoint(progress)
        // cameraParent.position.set(point.x, point.y, point.z)
        // cameraParent.lookAt(new THREE.Vector3(nextPosition.x, nextPosition.y, nextPosition.z))

        requestAnimationFrame(animate)




        player.render()
    }
    animate()
}

mainApp()

export default mainApp

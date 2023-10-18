import * as THREE from 'three'

import { PickHelper, Player } from '../../core/main.js'
import data from './config.js'

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

function loadModel(player, name, data) {
    return new Promise((resolve, reject) => {
        player.loadGLTF('./assets/model/solar/' + name, (model) => {
            model.traverse((item) => {
                if (item.isMesh) {
                    item.material.side = THREE.DoubleSide
                    item.geometry.computeBoundingBox()
                    item.geometry.center()
                }
            })
            var p = new THREE.Box3()
            p.setFromObject(model)
            var obj = new THREE.Object3D()
            var label = player.createTextLabel(data.name)
            label.position.set(0, p.max.y + 1, 0)
            obj.add(model)
            obj.add(label)
            player.add(obj)
            resolve(obj)
        })
    })
}

function createTrack(radius, player, position = [0, 0, 0]) {
    //创建轨迹
    let geometry = new THREE.RingGeometry(radius, radius + 0.03, 1000) //圆环几何体
    //圆环材质
    let material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide
    })
    let mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(...position) //轨道位置
    mesh.rotation.set(0.5 * Math.PI, 0, 0) //旋转轨道至水平
    player.add(mesh)
    return mesh
}

const mainApp = async () => {
    var player = new Player({
        axes: false,
        grid: false
    })

    player.camera.position.set(6, 7, -43)

    //星空背景
    senceDemo(player)

    data.map(async (item) => {
        if (item.isTrack) {
            createTrack(item.position, player)
        }
        if (item.file) {
            var mesh = await loadModel(player, item.file + '.glb', item)
            mesh.position.x = item.position
            if (item.scale) {
                mesh.scale.set(item.scale, item.scale, item.scale)
            }
            item.mesh = mesh
        }
    })

    //添加月球
    var moon = await loadModel(player, 'moon.glb', { name: '月球' })
    moon.position.x = 2
    moon.scale.set(0.1, 0.1, 0.1)
    //将月球添加到地月系统
    data.find((i) => i.name == '地球').mesh.add(moon)

    data.map((item) => {
        if (item.mesh) {
            player.gui
                .add(item.mesh.scale, 'x')
                .name(item.name)
                .onChange((v) => {
                    item.mesh.scale.setScalar(v)
                })
        }
    })

    player.addPointLight()
    player.addDirectionalLight()

    var pickHelper = new PickHelper()
    window.addEventListener('click', (event) => {
        const mouse = new THREE.Vector2()
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        mouse.y = -((event.clientY / window.innerHeight) * 2 - 1)
        pickHelper.pick(mouse, player.scene, player.camera)
    })

    //实时渲染
    var clock = new THREE.Clock()
    function animate() {
        requestAnimationFrame(animate)
        data.map((item) => {
            if (item.revolution) {
                var angle = item.angle + item.revolution
                angle >= 2 * Math.PI ? 0 : angle
                item.angle = angle
                if (item.mesh) {
                    item.mesh.position.set(item.position * Math.sin(angle), 0, item.position * Math.cos(angle))
                    item.mesh.rotation.y = item.mesh.rotation.y + 0.01 >= 2 * Math.PI ? 0 : item.mesh.rotation.y + 0.01
                }
            } else {
                if (item.mesh) {
                    item.mesh.rotation.y = item.mesh.rotation.y + 0.01 >= 2 * Math.PI ? 0 : item.mesh.rotation.y + 0.01
                }
            }
        })

        player.render()
    }
    animate()
}

mainApp()

export default mainApp

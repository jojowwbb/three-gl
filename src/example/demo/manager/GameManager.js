import * as THREE from 'three'
import ActionManager from './ActionManager'
// 引入/examples/jsm/math/目录下胶囊扩展库Capsule.js
import { Capsule } from 'three/examples/jsm/math/Capsule.js'
// 引入八叉树扩展库
import { Octree } from 'three/examples/jsm/math/Octree.js'
// 分割模型，生成八叉树节点

import { OctreeHelper } from 'three/examples/jsm/helpers/OctreeHelper.js'

import BBox from './BBox.js'
import { CapsuleHelper } from './Helper'

export default class GameManager {
    state = {
        currentDirection: new THREE.Vector3(0, 0, 1),
        isMouseButton: false
    }
    config = {
        speed: 30,
        groundHeight: 20
    }

    worldOctree = null
    player = null
    playerCapsule = null

    constructor(space) {
        this.space = space
        this.worldOctree = new Octree()
        this.init()
    }
    async init() {
        await this.initPlayer()
        await this.initWorld()
        this.initEvent()
        this.render()
    }
    async initPlayer() {
        //加载玩家角色模型
        const gltf = await this.space.load('RobotExpressive.glb')
        var player = gltf.scene
        //设置玩家模型位置
        player.position.y = this.config.groundHeight
        player.add(this.space.camera)
        this.space.camera.position.set(0, 5, -5.5)
        this.space.camera.lookAt(0, 24, 0)
        this.space.add(player)
        this.player = player

        var bbox = new BBox(player)

        // 可视化胶囊几何体
        const capsuleHelper = CapsuleHelper(bbox.capsule.r, bbox.size.y)
        player.add(capsuleHelper)

        this.playerCapsule = new Capsule(bbox.capsule.start, bbox.capsule.end, bbox.capsule.r)

        //动作管理器
        this.actionManager = new ActionManager(gltf)
        this.actionManager.bind('KeyW,KeyS,KeyA,KeyD', 'Walking', { loop: THREE.LoopRepeat })
        this.actionManager.bind('KeyJ', 'Jump', { loop: THREE.LoopRepeat })
    }
    async initWorld() {
        const gltf = await this.space.load('town3f_partially_complete.glb')
        this.space.add(gltf.scene)
        this.worldOctree.fromGraphNode(gltf.scene)
    }

    initEvent() {
        //旋转
        document.addEventListener('mousedown', () => {
            this.state.isMouseButton = true
        })
        document.addEventListener('mouseup', () => {
            this.state.isMouseButton = false
        })
        document.addEventListener('mousemove', (event) => {
            if (this.state.isMouseButton) {
                this.player.rotation.y -= event.movementX / 600
            }
        })
    }

    /**
     * 移动
     * @param {*} delta
     */
    updatePlayerPosition(delta) {
        //获取当前位置的正前方
        this.player.getWorldDirection(this.state.currentDirection)

        if (this.actionManager) {
            this.actionManager.update(delta)
            var dir = this.state.currentDirection.clone()
            if (this.actionManager.keyState['KeyW'] || this.actionManager.keyState['KeyA']) {
                var position = dir.multiplyScalar(delta).multiplyScalar(this.config.speed)
                this.playerCapsule.translate(position)
                this.updateCollision()
                this.player.position.add(position)
            }
            if (this.actionManager.keyState['KeyS'] || this.actionManager.keyState['KeyD']) {
                var position = dir.multiplyScalar(-delta).multiplyScalar(this.config.speed)
                this.playerCapsule.translate(position)
                this.updateCollision()
                this.player.position.add(position)
            }
        }
    }

    //碰撞检测
    updateCollision() {
        var result = this.worldOctree.capsuleIntersect(this.playerCapsule)
        if (result) {
            console.log(result)
            var position=result.normal.multiplyScalar(result.depth);
            this.playerCollider.translate(position)
            this.player.position.add(position)
        }
    }

    render() {
        var clock = new THREE.Clock()
        var self = this

        function animate() {
            requestAnimationFrame(animate)
            const delta = clock.getDelta()
            self.space.render()
            self.updatePlayerPosition(delta)
        }
        animate()
    }
}

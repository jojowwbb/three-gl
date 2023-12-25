import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import CannonUtils from './cannon-utils'
import CannonShape from './cannon-shape'

import { Space,PickHelper } from '../../core/main'

import CannonDebugger from 'cannon-es-debugger'


 /**
  * 游戏
  */
class Game {

    // 物理世间
    physicsWorld=null
    // threejs 场景管理对象
    space = null

    // 玩家3d模型对象
    playerModel=null
    // 玩家物理世界刚体对象
    playerBody=null

    constructor() {

        /** 初始化threejs场景 */
        this.space = new Space()
        this.space.init()
        this.space.addControls()

        /** 基于环境贴图*/
        const environment = new RoomEnvironment()
        const pmremGenerator = new THREE.PMREMGenerator(this.space.renderer)
        this.space.scene.environment = pmremGenerator.fromScene(environment).texture

        /**相机初始位置 */
        this.space.camera.position.set(0, 280, 100)


        this.initPhysiscWorld()
        this.init()

        this.space.addDirectionalLight()

        this.render()

        this.space.addPickHelper((m)=>{
            console.log(m)
        })


    }

    /**
     * 初始化
     */
    async init() {
        await this.loadScene()
        await this.loadPlayer()
        this.cannonDebugger = new CannonDebugger(this.space.scene, this.physicsWorld)
    }

    /**
     * 初始化物理世界
     */
    initPhysiscWorld() {
        this.physicsWorld = new CANNON.World()
        this.physicsWorld.broadphase = new CANNON.SAPBroadphase(this.physicsWorld)
        this.physicsWorld.gravity.set(0, -9.81, 0)
        this.physicsWorld.allowSleep=true
    }


    /**
     * 加载游戏场景模型
     */
    async loadScene() {
        const gltf = await this.space.load('town3f_partially_complete.glb')
        var world = gltf.scene
        this.space.add(world)
        world.traverse((obj3d) => {
            //创建多面体刚刚提
            if (obj3d.isMesh) {
              var shape= CannonShape.CreateTrimesh(obj3d.geometry)
                if(shape){
                    var body =new CANNON.Body({
                        type:CANNON.BODY_TYPES.STATIC,
                        shape
                    })
                    body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
                    this.physicsWorld.addBody(body)
                }
            }
        })

    }


    async loadPlayer() {
        const gltf = await this.space.load('yuka.glb')
        var player = gltf.scene
        player.position.y=100;
        this.playerModel = player
        this.space.add(player)

        //var playerBody = CannonUtils.createShapeBody(player,CANNON.SHAPE_TYPES.SPHERE,{mass:1})
        //var shape= CannonShape.CreateConvexPolyhedron(player);

        var shape= CannonShape.CreateSphere(player);
        var playerBody =new CANNON.Body({
            mass:1,
            shape
        })

        this.playerBody = playerBody
        this.physicsWorld.addBody(playerBody)
        this.playerBody.position.copy(this.playerModel.position)
    }

    /**
     * 主渲染函数
     */
    render() {
        var clock = new THREE.Clock()
        var self = this


        function animate() {
            requestAnimationFrame(animate)
            self.physicsWorld.step(1/60)
            if (self.cannonDebugger) {
                self.cannonDebugger.update()
            }
            self.space.controls.update()
            self.updatePlayer()
            self.space.render()
        }
        animate()
    }

    /**
     * 更新玩家状态，每帧
     */
    updatePlayer() {
        if (this.playerModel) {
         this.playerModel.position.copy(this.playerBody.position)
        }
    }
}

const start = () => {
    new Game()
}


export default start

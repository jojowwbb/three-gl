import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

import { Space } from '../../core/main.js'

class ActionManager {
    mixers = []
    actions = {}
    keyMapper = {}
    params = {}
    currentAction = null

    keyState={}

    constructor(model) {
        var animations = model.animations
        var mixer = new THREE.AnimationMixer(model.scene)
        this.mixers.push(mixer)
        animations.map((clip) => {
            const action = mixer.clipAction(clip)
            this.actions[clip.name] = action
        })

        document.addEventListener('keydown', ({ code }) => {
            this.keyState[code]=true
            if (this.keyMapper[code]) {
                this.play(this.keyMapper[code])
            }
        })

        document.addEventListener('keyup', ({ code }) => {
            this.keyState[code]=false
            if (this.keyMapper[code]) {
                console.log(code,this.keyMapper[code])
                this.stop(this.keyMapper[code])
            }
        })

        mixer.addEventListener('finished', (p) => {
            p.action.stop().reset()
            this.currentAction=null;
        })
    }
    bind(keyCodes, actionName, actionOptions) {
        if (typeof keyCodes === 'string') {
            keyCodes.split(',').map((keyCode) => {
                this.keyMapper[keyCode] = actionName
                for (var p in actionOptions) {
                    this.actions[actionName][p] = actionOptions[p]
                }
            })
        }
    }
    play(actionName, duration = 0.3) {
        var activeAction = this.actions[actionName]
        if (activeAction && this.currentAction!=activeAction) {
            activeAction.play()
            this.currentAction = activeAction
        }
    }
    stop(actionName, duration = 0.3) {
        var activeAction=this.actions[actionName];
       if(activeAction.loop==THREE.LoopRepeat){
            activeAction.stop().reset()
            this.currentAction=null;
       }
    }
    update(delta) {
        this.mixers.map((mixer) => {
            mixer.update(delta)
        })
    }
}

class GameManager extends Space{

    actionManager=null

    config={
        speed:new THREE.Vector3(0, 0, 3),
        speed2:new THREE.Vector3(3, 0, 0),
        groundHeight:20
    }

    playerObject=null

    constructor(){
       super()

       this.init();
       const environment = new RoomEnvironment()
       const pmremGenerator = new THREE.PMREMGenerator(this.renderer)
       this.scene.environment = pmremGenerator.fromScene(environment).texture
       this.initPlayer()
       this.initWorld()
       this.update()
    }
    initPlayer(){
        this.load('RobotExpressive.glb').then((gltf) => {
            var player=gltf.scene;
            player.position.y=this.config.groundHeight
            this.add(player)
            this.actionManager = new ActionManager(gltf)
            this.actionManager.bind('KeyW,KeyS,KeyA,KeyD', 'Walking', { loop: THREE.LoopRepeat})
            this.actionManager.bind('KeyJ', 'Jump', { loop: THREE.LoopOnce, notAllowStop: true })
            player.add(this.camera)
            this.camera.position.set(0, 5, -5.5);
            this.camera.lookAt(0,24, 0);
            this.playerObject=player
        })
    
    }
    initWorld(){
        this.load('town3f_partially_complete.glb').then((gltf) => {
            this.add(gltf.scene)
        })
    }

    updateFrame(){
        
    }

    update(){
        var clock = new THREE.Clock()
        var self=this;
        function animate() {
            requestAnimationFrame(animate)
            self.render()
            const delta = clock.getDelta()
            if (self.actionManager) {
                self.actionManager.update(delta)
                if(self.actionManager.keyState['KeyW']){
                    const deltaPos = self.config.speed.clone().multiplyScalar(delta);
                    self.playerObject.position.add(deltaPos);//更新玩家角色的位置
                }
                if(self.actionManager.keyState['KeyS']){
                    const deltaPos = self.config.speed.clone().multiplyScalar(-delta);
                    self.playerObject.position.add(deltaPos);//更新玩家角色的位置
                }
                if(self.actionManager.keyState['KeyA']){
                    const deltaPos = self.config.speed2.clone().multiplyScalar(delta);
                    self.playerObject.position.add(deltaPos);//更新玩家角色的位置
                }
                if(self.actionManager.keyState['KeyD']){
                    const deltaPos = self.config.speed2.clone().multiplyScalar(-delta);
                    self.playerObject.position.add(deltaPos);//更新玩家角色的位置
                }
            }
    
        }
        animate()
    }
}

const mainApp = () => {
    var space = new Space()

    space.init()
 //   space.addControls()
    space.addGridHelper()

    const environment = new RoomEnvironment()
    const pmremGenerator = new THREE.PMREMGenerator(space.renderer)
    space.scene.environment = pmremGenerator.fromScene(environment).texture

    space.camera.position.set(0, 6, 18)
    

    var actionManager = null

    var groundHeight=19.8;

    var lootAt={
        y:5,
        z:0
    }

    function getForwardVector() {
        var playerDirection=new THREE.Vector3();
        space.camera.getWorldDirection( playerDirection );
        playerDirection.y = 0;
        playerDirection.normalize();
        return playerDirection;

    }

    space.load('RobotExpressive.glb').then((gltf) => {
        var player=gltf.scene;
        player.position.y=groundHeight
        //space.addVec3Gui(player.position, '相机位置', () => {})
        space.add(player)
        var dir=new THREE.Vector3()
        gltf.scene.getWorldDirection(dir);
        console.log('dir', dir);
        actionManager = new ActionManager(gltf)
        actionManager.bind('KeyW,KeyS,KeyA,KeyD', 'Walking', { loop: THREE.LoopRepeat})
        actionManager.bind('KeyJ', 'Jump', { loop: THREE.LoopOnce, notAllowStop: true })

        player.add(space.camera)
        space.camera.position.set(0, 5, -5.5);
        space.camera.lookAt(0,24, 0);

        // console.log(space.getBox(player))


        function updateCamera(){
            space.camera.updateProjectionMatrix();
        }

        const cameraHelper = new THREE.CameraHelper(space.camera);
        space.add(cameraHelper);
        space.addVec3Gui(space.camera.position, '相机位置', () => {})
        console.log(space.camera.far)
        // space.gui.add(space.camera, 'far').onChange(updateCamera);
        // space.gui.add(space.camera, 'near').onChange(updateCamera);
        // space.gui.add(space.camera, 'fov').onChange(updateCamera);
        space.gui.add(lootAt, 'y').onChange(d=>{
            space.camera.lookAt(0, lootAt.y,lootAt.z );
        });
        space.gui.add(lootAt, 'z').onChange(d=>{
            space.camera.lookAt(0, lootAt.y,lootAt.z );
        });
    })

    space.load('town3f_partially_complete.glb').then((gltf) => {
        var player=gltf.scene;
        //space.center(player)
        space.add(player)
    })

    // space.addPickHelper((mesh) => {
    //     space.createHighLight([mesh])
    // })


    

    var clock = new THREE.Clock()

    function animate() {
        requestAnimationFrame(animate)
        space.render()
 //       space.controls.update();
        const deltaTime = clock.getDelta()
        if (actionManager) {
            actionManager.update(deltaTime)
            if(actionManager.keyState['KeyW']){
                console.log('w')
               
            }
        }

    }
    animate()
}
//mainApp()


function initApp(){
    var game=new GameManager()
}

initApp()

export default initApp

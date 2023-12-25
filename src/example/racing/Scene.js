import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { Space,PickHelper } from '../../core/main'
import { EventEmitter } from 'events';
import EventDispatcher from './utils/EventDispatcher';

import ConnonCollision from './utils/CannonCollision';


var GUI_Params={
    cameraLook:{
        x:0,
        y:0,
        z:0
    }
}

export default class Scene extends EventDispatcher{

    constructor(){
        super()

        const space=new Space()
        space.init();
        space.addControls()
        space.addDirectionalLight()
        // /** 基于环境贴图*/
        const environment = new RoomEnvironment()
        const pmremGenerator = new THREE.PMREMGenerator(space.renderer)
        space.scene.environment = pmremGenerator.fromScene(environment).texture

        // /**相机初始位置 */
        space.camera.position.set(0, 280, 100)

        this.space=space;
        this.loadSceneModel();

    }

    async loadSceneModel(){
        const model= await this.space.load('fps_game.glb');
        const sceneModel=model.scene
        sceneModel.traverse(item=>{
            if(item.isMesh){
                var body=ConnonCollision.create(item,ConnonCollision.TYPES.TRIMESH,{type:CANNON.BODY_TYPES.STATIC})
                body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
                this.emit('add-body',body)
            }
        })
        this.space.add(sceneModel)

        this.loadPlayerModel();
    }

    async loadPlayerModel(){
        const gltf = await this.space.load('racing/boxman.glb');
        var playerModel = gltf.scene

        // playerModel.add(this.space.camera)

        // this.space.camera.position.set(4,5,0);
        // this.space.camera.lookAt(0,0, 0);

        const playerBody=ConnonCollision.create(playerModel,ConnonCollision.TYPES.SHPERE,{mass:50,position:new CANNON.Vec3(0,80,0)})

        let mat = new CANNON.Material('capsuleMat');
		mat.friction = 0.0;

        playerBody.material = mat;
        playerBody.fixedRotation = true;

        playerBody.mesh=playerModel

        this.emit('add-body',playerBody)

        //playerBody.position.copy(playerModel.position)

        this.space.add(playerModel)

        //\ this.space.addVec3Gui(model.scene.position, '平行光目标位置',updateLight)
        // this.space.addVec3Gui(this.space.camera.position, '相机位置')
        // this.space.addVec3Gui(GUI_Params.cameraLook, '相机目标',(value)=>{
        //     this.space.camera.lookAt(GUI_Params.cameraLook.x,GUI_Params.cameraLook.y,GUI_Params.cameraLook.z);
        // })

    }

    getScene(){
        return this.space.scene
    }

    update(){
        this.space.render()
    }

}
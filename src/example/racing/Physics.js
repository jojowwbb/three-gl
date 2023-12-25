import * as CANNON from 'cannon-es'
import CannonDebugger from 'cannon-es-debugger'
import { EventEmitter } from 'events';

import EventDispatcher from './utils/EventDispatcher';

export default class Physics extends EventDispatcher{

    constructor(){
        super();
        
        this.world = new CANNON.World()
        this.world.broadphase = new CANNON.SAPBroadphase(this.world)
        this.world.gravity.set(0, -9.81, 0)
        this.world.allowSleep=true


        this.world.defaultContactMaterial.contactEquationStiffness = 1e9
        this.world.defaultContactMaterial.contactEquationRelaxation = 4

        const solver = new CANNON.GSSolver()
        solver.iterations = 7
        solver.tolerance = 0.1
        this.world.solver = new CANNON.SplitSolver(solver)

        const physicsMaterial = new CANNON.Material('physics')
        const physics_physics = new CANNON.ContactMaterial(physicsMaterial, physicsMaterial, {
          friction: 0.0,
          restitution: 0.3,
        })
        this.world.addContactMaterial(physics_physics)


        this.cannonDebugger = null;

        this.on('add-body',(body)=>{
            this.world.addBody(body)
        })

    }

    add(body){
        this.world.addBody(body)
    }

    update(){
        this.world.step(1/60)
        if(this.cannonDebugger){
            this.cannonDebugger.update()
        }
    }

    enableCannonDebugger(scene){
        this.cannonDebugger = new CannonDebugger(scene, this.world)
    }
}
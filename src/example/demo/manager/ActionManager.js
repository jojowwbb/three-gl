import * as THREE from 'three'

export default class ActionManager {
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

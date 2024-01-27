import * as THREE from 'three'

class KeyActionEvent {
    data = []
    constructor(keyCodes, actionParams) {
        this.data = keyCodes.map((keyCode) => {
            return {
                code: keyCode.replace('CTRL', '').replace('SHIFT', '').replace('ALT', '').replace('+', ''),
                actionParams: actionParams,
                action: actionName,
                ctrl: keyCode.indexOf('CTRL') > -1,
                shift: keyCode.indexOf('SHIFT') > -1,
                alt: keyCode.indexOf('ALT') > -1
            }
        })
    }
    match(e) {
        var event = this.data.find((item) => {
            if (item.code == e.code && item.ctrl == e.ctrl && item.shift == e.shift && item.alt == e.alt) {
                return true
            }
            return false
        })
        return event
    }
}

class Action {}

/**
 * 模型动画管理器
 */
export default class ModelAnimation {
    //动画播放器
    mixer = null

    action = null

    keyEventQueue = []

    keyBind = {}

    constructor(model, animations = []) {
        this.action = new Map()
        this.mixer = new THREE.AnimationMixer(model)
        this.initEvent()
    }

    initAction(animations) {
        animations.map((clip) => {
            this.actions.set(clip.name, this.mixer.clipAction(clip))
        })
    }
    initEvent() {
        //document.addEventListener('keydown', ({ code }) => {})

        document.addEventListener('keyup', (e) => {
            this.keyEvents.map((item) => {
                var event = item.match(e)
                if (event) {
                    this.play(event)
                }
            })
        })
    }

    getAction() {}

    bindKey(keyCodes, actionName, actionParams) {
        keyCodes.map((keyCode) => {
            this.keyEvents.push(new KeyActionEvent(keyCode, actionName))
        })
    }

    handleActionEvent(keyActionEvent) {
        var action = this.actions.get(keyActionEvent.action)
        action.play()
    }

    play(actionName, actionParams) {}

    stop() {}

    pause() {}
    update(delta) {
        this.mixer.update(delta)
    }
}

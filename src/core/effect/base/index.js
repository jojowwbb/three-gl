export default class BaseEffect {
    constructor(name) {
        this.name = name
        this.props = null
        this.material = null
        this.geomtery = null
        this.mesh = null
    }
    setPosition(position) {
        this.mesh.position.set(position.x, position.y, position.z)
    }
    setProps() {
        this.props = props
    }
    remove() {
        this.mesh.remove()
        this.mesh.removeFromParent()
        this.mesh.geometry.dispose()
        this.mesh.material.dispose()
    }
}

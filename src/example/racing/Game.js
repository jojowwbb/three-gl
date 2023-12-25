import Scene from "./Scene"
import Physics from "./Physics"

class Game {
    constructor(){
        
        this.physics=new Physics();
        this.scene=new Scene();

        this.physics.enableCannonDebugger(this.scene.getScene())

        this.render();
    }


    updatePlayerPosition(){
        this.physics.world.bodies.map(item=>{
            if(item.mesh){
                item.mesh.position.copy(item.position)
            }
        })
    }

    render(){
        var game=this;

        function animate(){
            requestAnimationFrame(animate)

            game.physics.update()
            game.scene.update()
            game.updatePlayerPosition()
           
        }
        animate()
    }
}

const mainApp = () => {
    new Game();
}

mainApp()

export default mainApp
import * as THREE from 'three'
import gcoord from 'gcoord'

import { GeoGeomtry, Player, PickHelper } from '../../core/main.js'

function getWorldCenterPosition(box,scalar = 0.5){
    return new THREE.Vector3().addVectors(box.max, box.min).multiplyScalar(scalar);
  }
function setExpandModel(modelObject){
// 初始化爆炸数据保存到每个mesh的userdata上
  if (!modelObject) return;

  // 计算模型中心
  const explodeBox = new THREE.Box3();
  explodeBox.setFromObject(modelObject);
  const explodeCenter = getWorldCenterPosition(explodeBox);
  const meshBox = new THREE.Box3();
  modelObject.traverse(function (value) {
    if (value.isMark || value.isMarkChild || value.isLine || value.isSprite) return;
    if (value.isMesh) {
      meshBox.setFromObject(value);

      const meshCenter = getWorldCenterPosition(meshBox);
      // 爆炸方向
      value.userData.worldDir = new THREE.Vector3()
        .subVectors(meshCenter, explodeCenter)
        .normalize();
      // 爆炸距离 mesh中心点到爆炸中心点的距离
      value.userData.worldDistance = new THREE.Vector3().subVectors(meshCenter, explodeCenter);
      // 原始坐标
      value.userData.originPosition = value.getWorldPosition(new THREE.Vector3());
      // mesh中心点
      value.userData.meshCenter = meshCenter.clone();
      value.userData.explodeCenter = explodeCenter.clone();
    }
  });
};

function expandModel(model,scalar){
    model.traverse(function (value) {
        if (!value.isMesh || !value.userData.originPosition) return;
        const distance = value.userData.worldDir
          .clone()
          .multiplyScalar(value.userData.worldDistance.length() * scalar);
        const offset = new THREE.Vector3().subVectors(
          value.userData.meshCenter,
          value.userData.originPosition
        );
        const center = value.userData.explodeCenter;
        const newPos = new THREE.Vector3().copy(center).add(distance).sub(offset);
        const localPosition = value.parent?.worldToLocal(newPos.clone());
        localPosition && value.position.copy(localPosition);
      });
}



/**
 * 场景效果
 */
function senceDemo(player) {
    var urls = ['front', 'back', 'top', 'down', 'right', 'left']
    player.addSkyBackground(
        urls.map((item) => {
            return `./assets/background/sky/bak0/${item}.jpg`
        })
    )
}

function demo(player) {
    //const loader = new THREE.TextureLoader().setPath('./assets/model/gltf/free_1975_porsche_911_930_turbo/textures/')
    player.loadGLTF('./assets/model/car/scene.gltf', (model) => {
        model.traverse((item) => {
            if (item.isMesh) {
                item.material.emissive = item.material.color
                item.material.emissiveMap = item.material.map
            }
        })
        player.add(model)
        setExpandModel(model)
        var obj={
            x:1
        }
        player.gui
                    .add(obj, 'x')
                    .onChange((v) => {
                        expandModel(model,v)
                    })
      //  player.epxandModel(model,2)
    })
}

function demo2(player) {
    //const loader = new THREE.TextureLoader().setPath('./assets/model/gltf/free_1975_porsche_911_930_turbo/textures/')
    player.loadGLTF('./assets/model/ccity-building-set-1/ccity_building_set_1.glb', (model) => {
        model.traverse((item) => {
            if (item.isMesh) {
                // obj.material.emissive=new THREE.Color(1,1,1);
                //     obj.material.emissiveIntensity=1;
                //     obj.material.emissiveMap=obj.material.map;

                item.material.emissive = new THREE.Color(1,1,1);
                item.material.emissiveMap = item.material.map
            }
        })

        player.add(model)

        player.epxandModel(model)
    })
}

const mainApp = () => {
    var player = new Player({
        grid: false
    })

    player.camera.position.set(0,0,30)
    senceDemo(player)
    demo(player)

    const color = 0xffffff
    const intensity = 1
    const light = new THREE.DirectionalLight(color, intensity)
    light.position.set(0, 10, 0)
    light.target.position.set(-5, 0, 0)
    player.add(light)
    player.add(light.target)

   

    // var pickHelper = new PickHelper()
    // // 监听鼠标的位置
    // window.addEventListener('click', (event) => {
    //     const mouse = new THREE.Vector2()
    //     mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    //     mouse.y = -((event.clientY / window.innerHeight) * 2 - 1)
    //     pickHelper.pick(mouse, player.scene, player.camera)
    // })

    //实时渲染
    function animate() {
        requestAnimationFrame(animate)
        player.render()
    }
    animate()
}

mainApp()

export default mainApp

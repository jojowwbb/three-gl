import * as THREE from 'three'
import gsap from 'gsap'
import ShaderManager from './ShaderManager.js'


/**
 * 获取mesh（物体）高度差
 * @param {*} mesh
 * @returns
 */
export function getAltitudeDiffrence(mesh) {
    mesh.geometry.computeBoundingBox()
    let { min, max } = mesh.geometry.boundingBox
    return max.y - min.y
}

/**
 * 获取mesh（物体）高度差
 * @param {*} mesh
 * @returns
 */
export function getAltitudeDiffrence2(mesh) {
    mesh.geometry.computeBoundingBox()
    let { min, max } = mesh.geometry.boundingBox
    return max.z - min.z
}


/**
 * 添加公共属性
 * @param {*} manager
 */
export function appendCommonShader(manager) {
    manager.mergeVertex(ShaderManager.ATTRIBUTE, 'varying vec3 vPosition;')
    manager.mergeVertex(ShaderManager.FUNCTION, 'vPosition=position;')
    manager.mergeFragment(ShaderManager.ATTRIBUTE, 'varying vec3 vPosition;')
}

/**
 * 添加扫描圆特效
 * @param {*} shader
 */
export function appendDiffusionShader(manager) {
    manager.setUniforms('uSpreadCircleCenter', new THREE.Vector3(0, 0, 0))
    manager.setUniforms('uSpreadCircleWidth', 0.008)
    manager.setUniforms('uSpreadTime', 0)
    manager.setUniforms('uCircleColor', new THREE.Vector3(1, 1, 1))

    manager.mergeFragment(
        ShaderManager.ATTRIBUTE,
        `
            uniform float uSpreadTime;
            uniform vec3 uSpreadCircleCenter;
            uniform float uSpreadCircleWidth;
            uniform vec3 uCircleColor;
        `
    )
    manager.mergeFragment(
        ShaderManager.FUNCTION,
        `
            float len =  distance(vPosition,uSpreadCircleCenter);
            float index = -(len-uSpreadTime)*(len-uSpreadTime)+uSpreadCircleWidth;
            if(index>0.0){
                gl_FragColor = mix(gl_FragColor,vec4(uCircleColor,1.0),len);
            }
        `
    )

    gsap.to(manager.shader.uniforms.uSpreadTime, {
        value: 30,
        duration: 1,
        ease: 'none',
        repeat: -1
    })
}


/**
 * 科技感效果
 * @param {*} manager
 * @param {*} mesh
 */
export function appendTopColorShader(manager, mesh) {
    var height = getAltitudeDiffrence(mesh)
    manager.setUniforms('uHeight', height)
    manager.setUniforms('uBaseColor', new THREE.Color(0x135CE0))
    manager.mergeFragment(
        ShaderManager.ATTRIBUTE,
        `
            uniform float uHeight;
            uniform vec3 uBaseColor;
        `
    )
    manager.mergeFragment(
        ShaderManager.FUNCTION,
        `
            float rate = (vPosition.y + uHeight/2.0 - 2.0) / uHeight;
            vec3 distColor = mix(uBaseColor.xyz,vec3(0.1844749944900301, 0.07227185067438519, 0.6938717612856897),rate);
            gl_FragColor=vec4(distColor,1.0);
        `
    )
    
}

/**
 * 添加从下到上的扫描效果
 * @param {*} manager
 */
export function appendTopLineShader(manager) {
    manager.setUniforms('uTopLineWidth', 0.001)
    manager.setUniforms('uTopLineTime', 0)

    manager.mergeFragment(
        ShaderManager.ATTRIBUTE,
        `
            uniform float uTopLineTime;
            uniform float uTopLineWidth;
        `
    )
    manager.mergeFragment(
        ShaderManager.FUNCTION,
        `
            float toTopindex = -(vPosition.y-uTopLineTime)*(vPosition.y-uTopLineTime)+uTopLineWidth;
            if(toTopindex>0.0){
                gl_FragColor = mix(gl_FragColor,vec4(1,1,1,1),toTopindex/uTopLineWidth);
            }
        `
    )

    gsap.to(manager.shader.uniforms.uTopLineTime, {
        value: 3,
        duration: 5,
        ease: 'none',
        repeat: -1
    })
}



import { getAltitudeDiffrence } from '../../../core/shader/index.js'

import frafmentStr from './TechnologyCityShader/fragment.glsl'
import vertexStr from './TechnologyCityShader/vertex.glsl'

import gsap from 'gsap'

export function TechnologyCity(mesh) {
    var height = getAltitudeDiffrence(mesh)
    var material = new THREE.ShaderMaterial({
        uniforms: {
            uSpreadCircleCenter: {
                value: new THREE.Vector3(0, 0, 0)
            },
            uSpreadCircleWidth: {
                value: 0.008
            },
            uSpreadTime: {
                value: 0
            },
            uCircleColor: {
                value: new THREE.Vector3(1, 1, 1)
            },
            uHeight: {
                value: height
            },
            uBaseColor: {
                value: new THREE.Color(0x1f1c5f)
            },
            uTopLineWidth: {
                value: 0.002
            },
            uTopLineTime: {
                value: 0
            }
        },
        vertexShader: vertexStr,
        fragmentShader: frafmentStr
    })
    gsap.to(material.uniforms.uSpreadTime, {
        value: 30,
        duration: 1,
        ease: 'none',
        repeat: -1
    })

    gsap.to(material.uniforms.uTopLineTime, {
        value: 3,
        duration: 5,
        ease: 'none',
        repeat: -1
    })
    return material
}

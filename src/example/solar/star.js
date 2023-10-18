import * as THREE from 'three'

const params = {
    count: 50000,
    size: 0.09,
    radius: 1000,
    branches: 3,
    spin: 3,
    randomness: 0.69,
    randomPower: 2,
    insideColor: '#ff6030',
    outsideColor: '#1b3984'
}
let geometry = null
let points = null
let pointsMaterial = null
let positions = null
let colors = null
let generateGalaxy = () => {
    if (points != null) {
        geometry.dispose()
        pointsMaterial.dispose()
        scene.remove(points)
    }
    geometry = new THREE.BufferGeometry()
    positions = new Float32Array(params.count * 3)
    colors = new Float32Array(params.count * 3)
    const insideColor = new THREE.Color(params.insideColor)
    const outsideColor = new THREE.Color(params.outsideColor)
    for (let i = 0; i < params.count; i++) {
        const i3 = i * 3
        const radius = Math.random() * params.radius
        const spinAngle = radius * params.spin
        const branchAngle = ((i % params.branches) / params.branches) * Math.PI * 2
        const randomX = Math.pow(Math.random(), params.randomPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness
        const randomY = Math.pow(Math.random(), params.randomPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness
        const randomZ = Math.pow(Math.random(), params.randomPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness
        positions[i3] = Math.sin(branchAngle + spinAngle) * radius + randomX
        positions[i3 + 1] = 0 + randomY
        positions[i3 + 2] = Math.cos(branchAngle + spinAngle) * radius + randomZ
        const mixedColor = insideColor.clone()
        mixedColor.lerp(outsideColor, radius / params.radius)
        colors[i3] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    pointsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: params.size,
        depthWrite: true,
        vertexColors: true,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending
    })
    points = new THREE.Points(geometry, pointsMaterial)
    return points
}

export default generateGalaxy

// varying vec2 vUv;
// varying vec3 vNormal;
// varying vec3 vViewNoraml;
// varying float vRimRate;

precision highp float;

// modelMatrix 模型对象矩阵

// viewMatrix 相机位置、方向矩阵

// modelViewMatrix  == modelMatrix * viewMatrix

// normalMatrix modelViewMatrix的逆转置

// projectionMatrix 相机投影矩阵

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
    vec3 p = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);

    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vWorldPosition = vec3(modelMatrix * vec4(p, 1));
}
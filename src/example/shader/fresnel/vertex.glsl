varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
    vec3 p = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
    vUv = uv;
    vNormal = normal;
    vWorldPosition = vec3(modelMatrix * vec4(p, 1));
}
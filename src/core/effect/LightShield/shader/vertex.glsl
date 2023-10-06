varying vec2 vUv;
varying float vRim;
varying float vGlow;
varying float vDepth;


precision highp float;

void main() {
    vUv = uv;
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    vec4 viewPosition = modelViewMatrix * vec4(position, 1.);

    vec3 n = normalMatrix * normal;
    vec3 eye = normalize(-viewPosition.xyz);
    vGlow = 1.0 - abs(dot(eye, n));
    vRim = pow(vGlow, 5.);
    vDepth = gl_Position.z;

}

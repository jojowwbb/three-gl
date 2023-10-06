varying vec2 vUv;
varying vec3 vNoraml;
varying float vRimRate;

precision highp float;

void main() {

    vUv = uv;

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    vec4 viewPosition = modelViewMatrix * vec4(position, 1.);

   vNoraml = normalMatrix * normal;
    vec3 eyeDir = normalize(-viewPosition.xyz);
    //顶点法线和相机的夹角因子
    vRimRate = 1.0 - abs(dot(eyeDir, vNoraml));
}

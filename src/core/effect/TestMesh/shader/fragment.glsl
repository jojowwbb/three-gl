varying vec2 vUv;
uniform float uTime;
uniform vec3 uColor;

//抗锯齿处理
float aastep(float threshold, float value) {
    float afwidth = 0.7 * length(vec2(dFdx(value), dFdy(value)));
    return smoothstep(threshold - afwidth, threshold + afwidth, value);
}

void main() {
    vec2 uv = vUv;
    uv *= 2.0;
    uv = fract(uv);
    float dist = length(uv - vec2(0.5));
    gl_FragColor=vec4(dist,0,0,1.0);
}
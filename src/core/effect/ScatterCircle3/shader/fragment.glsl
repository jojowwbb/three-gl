varying vec2 vUv;
uniform float uTime;
uniform vec3 uColor;

//抗锯齿处理
float aastep(float threshold, float value) {
    float afwidth = 0.7 * length(vec2(dFdx(value), dFdy(value)));
    return smoothstep(threshold - afwidth, threshold + afwidth, value);
}

void main() {
    float dist = fract((length(vUv - vec2(0.5)) / 0.707 - uTime * 0.3) * 3.0);
    float radius = 0.5;
    vec3 color = vec3(aastep(radius, dist));
    gl_FragColor = vec4(color * uColor, step(0.1, color.x));
}
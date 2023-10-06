varying vec2 vUv;
uniform float uTime;
uniform vec3 uColor;

vec4 drawCircle(vec2 pos, float radius, float width, float power, vec4 color) {
    float dist1 = distance(pos, vec2(0.5));
    dist1 = fract((dist1 * 4.0) - fract(uTime));
    float dist2 = dist1 - radius;
    float intensity = pow(radius / abs(dist2), width);
    vec3 col = color.rgb * intensity * power * max((0.8 - abs(dist2)), 0.0);
    return vec4(col, 1.0);
}

vec4 drawCircle2(vec2 pos) {
    float dist1 = distance(pos, vec2(0.5));
    dist1 = fract((dist1 * 4.0) - fract(uTime));
    return vec4(uColor, dist1);
}

void main() {
    vec2 pos = vUv;
   // float h = mix(0.5, 0.65, length(pos));
    float radius = 0.5;
    float width = 0.8;
    float power = 0.1;
    //vec4 finalColor = drawCircle(pos, radius, width, power, vec4(uColor,1.0));
    vec4 finalColor = drawCircle2(pos);
    gl_FragColor = finalColor;
    if(gl_FragColor.x == 0.0) {
        gl_FragColor = vec4(0, 0, 0, 0);
    }

}
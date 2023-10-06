varying vec2 vUv;
uniform float uTime;
uniform vec3 uColor;
varying vec3 vPosition;

#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359

vec3 color = vec3(1.0, 0.0, 0.0);

float radius = 0.42;

float d2y(float d) {
    return 1. / (0.2 + d);
}

float fct(vec2 p, float r) {
    float a = 3. * mod(-atan(p.y, -p.x) + time, 2. * PI);
    float scan = 0.0;
    return (d2y(a) + scan) * (1.0 - smoothstep(0.3, radius, r));
}

float circle(vec2 p, float r) {
    float d = distance(r, radius);
    return d2y(100. * d);
}

float grid(vec2 p, float y) {
    float a = 7.;
    float res = 30.;
    float e = 0.9;
    vec2 pi = fract(p * res);
    pi = step(e, pi);
    return a * y * pi.x * pi.y;
}

void main(void) {
    vec2 position = vec2(vPosition.xy);
    vec2 uv = position;
    position /= cos(.125 * length(position));
    float y = 0.0;

    float dc = length(position);

    y += fct(position, dc);
    y += circle(position, dc);
    y += grid(position, y);
    float d = smoothstep(0.01, 0.003, length(vec2(uv.x - 0.2, uv.y - 0.1)));
    y += d * max(sin(uTime + 3.72) * 5.0, 0.0);
    d = smoothstep(0.01, 0.003, length(vec2(uv.x + 0.1, uv.y - 0.2)));
    y += d * max(sin(uTime + 5.3) * 5.0, 0.0);
    y = pow(y, 1.75);
    gl_FragColor = vec4(sqrt(y) * color, 1.0);
}
`
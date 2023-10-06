varying vec2 vUv;
uniform float uTime;
uniform vec3 uColor;

#define green vec3(0.0,.3,0.6)

vec3 RadarPing(
    in vec2 uv,
    in vec2 center,
    in float innerTail,
    in float frontierBorder,
    in float timeResetSeconds,
    in float radarPingSpeed,
    in float fadeDistance,
    float t
) {
    vec2 diff = center - uv;
    float r = length(diff);
    float time = mod(t, timeResetSeconds) * radarPingSpeed;

    float circle;
    circle += smoothstep(time - innerTail, time, r) * smoothstep(time + frontierBorder, time, r);
    circle *= smoothstep(fadeDistance, 0.0, r); // fade to 0 after fadeDistance

    return vec3(circle);
}

void main() {
    vec3 color;
    float fadeDistance = 0.8;
    float resetTimeSec = 3.0;
    float radarPingSpeed = 0.2;
    vec2 greenPing = vec2(0.5, 0.5);
    color += RadarPing(vUv, greenPing, 0.1, 0.0005, resetTimeSec, radarPingSpeed, fadeDistance, uTime) * uColor;
    color += RadarPing(vUv, greenPing, 0.1, 0.0005, resetTimeSec, radarPingSpeed, fadeDistance, uTime + 1.)  * uColor;
    color += RadarPing(vUv, greenPing, 0.1, 0.0005, resetTimeSec, radarPingSpeed, fadeDistance, uTime + 2.)  * uColor;
	gl_FragColor = vec4(color,step(0.1,color.y));
}
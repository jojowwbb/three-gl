//

varying vec2 vUv;
uniform float uTime;
uniform vec3 uColor;

#define PI 3.1415926
#define TWOPI = 6.2831853

float circle(float radius, vec2 center, vec2 uv) {
    vec2 rect = vec2(100.0, 100.0);
    float d = distance(center, uv);
    return 1.0 - smoothstep(radius - 1. / rect.y, radius + 1. / rect.y, d);
}

vec2 angleRadius(vec2 uv) {
    float anglePixel = atan(uv.y, uv.x);
    float lengthPixel = length(uv);
    return vec2(anglePixel, lengthPixel);
}

float filterPositive(float n) {
    return smoothstep(0.0, 0.005, n);
}

void main() {
    vec2 uv = vUv-vec2(0.5);

    float radius = 0.5;
    float ringThick = 0.5;

    vec2 stPolar = angleRadius(uv);

    float sPolar = stPolar.x * 3.0 + uTime * 10.0;
    float cosSPolarTemp = cos(sPolar);
    float cosSPolar = filterPositive(cosSPolarTemp);

    vec3 color = vec3(cosSPolar);

    float inCircleAA = smoothstep(radius, radius + 0.005, angleRadius(uv).y); //AA version
    float smallCircleAA = smoothstep(radius - ringThick, radius - ringThick + 0.005, angleRadius(uv).y); //AA version
    vec3 col = 1.0 - vec3(inCircleAA);
    vec3 col_2 = 1.0 - vec3(smallCircleAA);
    vec3 colorGap = col - col_2;
    vec3 finalColor = color * colorGap;
    vec3 colorMask = vec3(10, 1.5, 1.0);
    finalColor /= 10.0;
    finalColor *= colorMask;

    float centerCircleAA = smoothstep(0.1, 0.1 + 0.005, angleRadius(uv).y); //AA version
    vec3 centerCircleColor = 1.0 - vec3(centerCircleAA);
    centerCircleColor /= 10.0;
    centerCircleColor *= colorMask;

    vec2 centerC = vec2(0.0, 0.0);
    float bubbleRadius = abs(sin(uTime * 3.0)) / 3.0;
    float bubbleCircleColor = circle(bubbleRadius, centerC, uv);
    vec4 bubbleColor = vec4(vec3(bubbleCircleColor) / 10.0 * colorMask, 1.0);

    gl_FragColor = vec4(finalColor + centerCircleColor, 0.0);
    gl_FragColor += bubbleColor;
    if(gl_FragColor.x==0.0){
        gl_FragColor = vec4(0,0,0,0);
    }

}
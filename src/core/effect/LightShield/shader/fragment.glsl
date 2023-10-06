varying vec2 vUv;

varying float vDepth;
varying float vRim;
varying float vGlow;


uniform vec3 uColor;
uniform float uTime;

uniform sampler2D uDepthBuffer;
uniform sampler2D uTexture;

const float UnpackDownscale = 255. / 256.; 

const vec3 PackFactors = vec3(256. * 256. * 256., 256. * 256., 256.);
const vec4 UnpackFactors = UnpackDownscale / vec4(PackFactors, 1.);

float unpackRGBAToDepth(const in vec4 v) {
    return dot(v, UnpackFactors);
}

void main() {
    vec4 color = vec4(uColor,1.0);
    vec2 uv = vUv;

    uv.x += uTime * 0.25;
    uv.y += uTime * 0.1;

    vec4 mask = texture(uTexture, uv);
    mask.a = mask.r;
    
    vec2 uv2= gl_FragCoord.xy / vec2(1.0);
    vec4 packedDepth = texture(uDepthBuffer, uv2);
    float sceneDepth = unpackRGBAToDepth(packedDepth);
    float depth = (vDepth - .1) / (10.0 - .1);
    float diff = abs(depth - sceneDepth);
    float contact = diff * 20.;
    contact = 1. - contact;
    contact = max(contact, 0.);
    contact = pow(contact, 20.);
    contact *= diff * 1000.;
    float a = max(contact, vRim);
    float fade = 1. - pow(vRim, 10.);
    color += a * fade;
    gl_FragColor = mix(mask,color,vGlow);
}

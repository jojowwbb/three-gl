varying vec2 vUv;
varying float vRimRate;
uniform sampler2D uBaseTexture;
uniform float uTime;
uniform vec3 uColor;

void main() {
      vec2 uv = vUv;
      uv.x += uTime * 0.1;
      uv.y += uTime * 0.08;
      vec4 textureColor = texture2D(uBaseTexture, uv);
      gl_FragColor = mix(textureColor * vec4(uColor, 0.5), vec4(1.0, 1.0, 1.0, 1.0), pow(vRimRate, 5.0));
}

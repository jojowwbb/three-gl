//选择上升

varying vec2 vUv;
uniform float uTime;

#define PI 3.141592653589
#define TWO_PI 6.28318530718

float rand(float x) {
      return fract(sin(x * 1.14529) * 43758.5453123);
}

vec3 light_point(vec2 xy, vec2 center, vec3 color, float strength, float threshold) {
      vec3 clr = vec3(0.0);
      float l = length(xy - center);
      clr += (strength / l) * smoothstep(0.0, threshold, strength / l);
      return clr * color;
}

void main() {
      vec2 uv = vUv;
      vec2 center = vec2(0.5);
      vec3 color = vec3(.0);
      const int count = 150;

      float t = 12. +  uTime * .25;
      for(int i = 0; i < count; i++) {
            float j = rand(float(i));
            vec3 rgb_color = vec3(0.7, 0.2 + 0.2 * sin(uTime), .1 + j);
            vec3 new_c = light_point(uv, center + vec2(0.5  * sin(j + 1. + 2. * t * j), +.45 * sin(j * .75 * PI + PI + t)), rgb_color, 0.0025, .8 - .2 * (1. - (1. - uv.y) * uv.y));

            color += new_c;
      }

      gl_FragColor = vec4(mix(vec3(color), vec3(1.0, 0, 0), 0.2), 1.0);
}

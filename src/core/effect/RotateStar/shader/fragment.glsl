varying vec2 vUv;
uniform float uTime;
uniform vec3 uColor;

#define green vec3(0.0,.3,0.6)

#define PI 3.1415926535897932384626433832795
#define TAU 6.2831853071795864769252867665590


vec2 rotate(vec2 st, float a) {
    st = mat2(cos(a),-sin(a),
              sin(a),cos(a))*(st-.5);
    return st+.5;
}

float circleSDF(vec2 st) {
    return length(st-.5)*2.;
}

//抗锯齿处理
float aastep(float threshold, float value) {
    float afwidth = 0.7 * length(vec2(dFdx(value), dFdy(value)));
    return smoothstep(threshold-afwidth, threshold+afwidth, value);
}

float stroke(float x, float size, float w) {
    float d = aastep(size, x+w*.5) - aastep(size, x-w*.5);
    return clamp(d, 0., 1.);
}


float starSDF(vec2 st, int V, float s) {
    st = st*4.-2.;
    float a = atan(st.y, st.x)/TAU;
    float seg = a * float(V);
    a = ((floor(seg) + 0.5)/float(V) + 
        mix(s,-s,step(.5,fract(seg)))) 
        * TAU;
    return abs(dot(vec2(cos(a),sin(a)),
                   st));
}
void main() {
    vec3 color = vec3(0.);
    vec2 st = vUv;
    st = (st-.5)*1.1912+.5;
    st=rotate(st,sin(uTime)*PI);
    //START
    color += stroke(circleSDF(st),.8,.05);
    st.y = 1.-st.y;
    float s = starSDF(st.yx, 5, .1);
    color *= step(.7, s);
    color += stroke(s,.4,.1);
    //END
    gl_FragColor = vec4(color*uColor,1.);
    
}
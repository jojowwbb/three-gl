varying vec3 vPosition;
uniform vec3 uColor;
uniform float uHeight;
uniform float uTime;
uniform float uTopLineWidth;
varying vec2 vUv;

// 随机函数
float random (vec2 st) {
    return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);
}

void main(){
    float op = 1.0-vUv.y;
    if(vUv.y<=0.5){
        gl_FragColor=vec4(0,0,0,0); 
    }else{

        float r=step(0.6,random(vUv));
        gl_FragColor =vec4(uColor,op*r+0.1);

        float toTopindex = -(vPosition.y+uTime)*(vPosition.y+uTime)+uTopLineWidth;
        if(toTopindex>0.0){
            gl_FragColor = mix(gl_FragColor,vec4(uColor,.8),toTopindex/uTopLineWidth);
        }
    }
}
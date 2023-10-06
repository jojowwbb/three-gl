varying vec3 vPosition;
uniform vec3 uColor;
uniform float uHeight;
uniform float uTime;
varying vec2 vUv;

void main(){

    //float op = (vPosition.y+uHeight/4.0)/uHeight;
    float op = 1.0-vUv.y; // 1 - 0
    float strength = step(0.5, mod(vUv.x * 40.0 , 1.0)) ;
    strength *= step(0.5, mod((uTime/10.0+vUv.y) * 40.0 , 1.0)) ;
    strength *= op;
    if(strength <= 0.0){
        gl_FragColor=vec4(0.0);
    }else{
         vec3 baseColor=mix(uColor,vec3(strength),0.8);
    	gl_FragColor =vec4(uColor,strength);
    }
}
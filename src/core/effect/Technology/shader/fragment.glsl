uniform float uSpreadTime;
uniform vec3 uSpreadCircleCenter;
uniform float uSpreadCircleWidth;
uniform vec3 uCircleColor;

varying vec3 vPosition;

uniform float uHeight;
uniform vec3 uBaseColor;
uniform vec2 vUv;

uniform float uTopLineTime;
uniform float uTopLineWidth;



void main(){


    float rate = (vPosition.y + uHeight/2.0) / uHeight;
    vec3 distColor = mix(uBaseColor.xyz,vec3(1.0, 1.0, 1.0),rate);
    gl_FragColor=vec4(distColor,1.0);

    float len =  distance(vPosition,uSpreadCircleCenter);
    float index = -(len-uSpreadTime)*(len-uSpreadTime)+uSpreadCircleWidth;
    if(index>0.0){
        gl_FragColor = mix(gl_FragColor,vec4(uCircleColor,1.0),len);
    }
    
    float toTopindex = -(vPosition.y-uTopLineTime)*(vPosition.y-uTopLineTime)+uTopLineWidth;
    if(toTopindex>0.0){
        gl_FragColor = mix(gl_FragColor,vec4(1,1,1,1),toTopindex/uTopLineWidth);
    }

}
varying vec3 vPosition;
varying vec2 vUv;
uniform float uTime;

void main(){
    // vec3 scalePosition = vec3(position.x+uTime,position.y,position.z+uTime);
    vec4 viewPosition = viewMatrix * modelMatrix * vec4(position,1);
    gl_Position = projectionMatrix *  viewPosition;
    vUv=uv;
    vPosition = position;
    
}
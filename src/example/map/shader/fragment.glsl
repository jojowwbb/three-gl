varying vec2 vUv;
uniform float uTime;
uniform vec3 uColor;

vec3 drawCircle(vec2 pos, float radius, float width, float power, vec4 color)
{
    float dist1 = distance(pos,vec2(0.5));
    dist1 = fract((dist1 * 4.0) - fract(uTime));
	float dist2 = dist1 - radius;
	float intensity = pow(radius / abs(dist2), width); 
	vec3 col = color.rgb * intensity * power * max((0.8- abs(dist2)), 0.0);
    return col;
}

vec4 drawCircle2(vec2 pos, float radius, float width, float power, vec4 color)
{
    float dist1 = distance(pos,vec2(0.5));
    dist1 = fract((dist1 * 4.0) - fract(uTime));
	// float dist2 = dist1 - radius;
	// float intensity = pow(radius / abs(dist2), width); 
	// vec3 col = color.rgb * intensity * power * max((0.8- abs(dist2)), 0.0);
    return vec4(uColor,dist1);
}




void main() {
    vec2 pos = vUv;
    
   // float h = mix(0.5, 0.65, length(pos));
    vec4 color = vec4(1.0, 1.0, 1.0, 1.0);
    float radius = 0.6;
    float width =0.5;
    float power = 0.2;
   // vec3 finalColor = drawCircle(pos, radius, width, power, color);
	vec4 finalColor = drawCircle2(pos, radius, width, power, color);
    gl_FragColor=finalColor;
    //pos = abs(pos);
    // vec3 finalColor = vec3(pos.x, 0.0, pos.y);

    //gl_FragColor = vec4(finalColor,1.0);
}
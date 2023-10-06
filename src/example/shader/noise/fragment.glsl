varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;

uniform samplerCube iChannel0;

float fresnel(float bias, float scale, float power, vec3 I, vec3 N) {
      return bias + scale * pow(1. - dot(I, N), power);
}

void main() {
      vec2 uv = vUv;

      vec3 col = vec3(0.);
      vec3 objectColor = vec3(1.);
      vec3 lightColor = vec3(.875, .286, .333);

    // ambient
      float ambIntensity = .2;
      vec3 ambient = lightColor * ambIntensity;
      col += ambient * objectColor;

    // diffuse
      vec3 lightPos = vec3(10., 10., 10.);
      vec3 lightDir = normalize(lightPos - vWorldPosition);
      float diff = dot(vNormal, lightDir);
      diff = max(diff, 0.);
      vec3 diffuse = lightColor * diff;
      col += diffuse * objectColor;

    // specular
      vec3 reflectDir = reflect(-lightDir, vNormal);
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    // float spec=dot(viewDir,reflectDir);
      vec3 halfVec = normalize(lightDir + viewDir);
      float spec = dot(vNormal, halfVec);
      spec = max(spec, 0.);
      float shininess = 32.;
      spec = pow(spec, shininess);
      vec3 specular = lightColor * spec;
      col += specular * objectColor;

    // IBL
      float iblIntensity = .2;
      vec3 iblCoord = normalize(reflect(-viewDir, vNormal));
      vec3 ibl = vec3(1.0, 0, 0);
      vec3 iblLight = ibl * iblIntensity;
      col += iblLight * objectColor;

    // fresnel
      vec3 fresColor = vec3(1.);
      float fresIntensity = .6;
      float fres = fresnel(0., 1., 5., viewDir, vNormal);
      vec3 fresLight = fres * fresColor * fresIntensity;
      col += fresLight * objectColor;

      gl_FragColor = vec4(col, 1.);
}
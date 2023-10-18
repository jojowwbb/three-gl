import { ShaderMaterial, UniformsUtils, Color,UniformsLib } from 'three'

var defaultVertxtShader = `
#define PHONG

varying vec3 vViewPosition;
varying vec2 uvPosition;
#ifdef USE_MESH_POSITION
varying vec3 meshPosition;
#endif

#ifdef USE_SURFACE_NORMAL
    varying vec3 surfaceNormal;
#endif

#ifdef USE_EXPANSION
uniform float expansionStrength;
#endif

#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {
    #ifdef USE_MESH_POSITION
    meshPosition = position;
    #endif
    uvPosition = uv;

    #include <uv_vertex>
    #include <color_vertex>
    
    #include <beginnormal_vertex>
    #include <morphnormal_vertex>
    #include <skinbase_vertex>
    #include <skinnormal_vertex>
    #include <defaultnormal_vertex>
    #ifdef USE_SURFACE_NORMAL
      surfaceNormal = normalize( transformedNormal );
    #endif
    #include <normal_vertex>
    
    #include <begin_vertex>
    
    #ifdef USE_EXPANSION
      transformed += normal * expansionStrength;
    #endif
    
    #include <morphtarget_vertex>
    #include <skinning_vertex>
    #include <displacementmap_vertex>
    #include <project_vertex>
    #include <logdepthbuf_vertex>
    #include <clipping_planes_vertex>
    
    vViewPosition = - mvPosition.xyz;

    #include <worldpos_vertex>
    #include <envmap_vertex>
    #include <shadowmap_vertex>
    #include <fog_vertex>
}
`
var defaultFragmentShader = `
#define PHONG

uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
uniform bool hasAlphaMap;
uniform sampler2D alphaMap;
varying vec2 uvPosition;
#ifdef USE_SURFACE_NORMAL
    varying vec3 surfaceNormal;
#endif
uniform vec3 rimColor;
uniform float rimStrength;
uniform float rimPow;

uniform vec3 insideColor;
uniform float insideStrength;
uniform float insidePow;

#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
// #include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
    #include <clipping_planes_fragment>
  
    vec4 diffuseColor = vec4( diffuse, opacity );
    ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
    vec3 totalEmissiveRadiance = emissive;
    
    #include <logdepthbuf_fragment>
    vec2 mapUV = uvPosition;
    #include <map_fragment>
    
    vec3 viewDir = normalize(vViewPosition);    
    
    float rimGlow = 1.0 - max(0.0, dot(surfaceNormal, viewDir));
    rimGlow = pow( rimGlow, rimPow);
    diffuseColor.rgb += rimColor * rimGlow * rimStrength;

    float insideGlow = max(0.0, dot(surfaceNormal, viewDir));
    insideGlow = pow( insideGlow, insidePow);
    diffuseColor.rgb += insideColor * insideGlow * insideStrength;

    #include <color_fragment>
    // if( hasAlphaMap ){
    //     diffuseColor.a *= texture2D( alphaMap, mapUV ).g;
    //   }
    
    // #include <alphamap_fragment>
    #include <alphatest_fragment>
    #include <specularmap_fragment>
    #include <normal_fragment_begin>
    #include <normal_fragment_maps>
    #include <emissivemap_fragment>
    // accumulation
    #include <lights_phong_fragment>
    #include <lights_fragment_begin>
    #include <lights_fragment_maps>
    #include <lights_fragment_end>
    // modulation
    #include <aomap_fragment>
    vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
    #include <envmap_fragment>
    #ifdef USE_LIGHT
      gl_FragColor = vec4( outgoingLight, diffuseColor.a );
    #else
      gl_FragColor = diffuseColor;
    #endif
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
    #include <premultiplied_alpha_fragment>
    #include <dithering_fragment>
}
`

export class BaseShaderMaterial extends ShaderMaterial {
    constructor(vertexShader, fragmentShader, shaderMaterialParams) {
        super(shaderMaterialParams)

        vertexShader ??= defaultVertxtShader
        fragmentShader ??= defaultFragmentShader

        this.vertexShader = vertexShader
        this.fragmentShader = fragmentShader

        this.initUniforms()
        this.initDefines()
    }

    basicUnifrom() {
        return UniformsUtils.merge([
            UniformsLib.common,
            UniformsLib.specularmap,
            UniformsLib.envmap,
            UniformsLib.aomap,
            UniformsLib.lightmap,
            UniformsLib.emissivemap,
            UniformsLib.bumpmap,
            UniformsLib.normalmap,
            UniformsLib.displacementmap,
            UniformsLib.gradientmap,
            UniformsLib.fog,
            UniformsLib.lights,
            {
                emissive: { value: new Color(0x000000) },
                specular: { value: new Color(0x111111) },
                shininess: { value: 30 },
                hasAlphaMap: { value: false }
            }
        ])
    }

    initUniforms() {
        this.uniforms = UniformsUtils.merge([
            this.basicUnifrom(),
            {
                rimColor: { value: new Color(1.0, 0.0,0.0) },
                rimStrength: { value: 1.0 },
                rimPow: { value: 1.0 },
                insideColor: { value: new Color(0.0,1.0,0.0) },
                insideStrength: { value: 1.0 },
                insidePow: { value: 1.0 }
            }
        ])
        console.log(this.uniforms)
    }

    initDefines() {
        this.defines = Object.assign({}, this.defines, {
            USE_SURFACE_NORMAL: true,
            USE_LIGHT: true
        })
        console.log(this.defines)
    }
}

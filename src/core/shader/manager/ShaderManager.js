/**
 * shader 管理器
 * 用于修改、追加shader
 */
export default class ShaderManager {
    static ATTRIBUTE = 'attribute'
    static FUNCTION = 'function'

    constructor(shader) {
        this.shader = shader
        this.initShaderFormat();
    }

    setUniforms(key, value) {
        this.shader.uniforms[key] = {
            value: value
        }
    }

    initShaderFormat() {
        this.shader.fragmentShader = this.shader.fragmentShader.replace(
            '#include <dithering_fragment>',
            `
                #include <dithering_fragment>
                //#end#
            `
        )
    }

    mergeVertex(type, shader) {
        if (type == ShaderFactory.ATTRIBUTE) {
            this.shader.vertexShader = this.shader.vertexShader.replace(
                '#include <common>',
                `
                    #include <common>
                    ${shader}
                `
            )
        }
        if (type == ShaderFactory.FUNCTION) {
            this.shader.vertexShader = this.shader.vertexShader.replace(
                '#include <begin_vertex>',
                `
                    #include <begin_vertex>
                    ${shader}
                `
            )
        }
    }
    mergeFragment(type, shader) {
        if (type == ShaderFactory.ATTRIBUTE) {
            this.shader.fragmentShader = this.shader.fragmentShader.replace(
                '#include <common>',
                `
                    #include <common>
                    ${shader}
                `
            )
        }
        if (type == ShaderFactory.FUNCTION) {
            this.shader.fragmentShader = this.shader.fragmentShader.replace(
                '//#end#',
                `
                   ${shader}
                    //#end#
                `
            )
        }
    }
}

var triangle_instanced_vertex_shader_source = `
    // This shader is not working!!!
    attribute vec3 aVertexPosition;
    attribute vec4 aVertexColour;
    attribute vec3 aVertexNormal;
    attribute vec2 aVertexTexture;
    attribute vec3 instancePosition;
    attribute float instanceSize;
    attribute mat4 instanceOrientation;

    uniform mat4 uMVMatrix;
    uniform mat4 uMVINVMatrix;
    uniform mat4 uPMatrix;

    varying lowp vec4 vColor;
    varying lowp vec3 vNormal;
    varying lowp vec2 vTexture;
    varying mediump mat4 mvInvMatrix;
    varying lowp vec3 v;

    varying lowp vec4 eyePos;

    void main(void) {

      vec4 theVert = vec4(instancePosition+aVertexPosition,1.0);

      gl_Position = uPMatrix * uMVMatrix * theVert;
      vColor = aVertexColour;
      vNormal = aVertexNormal;
      eyePos = uMVMatrix * theVert;
      mvInvMatrix = uMVINVMatrix;
      v = vec3(uMVMatrix * theVert);

      vTexture = aVertexTexture;
    }
`;

export {triangle_instanced_vertex_shader_source};

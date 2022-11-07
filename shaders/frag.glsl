#version 300 es
// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default
precision mediump float;

uniform vec3 u_color;

out vec4 outColor;

void main() {
  // gl_FragColor is a special variable a fragment shader
  // is responsible for setting
  outColor = vec4(u_color, 1); // return reddish-purple
}
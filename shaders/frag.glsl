#version 300 es

precision mediump float;

in vec2 v_texcoord;

uniform vec3 u_color;
uniform sampler2D u_texture;

out vec4 outColor;

void main() {
  outColor = texture(u_texture, v_texcoord) * vec4(u_color, 1);
}
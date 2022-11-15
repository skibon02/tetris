#version 300 es

precision mediump float;

in vec2 v_texcoord;

uniform vec4 u_color;
uniform sampler2D u_texture;

out vec4 outColor;

void main() {
  vec4 texColor = texture(u_texture, v_texcoord);
  if(texColor.a < 0.1)
    discard;
  outColor = texColor * u_color;
}
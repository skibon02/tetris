#version 300 es

precision mediump float;

in vec2 v_position;

uniform sampler2D u_texture;
uniform mat3 u_world;

uniform vec4 u_shapecol;
uniform vec4 u_bgcol;
uniform vec4 u_wavescol;

uniform float u_time;

out vec4 outColor;

void main() {
  //draw top waves
  vec2 pos = v_position;
  float edge = sin(pos.x * 20.0 + u_time) * 0.01 + 0.01;
  if (v_position.y < edge) {
    outColor = u_wavescol;
    return;
  }

  edge = sin(pos.x * 13.0 + u_time) * 0.01 + 0.01;
    if (v_position.y < edge) {
    outColor = u_wavescol * 0.7;
    return;
  }

  //draw bg shapes
  float alpha = 0.7;
  float splits = 15.0;

  vec2 position_splitted = v_position*splits;
  ivec2 chessboard = ivec2(position_splitted);
  vec2 position_in_chessboard = (position_splitted - vec2(chessboard)) * 2.0 - 1.0;

  if(chessboard.x % 2 == chessboard.y % 2) {
    outColor = texture(u_texture, (u_world * vec3(position_in_chessboard, 1.0) + 1.0).xy/2.0) * u_shapecol;
  } 
  else {
    outColor = u_bgcol;
  }
}
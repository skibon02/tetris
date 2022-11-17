#version 300 es

precision mediump float;

in vec2 v_position;

uniform sampler2D u_texture;
uniform mat3 u_world;

uniform vec4 u_shapecol1;
uniform vec4 u_bgcol1;
uniform vec4 u_wavescol1;

uniform vec4 u_shapecol2;
uniform vec4 u_bgcol2;
uniform vec4 u_wavescol2;

uniform float u_translationRadius;

uniform float u_time;

out vec4 outColor;

void main() {
  vec2 clippos = v_position * 2.0 - 1.0;
  float distancetocenter = length(clippos);


  vec4 u_shapecol = step(distancetocenter, u_translationRadius) * u_shapecol1 + (1.0 - step(distancetocenter, u_translationRadius)) * u_shapecol2;
  vec4 u_bgcol = step(distancetocenter, u_translationRadius) * u_bgcol1 + (1.0 - step(distancetocenter, u_translationRadius)) * u_bgcol2;
  vec4 u_wavescol = step(distancetocenter, u_translationRadius) * u_wavescol1 + (1.0 - step(distancetocenter, u_translationRadius)) * u_wavescol2;


  //draw top waves
  float edge = sin(v_position.x * 20.0 + u_time) * 0.01 + 0.01;
  if (v_position.y < edge) {
    outColor = u_wavescol;
    return;
  }

  edge = sin(v_position.x * 13.0 + u_time) * 0.01 + 0.01;
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
    vec2 pos_in_texture = (u_world * vec3(position_in_chessboard, 1.0) + 1.0).xy/2.0;
    if(texture(u_texture, pos_in_texture).a > 0.5)
      outColor = texture(u_texture, pos_in_texture) * u_shapecol;
    else
      outColor = u_bgcol;
  } 
  else {
    outColor = u_bgcol;
  }
}
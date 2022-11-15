#version 300 es

precision mediump float;

in vec2 v_position;

out vec4 outColor;

void main() {

  float alpha = 0.7;
  float splits = 8.0;

  ivec2 chessboard = ivec2(floor(v_position*splits));
  if(chessboard.x % 2 == chessboard.y % 2) {
    outColor = vec4(v_position/7.0, 1.0/7.0, alpha);
  } else {
    outColor = vec4((1.0 - v_position)/7.0, 0.0, alpha);
  }
}
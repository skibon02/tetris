#version 300 es

in vec2 a_position;

uniform vec2 u_resolution;

out vec2 v_position;

void main() {
    vec2 clipSpace = a_position / u_resolution * 2.0 - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0.0, 1.0);
    v_position = a_position / u_resolution.xx;
}
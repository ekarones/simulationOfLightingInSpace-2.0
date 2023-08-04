#version 300 es

precision highp float;

in vec2 v_texcoord;
in vec3 v_normal;
in vec3 v_color;

out vec4 color;

uniform sampler2D diffuseMap;
uniform vec3 u_lightColor;
uniform vec3 u_ambientStrength;

void main() {
	float ambientStrength = 0.1;
	vec3 ambient = u_ambientStrength * u_lightColor;
	color = texture(diffuseMap, v_texcoord) * vec4(ambient, 1.0);
}
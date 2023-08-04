#version 300 es

precision highp float;

in vec2 v_texcoord;
in vec3 v_normal;

out vec4 color;

uniform sampler2D diffuseMap;
uniform vec3 u_lightColor;
uniform vec3 u_lightDir;
void main() {
	float ambientStrength = 0.1;
	vec3 ambient = ambientStrength * u_lightColor;	
	//difusa
	vec3 norm = normalize(v_normal);
	vec3 lightDir = u_lightDir;
	vec3 objectColorDir = normalize(lightDir);
	float diff = max(dot(norm, objectColorDir), 0.0);
	vec3 diffuse = diff * u_lightColor;
	
	vec4 result = vec4(ambient + diffuse,1.0) ;
	color = texture(diffuseMap,v_texcoord) * result;
}
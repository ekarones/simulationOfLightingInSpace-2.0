#version 300 es

precision highp float;

in vec3 v_position;
in vec2 v_texcoord;
in vec3 v_normal;

out vec4 color;

uniform sampler2D diffuseMap;
uniform sampler2D specularMap;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;

uniform vec3 u_ambientLight; // ambient light
uniform vec3 u_ambientColor;
uniform vec3 u_lightPosition;
uniform vec3 u_viewPosition; // camera position
uniform vec3 u_diffuseColor;
void main() {
	vec3 normal = normalize(v_normal);
	vec4 mapColor = texture(diffuseMap, v_texcoord);
	// vec4 mapSpec = texture(specularMap, v_texcoord);
	vec3 lightDir = normalize(u_lightPosition - v_position);
	// ambient light
	vec3 ambientLight = u_ambientLight * u_ambientColor * mapColor.rgb;

	// diffuse light
	float diffuseFactor = max(dot(normal, lightDir), 0.0);
	vec3 diffuseLight = diffuseFactor * u_diffuseColor * mapColor.rgb;

	// specular
	vec3 viewDir = normalize(u_viewPosition - v_position);
	vec3 reflectDir = reflect(-lightDir, normal);
	// float specularFactor = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
	// vec3 specularLight = specularFactor * specular * mapSpec.rgb;

	vec3 result = ambientLight+diffuseLight;
	color = vec4(result, opacity);
}
precision mediump float;
uniform sampler2D uMainSampler;
uniform vec2 aspectRatio;
varying vec2 outTexCoord;
uniform float time;

uniform vec2 light1;

float rand(vec2 co){
  return 1.0;//fract(sin(dot(co.xy ,vec2(12.9898,time))) * 43758.5453);
}


vec4 point(vec2 uv){
	return texture2D(uMainSampler, uv);
}

vec4 glow(vec2 uv, vec2 pos, vec3 color){
	float light =  0.2/length(uv - pos);
	light = min(light*smoothstep(0.5, 1.0, light), 0.75);
	return vec4(light*color, 1.0);
}

vec4 light(vec2 uv, vec2 pos, vec3 color){
	float light =  smoothstep(0.015, 0.005, length(uv - pos));
	return vec4(light*color, 1.0);
}



void main(void) {
	vec2 uv = outTexCoord/aspectRatio;

	float a = 0.01;
	float b = 2.0;
	vec2 off = vec2(0.2*a*sin(5.0*b*time), a*sin(b*time));
	
	gl_FragColor = point(uv);
	gl_FragColor *= glow(uv + off, light1, vec3(1.0, 1.0, 1.0));
	gl_FragColor += light(uv + off, light1, vec3(1.0, 1.0, 1.0));
	
	//gl_FragColor = point(uv);
	
}



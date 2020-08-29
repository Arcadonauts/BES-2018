
precision mediump float;
uniform sampler2D uMainSampler;
varying vec2 outTexCoord;
uniform float px;
uniform float py;
uniform float mx;
uniform float my;
uniform float time;
uniform vec2 resolution;

float constrain(float x, float mi, float ma){
	return max(mi, min(ma, x));
}

void main(void) {
	vec4 color = texture2D(uMainSampler, outTexCoord);
	vec2 uv = outTexCoord;
	uv.x /= mx/my;
	
	vec2 fire = vec2(mx, my);
	
	float t = 2.0 - time/500.0;
	
	float spotlight = t - distance(uv, fire);
	spotlight = constrain(spotlight, 0.0, 1.0);

	color *= spotlight;
	
	
	gl_FragColor = color;
}
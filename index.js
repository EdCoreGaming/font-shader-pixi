
// async function loadCustomFont() {
//     try {
//         const response = await fetch('ffont.woff');
//         const arrayBuffer = await response.arrayBuffer();

//         const font = opentype.parse(arrayBuffer);

//         if (font.supported) {
//             console.log('Font successfully loaded and supported!');
            
//             const myFont = font;
            
//             return myFont;
//         } else {
//             console.error('Font is not supported.');
//         }
//     } catch (err) {
//         console.error('Error loading the font:', err);
//     }
// }

// async function createFont() {
//     const font = await loadCustomFont(); 

//     if (font) {
//         var blob = new Blob([font.toArrayBuffer()], { type: 'font/woff' });
//         var url = URL.createObjectURL(blob);

//         var fontFace = new FontFace('LoadedFont', `url(${url})`);
//         document.fonts.add(fontFace);
//         document.body.style.fontFamily = '"LoadedFont"';
//         console.log("Font has been loaded");
//     } else {
//         console.log('Font could not be loaded.');
//     }
//     return font;
// }

// function drawString(ctx, text, font, x, y, fontSize) {
//     let xOffset = x;
    
//     for (let i = 0; i < text.length; i++) {
//         let glyph = font.charToGlyph(text[i]);
//         let path = glyph.getPath(xOffset, y, fontSize);
//         path.draw(ctx);
//         xOffset += glyph.advanceWidth * (fontSize / font.unitsPerEm);
//     }
// }

// function getGlyphGeometry(glyph, fontSize, unitsPerEm) {
//     const scale = fontSize;
//     const path = glyph.getPath(0, 0, fontSize);

//     const positions = [];
//     path.commands.forEach(cmd => {
//         if (cmd.type === 'M') {
//             // MoveTo command (starting a new subpath)
//             positions.push(cmd.x * scale, cmd.y * scale);
//         } else if (cmd.type === 'L') {
//             // LineTo command
//             positions.push(cmd.x * scale, cmd.y * scale);
//         } else if (cmd.type === 'Q') {
//             // Quadratic CurveTo command
//             // We should add points along the curve for accuracy
//             positions.push(cmd.x * scale, cmd.y * scale);
//         } else if (cmd.type === 'C') {
//             // Cubic CurveTo command
//             // We should add points along the curve for accuracy
//             positions.push(cmd.x * scale, cmd.y * scale);
//         }
//     });

//     return positions;
// }

// function getGlyphTriangles(glyph, fontSize, unitsPerEm) {
//     const scale = fontSize;
//     const path = glyph.getPath(0, 0, fontSize);

//     const positions = [];
//     const holes = [];
//     let startIndex = 0;

//     path.commands.forEach(cmd => {
//         if (cmd.type === 'M') { 
//             if (positions.length > 0) {
//                 holes.push(positions.length / 2);
//             }
//             positions.push(cmd.x * scale, cmd.y * scale);
//         } else if (cmd.type === 'L') { 
//             positions.push(cmd.x * scale, cmd.y * scale);
//         } else if (cmd.type === 'Q') { 
//             const cp1x = cmd.x1 * scale;
//             const cp1y = cmd.y1 * scale;
//             const endx = cmd.x * scale;
//             const endy = cmd.y * scale;
//             for (let t = 0; t <= 1; t += 0.1) {
//                 const x = (1 - t) * (1 - t) * positions[positions.length - 2] + 2 * (1 - t) * t * cp1x + t * t * endx;
//                 const y = (1 - t) * (1 - t) * positions[positions.length - 1] + 2 * (1 - t) * t * cp1y + t * t * endy;
//                 positions.push(x, y);
//             }
//         } else if (cmd.type === 'C') { 
//             const cp1x = cmd.x1 * scale;
//             const cp1y = cmd.y1 * scale;
//             const cp2x = cmd.x2 * scale;
//             const cp2y = cmd.y2 * scale;
//             const endx = cmd.x * scale;
//             const endy = cmd.y * scale;
//             for (let t = 0; t <= 1; t += 0.1) {
//                 const x = Math.pow(1 - t, 3) * positions[positions.length - 2] + 3 * Math.pow(1 - t, 2) * t * cp1x + 3 * (1 - t) * t * t * cp2x + t * t * t * endx;
//                 const y = Math.pow(1 - t, 3) * positions[positions.length - 1] + 3 * Math.pow(1 - t, 2) * t * cp1y + 3 * (1 - t) * t * t * cp2y + t * t * t * endy;
//                 positions.push(x, y);
//             }
//         } else if (cmd.type === 'Z') { 
//             positions.push(positions[startIndex], positions[startIndex + 1]);
//         }
//     });

//     const indices = earcut(positions, holes, 2);
//     return { positions, indices };
// }

// function createLetter(text, font) {
//     const glyph = font.charToGlyph(text);
//     const { positions, indices } = getGlyphTriangles(glyph, 50, font.unitsPerEm);
    
//     const geometry = new PIXI.Geometry({
//         attributes: {
//             aPosition: positions,
//         },
//        indexBuffer: indices,
//     });

//     return geometry;
// }


class TextMeshCreator {
    constructor(fontUrl, text, fontSize = 50) {
        this.fontUrl = fontUrl;
        this.text = text;
        this.fontSize = fontSize;
        this.font = null;
        this.meshes = [];
    }

    async loadFont() {
        const response = await fetch(this.fontUrl);
        const arrayBuffer = await response.arrayBuffer();
        const font = opentype.parse(arrayBuffer);

        if (font.supported) {
            console.log('Font successfully loaded and supported!');
            this.font = font;
            return this.font;
        } else {
            console.error('Font is not supported.');
        }
        
    }

    async createFont() {
        const font = await this.loadFont();

        if (font) {
            const blob = new Blob([font.toArrayBuffer()], { type: 'font/woff' });
            const url = URL.createObjectURL(blob);

            const fontFace = new FontFace('LoadedFont', `url(${url})`);
            await fontFace.load();
            document.fonts.add(fontFace);
            console.log("Font has been loaded");

            return font;
        } else {
            console.log('Font could not be loaded.');
            return null;
        }
    }

    getGlyphTriangles(glyph, fontSize) {
        const scale = fontSize;
        const path = glyph.getPath(0, 0, fontSize);

        const positions = [];
        const holes = [];
        let startIndex = 0;

        path.commands.forEach(cmd => {
            if (cmd.type === 'M') {
                if (positions.length > 0) {
                    holes.push(positions.length / 2);
                }
                positions.push(cmd.x * scale, cmd.y * scale);
                startIndex = positions.length - 2;
            } else if (cmd.type === 'L') {
                positions.push(cmd.x * scale, cmd.y * scale);
            } else if (cmd.type === 'Q') {
                const cp1x = cmd.x1 * scale;
                const cp1y = cmd.y1 * scale;
                const endx = cmd.x * scale;
                const endy = cmd.y * scale;
                for (let t = 0; t <= 1; t += 0.1) {
                    const x = (1 - t) * (1 - t) * positions[positions.length - 2] + 2 * (1 - t) * t * cp1x + t * t * endx;
                    const y = (1 - t) * (1 - t) * positions[positions.length - 1] + 2 * (1 - t) * t * cp1y + t * t * endy;
                    positions.push(x, y);
                }
            } else if (cmd.type === 'C') {
                const cp1x = cmd.x1 * scale;
                const cp1y = cmd.y1 * scale;
                const cp2x = cmd.x2 * scale;
                const cp2y = cmd.y2 * scale;
                const endx = cmd.x * scale;
                const endy = cmd.y * scale;
                for (let t = 0; t <= 1; t += 0.1) {
                    const x = Math.pow(1 - t, 3) * positions[positions.length - 2] + 3 * Math.pow(1 - t, 2) * t * cp1x + 3 * (1 - t) * t * t * cp2x + t * t * t * endx;
                    const y = Math.pow(1 - t, 3) * positions[positions.length - 1] + 3 * Math.pow(1 - t, 2) * t * cp1y + 3 * (1 - t) * t * t * cp2y + t * t * t * endy;
                    positions.push(x, y);
                }
            } else if (cmd.type === 'Z') {
                positions.push(positions[startIndex], positions[startIndex + 1]);
            }
        });

        const indices = earcut(positions, holes, 2);
        return { positions, indices };
    }

    createLetter(text, font) {
        const glyph = font.charToGlyph(text);
        const { positions, indices } = this.getGlyphTriangles(glyph, this.fontSize);

        const geometry = new PIXI.Geometry({
            attributes: {
                aPosition: positions,
            },
            indexBuffer: indices,
        });

        return geometry;
    }

    async generateMeshes() {
        await this.createFont();

        if (this.font) {
            const vertex = `
// code copied from here https://www.shadertoy.com/view/XcS3zK Created by liamegan
#version 300 es
in vec2 aPosition;

uniform mat3 uProjectionMatrix;
uniform mat3 uWorldTransformMatrix;

uniform mat3 uTransformMatrix;

void main() {

    mat3 mvp = uProjectionMatrix * uWorldTransformMatrix * uTransformMatrix;
    gl_Position = vec4((mvp * vec3(aPosition, 1.0)).xy, 0.0, 1.0);
}
`;

const fragment = `
// code copied from here https://www.shadertoy.com/view/XcS3zK Created by liamegan
#version 300 es
#define HW_PERFORMANCE 1
uniform vec3      iResolution;
uniform float     iTime;
uniform float     iChannelTime[4];
uniform vec4      iMouse;
uniform vec4      iDate;
uniform float     iSampleRate;
uniform vec3      iChannelResolution[4];
uniform int       iFrame;
uniform float     iTimeDelta;
uniform float     iFrameRate;
uniform sampler2D iChannel0;
uniform struct {
sampler2D sampler;
vec3  size;
float time;
int   loaded;
}
iCh0;
uniform sampler2D iChannel1;
uniform struct {
sampler2D sampler;
vec3  size;
float time;
int   loaded;
}
iCh1;
uniform sampler2D iChannel2;
uniform struct {
sampler2D sampler;
vec3  size;
float time;
int   loaded;
}
iCh2;
uniform sampler2D iChannel3;
uniform struct {
sampler2D sampler;
vec3  size;
float time;
int   loaded;
}
iCh3;
void mainImage( out vec4 c, in vec2 f );
void st_assert( bool cond );
void st_assert( bool cond, int v );
out vec4 shadertoy_out_color;
void st_assert( bool cond, int v ) {
if(!cond) {
if(v == 0)shadertoy_out_color.x = -1.0;
else if(v == 1)shadertoy_out_color.y = -1.0;
else if(v == 2)shadertoy_out_color.z = -1.0;
else shadertoy_out_color.w = -1.0;
}

}
void st_assert( bool cond        ) {
if(!cond)shadertoy_out_color.x = -1.0;
}
void main( void ) {
shadertoy_out_color = vec4(1.0, 1.0, 1.0, 1.0);
vec4 color = vec4(1e20);
mainImage( color, gl_FragCoord.xy );
if(shadertoy_out_color.x<0.0) color = vec4(1.0, 0.0, 0.0, 1.0);
if(shadertoy_out_color.y<0.0) color = vec4(0.0, 1.0, 0.0, 1.0);
if(shadertoy_out_color.z<0.0) color = vec4(0.0, 0.0, 1.0, 1.0);
if(shadertoy_out_color.w<0.0) color = vec4(1.0, 1.0, 0.0, 1.0);
shadertoy_out_color = vec4(color.xyz, 1.0);
}
/* Shading constants */
/* --------------------- */
const vec3 LP = vec3(-0.6, 0.7, -0.3);  // light position

const vec3 LC = vec3(.85, 0.80, 0.70);    // light colour

const vec3 HC1 = vec3(.5, .4, .3);      // hemisphere light colour 1

const vec3 HC2 = vec3(0.1, .1, .6)*.5;    // hemisphere light colour 2

const vec3 HLD = vec3(0, 1, 0);           // hemisphere light direction

const vec3 BC = vec3(0.25, 0.25, 0.25);   // back light colour

const vec3 FC = vec3(1.30, 1.20, 1.00);   // fresnel colour

const float AS = .5;                    // ambient light strength

const float DS = 1.;                    // diffuse light strength

const float BS = .3;                    // back light strength

const float FS = .3;                    // fresnel strength

/* Raymarching constants */
/* --------------------- */
const float MAX_TRACE_DISTANCE = 10.;             // max trace distance

const float INTERSECTION_PRECISION = 0.0001;       // precision of the intersection

const int NUM_OF_TRACE_STEPS = 64;               // max number of trace steps

const float STEP_MULTIPLIER = 1.;                 // the step mutliplier - ie, how much further to progress on each step


/* Structures */
/* ---------- */
struct Camera {
vec3 ro;
vec3 rd;
vec3 forward;
vec3 right;
vec3 up;
float FOV;
};
struct Surface {
float len;
vec3 position;
vec3 colour;
float id;
float steps;
float AO;
};
struct Model {
float dist;
vec3 colour;
float id;
};
/* Utilities */
/* ---------- */
vec2 toScreenspace(in vec2 p) {
vec2 uv = (p - 0.5 * iResolution.xy) / min(iResolution.y, iResolution.x);
return uv;
}
mat2 R(float a) {
float c = cos(a);
float s = sin(a);
return mat2(c, -s, s, c);
}
Camera getCamera(in vec2 uv, in vec3 pos, in vec3 target) {
vec3 f = normalize(target - pos);
vec3 r = normalize(vec3(f.z, 0., -f.x));
vec3 u = normalize(cross(f, r));
float FOV = 1.+cos(iTime*.1)*.8;
return Camera(
pos, normalize(f + FOV * uv.x * r + FOV * uv.y * u), f, r, u, FOV
);
}
//--------------------------------
// Modelling
//--------------------------------
float G( vec3 p ) {
return dot(sin(p.yzx), cos(p.zxy));
}
Model model(vec3 p) {
float t = iTime*.1;
p.xz *= R(t);
p.xy *= R(.3);
p.xy -= .5;
float d = abs(-(length(vec2(p.y, length(p.xz)-2.))-1.8+cos(t)*.3));

// x variability

//float gs = 3.+p.x;
//float g = G(p.yxz*gs)/max(4., gs);
// mixing on the y
//float g = mix(g, abs(g)-.4, cos(p.y*2.));
// regular
float g = G(p.yxz*4.)/4.;
d = length(vec2(d, g))-.3;
vec3 colour = vec3(g);
return Model(d, colour, 1.);
}
Model map( vec3 p ) {
return model(p);
}
/* Modelling utilities */
/* ---------- */
// I *think* I borrowed this from Shane, but probably orginally comes from IQ. 
// Calculates the normal by taking a very small distance, // remapping the function, and getting normal for that
vec3 calcNormal( in vec3 pos ) {
vec3 eps = vec3( 0.001, 0.0, 0.0 );
vec3 nor = vec3(
map(pos+eps.xyy).dist - map(pos-eps.xyy).dist, map(pos+eps.yxy).dist - map(pos-eps.yxy).dist, map(pos+eps.yyx).dist - map(pos-eps.yyx).dist );
return normalize(nor);
}
//--------------------------------
// Raymarcher
//--------------------------------
Surface march( in Camera cam ) {
float h = 1e4; // local distance

float d = 0.; // ray depth

float id = -1.; // surace id

float s = 0.; // number of steps

float ao = 0.; // march space AO. Simple weighted accumulator. Not really AO, but ¯\_(ツ)_/¯

vec3 p; // ray position

vec3 c; // surface colour


for( int i = 0; i< NUM_OF_TRACE_STEPS ; i++ ) {
if( abs(h) < INTERSECTION_PRECISION || d > MAX_TRACE_DISTANCE ) break;
p = cam.ro+cam.rd*d;
Model m = map( p );
h = m.dist;
d += h * STEP_MULTIPLIER;
id = m.id;
s += 1.;
ao += max(h, 0.);
c = m.colour;
}
if( d >= MAX_TRACE_DISTANCE ) id = -1.0;
return Surface( d, p, c, id, s, ao );
}
//--------------------------------
// Shading
//--------------------------------
/*
* Soft shadows and AO curtesy of Inigo Quilez
* https://iquilezles.org/articles/rmshadows
*/
float softshadow( in vec3 ro, in vec3 rd, in float mint, in float tmax ) {
float res = 1.0;
float t = mint;
for( int i = 0; i<16; i++ ) {
float h = map( ro + rd*t ).dist;
res = min( res, 8.0*h/t );
t += clamp( h, 0.02, 0.10 );
if( h<0.001 || t>tmax ) break;
}
return clamp( res, 0.0, 1.0 );
}
float AO( in vec3 pos, in vec3 nor ) {
float occ = 0.0;
float sca = 1.0;
for( int i = 0; i<5; i++ ) {
float hr = 0.01 + 0.12*float(i)/4.0;
vec3 aopos = nor * hr + pos;
float dd = map( aopos ).dist;
occ += -(dd-hr)*sca;
sca *= 0.95;
}
return clamp( 1.0 - 3.0*occ, 0.0, 1.0 );
}
vec3 shade(vec3 col, vec3 pos, vec3 nor, vec3 ref, Camera cam) {
vec3 plp = LP - pos; // point light


float o = AO( pos, nor );                 // Ambient occlusion

vec3  l = normalize( plp );                    // light direction


float d = clamp( dot( nor, l ), 0.0, 1.0 )*DS;   // diffuse component

float b = clamp( dot( nor, normalize(vec3(-l.x, 0, -l.z))), 0.0, 1.0 )*clamp( 1.0-pos.y, 0.0, 1.0)*BS; // back light component

float f = pow( clamp(1.0+dot(nor, cam.rd), 0.0, 1.0), 2.0 )*FS; // fresnel component


vec3 c = vec3(0.0);
c += d*LC;                           // diffuse light integration

c += mix(HC1, HC2, dot(nor, HLD))*AS;        // hemisphere light integration (ambient)

c += b*BC*o;       // back light integration

c += f*FC*o;       // fresnel integration


return col*c;
}
vec3 render(Surface surface, Camera cam, vec2 uv) {
vec3 colour = vec3(.04, .045, .05);
colour = vec3(.35, .5, .75);
vec3 colourB = vec3(.9, .85, .8);
colour = mix(colourB, colour, pow(length(uv), 2.)/1.5);
if (surface.id > -1.) {
vec3 surfaceNormal = calcNormal( surface.position );
vec3 ref = reflect(cam.rd, surfaceNormal);
colour = surfaceNormal;
vec3 pos = surface.position;
float t = iTime;
vec3 col = mix(
mix(
vec3(.8, .3, .6), vec3(.6, .3, .8), dot(surfaceNormal, surfaceNormal.zxy)
), vec3(1), smoothstep(0., .1, cos(surface.colour.r*40.))
);
colour = shade(col, pos, surfaceNormal, ref, cam);
}
return colour;
}

float rectangle(in vec2 st, in vec2 origin, in vec2 dimensions) {
    vec2 bl = step(origin, st);
    float pct = bl.x * bl.y;
    vec2 tr = step(1.0 - origin - dimensions, 1.0 - st);
    pct *= tr.x * tr.y;
    return pct;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    vec2 st = gl_FragCoord.xy/iResolution.xy;
    st.x *= iResolution.x/iResolution.y;

    vec3 col1 = vec3(0.280,0.280,0.700);
    vec3 col2 = vec3(0.262,0.000,0.470);
    vec3 black = vec3(0.0);
    vec3 color = mix(col2, col1, st.y);

    color += rectangle(st, vec2(0.0, 0.0), vec2(0.15, 2.5)) * -1.0;
    color += rectangle(st, vec2(1.5, 0.0), vec2(0.15, 2.5)) * -1.0;

    color += rectangle(st, vec2(0.15, 0.0), vec2(0.15, 0.1)) * -1.0;
    color += rectangle(st, vec2(0.30, 0.0), vec2(0.15, 0.1)) * -1.0;
    color += rectangle(st, vec2(0.45, 0.0), vec2(0.15, 0.1)) * -1.0;
    color += rectangle(st, vec2(0.60, 0.0), vec2(0.15, 0.1)) * -1.0;
    color += rectangle(st, vec2(0.75, 0.0), vec2(0.15, 0.1)) * -1.0;
    color += rectangle(st, vec2(0.90, 0.0), vec2(0.15, 0.1)) * -1.0;
    color += rectangle(st, vec2(1.05, 0.0), vec2(0.15, 0.1)) * -1.0;
    color += rectangle(st, vec2(1.20, 0.0), vec2(0.15, 0.1)) * -1.0;
    color += rectangle(st, vec2(1.35, 0.0), vec2(0.15, 0.1)) * -1.0;

    color += rectangle(st, vec2(0.15, 2.15), vec2(0.15, 0.1)) * -1.0;
    color += rectangle(st, vec2(0.30, 2.15), vec2(0.15, 0.1)) * -1.0;
    color += rectangle(st, vec2(0.45, 2.15), vec2(0.15, 0.1)) * -1.0;
    color += rectangle(st, vec2(0.60, 2.15), vec2(0.15, 0.1)) * -1.0;
    color += rectangle(st, vec2(0.75, 2.15), vec2(0.15, 0.1)) * -1.0;
    color += rectangle(st, vec2(0.90, 2.15), vec2(0.15, 0.1)) * -1.0;
    color += rectangle(st, vec2(1.05, 2.15), vec2(0.15, 0.1)) * -1.0;
    color += rectangle(st, vec2(1.20, 2.15), vec2(0.15, 0.1)) * -1.0;
    color += rectangle(st, vec2(1.35, 2.15), vec2(0.15, 0.1)) * -1.0;
    
    color += rectangle(st, vec2(1.5, 0.0), vec2(0.15, 2.5)) * -1.0;
    //color = mix(col2, col1, st.y);

    vec2 bl = step(vec2(0.1),st);
    float pct = bl.x * bl.y;

    //color += pct;
    //color += smoothstep(1.0, 0.99, 1.0 - st.x) * -1.0;
    // float borderWidth = 0.1;
    // float distToEdge = min(min(st.x, 1.0 - st.x), min(st.y, 1.0 - st.y));
    
    // if(distToEdge < borderWidth) { color = black; }

    float scaleEffect = 0.1;
   //color *= vec3(scaleEffect, scaleEffect, scaleEffect, 1.0);
    fragColor = vec4(color, 1.0) * vec4(scaleEffect, scaleEffect, scaleEffect, 1.0);

}
#define Kpre86x`;

            const source = `
                struct GlobalUniforms {
                    projectionMatrix:mat3x3<f32>,
                    worldTransformMatrix:mat3x3<f32>,
                    worldColorAlpha: vec4<f32>,
                    uResolution: vec2<f32>,
                }

                struct LocalUniforms {
                    uTransformMatrix:mat3x3<f32>,
                    uColor:vec4<f32>,
                    uRound:f32,
                }

                @group(0) @binding(0) var<uniform> globalUniforms : GlobalUniforms;
                @group(1) @binding(0) var<uniform> localUniforms : LocalUniforms;

                @vertex
                fn main(
                    @location(0) aPosition : vec2<f32>,
                ) -> @builtin(position) vec4<f32> {     
                    var mvp = globalUniforms.projectionMatrix 
                        * globalUniforms.worldTransformMatrix 
                        * localUniforms.uTransformMatrix;
                    return vec4<f32>(mvp * vec3<f32>(aPosition, 1.0), 1.0);
                };

                @fragment
                fn main() -> @location(0) vec4<f32> {
                    return vec4<f32>(1.0, 0.0, 0.0, 1.0);
                }`;

            // const gl = { vertex, fragment };

            // const gpu = {
            //     vertex: {
            //         entryPoint: 'main',
            //         source,
            //     },
            //     fragment: {
            //         entryPoint: 'main',
            //         source,
            //     },
            // };

            // const shader = PIXI.Shader.from({
            //     gl,
            //     gpu,
            // });

            let prevMesh = null;

            for (let i = 0; i < this.text.length; i++) {
                const geometry = this.createLetter(this.text[i], this.font);

                const shader = PIXI.Shader.from({
                    gl: {
                        vertex,
                        fragment,
                    },
                    resources: {
                        shaderToyUniforms: {
                            iResolution: { value: [50, 50, 1], type: 'vec3<f32>' },
                            iTime: { value: 0, type: 'f32' },
                        },
                    },
                });

                const mesh = new PIXI.Mesh(geometry, shader);

                mesh.width = 50;

                mesh.height = 50;

                mesh.position.set(400, 300); // Center the mesh
                mesh.scale.set(500, 100); // Adjust scale if needed

                if (prevMesh) {
                    mesh.x = prevMesh.x + prevMesh.width + 10; 
                } else {
                    mesh.x = 0; 
                }

                this.meshes.push(mesh);

                prevMesh = mesh;
            }

            return this.meshes;
        } else {
            console.error('Font could not be loaded.');
            return [];
        }
    }

    setX(x) {
        this.meshes[0].x = x;
        for(let i = 1; i < this.meshes.length; i++) {
            this.meshes[i].x = this.meshes[i-1].x + this.meshes[i-1].width + 50;
        }
    }

    setY(y) {
        this.meshes.map(function(mesh) { mesh.y = y; });
    }

   
}

const app = new PIXI.Application();

(async () => {
    // let font = await createFont();
    
    /*
        NB
        (1) Mesh might be bigger than screen. I saw this when I changed the dimensions of the application
            to have values rather resizing it to the window.
        (2) The shader should be parameterised.
    */

	await app.init({ resizeTo: window, backgroundColor: 0x1099bb, antialias: true });
    document.body.appendChild(app.view);

    const text = "A";    
    const fontUrl = 'ffont.woff';
    const textMeshCreator = new TextMeshCreator(fontUrl, text);

    await textMeshCreator.generateMeshes();

    textMeshCreator.setY(500)
   
    textMeshCreator.meshes.map(function(mesh) { console.log(mesh.getLocalBounds()); app.stage.addChild(mesh); });

})();


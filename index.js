class Font extends PIXI.Text {

    constructor(fontFamily, text, x, y, strokes, fontSize, fragmentShader, textObjects = []) {
        super();
        this.fontFamily = fontFamily;
        this.text = text;
        this.x = x;
        this.y = y;
        this.strokes = strokes;
        this.fontSize = fontSize;
        this.fragmentShader = fragmentShader;
        this.textObjects = [];
    }

    async loadFont() {
        await document.fonts.load('10pt "wonga"');
        console.log("Font was loaded successfully!");
    }

    createStrokedText() {
        for(let i = 0; i < this.strokes.length; i++) {
            const stroke = this.strokes[i];
            const style = {
                fontFamily: 'wonga',
                fontSize: 100,
                fill: 0xffffff,
                align: 'center',
                stroke: stroke.color,
                strokeThickness: stroke.width,
            };

            const textStyle = new PIXI.TextStyle(style);
            const textObj = new PIXI.Text(this.text, textStyle);
      
            textObj.anchor.set(0.5); 
            textObj.x = this.x;
            textObj.y = this.y;

            this.textObjects.push(textObj);
        } 
    }
    
    applyFragShader() {
       const fragment = `
    in vec2 vTextureCoord;
    in vec4 vColor;

    uniform sampler2D uTexture;
    uniform float uTime;

    void main(void) {
        vec2 uvs = vTextureCoord.xy;

        vec4 fg = texture2D(uTexture, vTextureCoord);

        if (fg.a < 0.1) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); 
        } else {
            vec3 color = mix(vec3(1.0, 1.0, 0.0), vec3(1.000,0.,0.000), uvs.y);
            gl_FragColor = vec4(color * fg.rgb, fg.a); 
        }
    }`;

    const vertex = `
    in vec2 aPosition;
    out vec2 vTextureCoord;

    uniform vec4 uInputSize;
    uniform vec4 uOutputFrame;
    uniform vec4 uOutputTexture;

    vec4 filterVertexPosition( void ) {
        vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
        
        position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
        position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;

        return vec4(position, 0.0, 1.0);
    }

    vec2 filterTextureCoord( void ) {
        return aPosition * (uOutputFrame.zw * uInputSize.zw);
    }

    void main(void) {
        gl_Position = filterVertexPosition();
        vTextureCoord = filterTextureCoord();
    }
    `;

    const fragShader = this.fragmentShader; //Using fragShader causes the fill to be white when it's declared like this but not in the way I'm doing it here

    const filter = new PIXI.Filter({
        glProgram: new PIXI.GlProgram({
            fragment,
            vertex,
        }),
    });
        this.textObjects.forEach(textObj => textObj.filters = [filter]);
    }

    async createFont() {
        this.createStrokedText()
        this.applyFragShader();
    }
}

(async () => {
 
    const app = new PIXI.Application();
	await app.init({ resizeTo: window, backgroundColor: 0x000000, antialias: true, preference: 'webgl' });
    document.body.appendChild(app.view);

    const fontFamily = "wonga";
    const text = "ABC";
    const x = 150;
    const y = 150;
    const strokes = [
        { width: 10, color: 0xfff000 }, 
        { width: 9, color: 0x000000}, 
        { width: 5, color: 0xff0000  }, 
    ];
    const fontSize = 100;
    const fragmentShader = `
            in vec2 vTextureCoord;
            in vec4 vColor;
        
            uniform sampler2D uTexture;
            uniform float uTime;
        
            void main(void) {
                vec2 uvs = vTextureCoord.xy;
        
                vec4 fg = texture2D(uTexture, vTextureCoord);
        
                if (fg.a < 0.1) {
                    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); 
                } else {
                    vec3 color = mix(vec3(1.0, 1.0, 0.0), vec3(1.000,0.,0.000), uvs.y);
                    gl_FragColor = vec4(color * fg.rgb, fg.a); 
                }
            }`;

    const font = new Font(fontFamily, text, x, y, strokes, fontSize, fragmentShader);

    await font.loadFont();
    font.createFont();
    font.textObjects.forEach(textObj => app.stage.addChild(textObj));
})();
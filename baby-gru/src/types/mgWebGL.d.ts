import React from 'react';

import { moorhen } from "./moorhen";

import * as vec3 from 'gl-matrix/vec3';
import * as vec4 from 'gl-matrix/vec4';
import * as quat4 from 'gl-matrix/quat';
import * as mat4 from 'gl-matrix/mat4';
import * as mat3 from 'gl-matrix/mat3';

export namespace webGL {
    interface MGWebGL extends React.Component  {
        isWebGL2() : boolean;
        createColourBuffer(tri: number[]) : void;
        createIndexBuffer(tri: number[]) : void;
        createSizeBuffer(tri: number[]) : void;
        addSupplementaryInfo(info: any, name: string) : void;

        createInstanceSizesBuffer(tri: number[]) : void;
        createVertexBuffer(tri: number[]) : void;
        createRealNormalBuffer(tri: number[]) : void;
        createNormalBuffer(tri: number[]) : void;
        createInstanceOriginsBuffer(tri: number[]) : void;
        createInstanceOrientationsBuffer(tri: number[]) : void;
        makeCircleCanvas(text: string, width: number, height: number, circleColour: string) : void;
        makeTextCanvas(text:string, width:number, height:number, textColour:string, font?:string)  : [number,CanvasRenderingContext2D];
        calculate3DVectorFrom2DVector(inp: number[]) : vec3;
        mouseMoveAnimateTrack(force: boolean,count: number) : void;
        drawTextOverlays(invMat: number[]) : void;
        drawAxes(invMat: number[]) : void;
        drawCrosshairs(invMat: number[]) : void;
        drawMouseTrack() : void;
        reContourMaps() : void;
        drawSceneDirty() : void;
        drawSceneIfDirty() : void;
        drawFPSMeter() : void;
        linesToThickLines(axesVertices: number[], axesColours: number[], size: number) : any;
        linesToThickLinesWithIndicesAndNormals(axesVertices: number[], axesNormals: number[], axesColours: number[], axesIndices: number[], size: number) : any;
        linesToThickLinesWithIndices(axesVertices: number[], axesColours: number[], axesIndices: number[], size: number, axesNormals_old? : number) : any;
        doWheel(event: Event) : void;
        doHover(event: Event, self: any) : void;
        handleKeyUp(event: Event, self: any) : void;
        handleKeyDown(event: Event, self: any) : void;
        doMiddleClick(event: Event, self: any) : void;
        doMouseDown(event: Event, self: any) : void;
        doMouseMove(event: Event, self: any) : void;
        doDoubleClick(event: Event, self: any) : void;
        doMouseUp(event: Event, self: any) : void;
        getAtomFomMouseXY(event: Event, self: any) : number[];
        updateLabels(): void;
        doRightClick(event: Event, self: any): void;
        doClick(event: Event, self: any): void;
        drawAtomLabels(up: vec3, right: vec3, labelledAtoms: any, textColour: string, textTextureDirty: boolean) : void;
        drawDistancesAndLabels(up: vec3, right: vec3) : void;
        drawCircles(up: vec3, right: vec3) : void;
        drawTextLabels(up: vec3, right: vec3) : void;
        drawTriangles(calculatingShadowMap: boolean, invMat: mat4) : void;
        drawImagesAndText(invMat: mat4) : void;
        drawTransparent(theMatrix: mat4) : void;
        bindFramebufferDrawBuffers() : void;
        GLrender(calculatingShadowMap: boolean) : mat4; 
        drawTransformMatrixInteractivePMV(transformMatrix:number[], transformOrigin:number[], buffer:any, shader:any, vertexType:number, bufferIdx:number) : any;
        drawTransformMatrixPMV(transformMatrix:number[], buffer:any, shader:any, vertexType:number, bufferIdx:number) : any;
        setupModelViewTransformMatrixInteractive(transformMatrix:number[], transformOrigin:number[], buffer: any, shader: MGWebGLShader, vertexType: number, bufferIdx: number, specialDrawBuffer: any) : void;
        drawTransformMatrix(transformMatrix:number[], buffer:any, shader:any, vertexType:number, bufferIdx:number, specialDrawBuffer?:any) : void;
        drawBuffer(theBuffer:any,theShaderIn:MGWebGLShader|ShaderTrianglesInstanced,j:number,vertexType:number,specialDrawBuffer?:any) : void;
        drawTransformMatrixInteractive(transformMatrix:number[], transformOrigin:number[], buffer:any, shader:MGWebGLShader, vertexType:number, bufferIdx:number, specialDrawBuffer?:number) : void;
        applySymmetryMatrix(theShader: MGWebGLShader,symmetryMatrix: number[],tempMVMatrix: number[],tempMVInvMatrix: number[]) : void;
        setMatrixUniforms(program: MGWebGLShader) : void;
        setLightUniforms(program: MGWebGLShader) : void;
        quatDotProduct(q1: quat, q2: quat) : number;
        quatSlerp(q1: quat, q2: quat, h: number) : quat;
        centreOn(idx: number) : void;
        initTextBuffersBuffer(any) : void;
        initTextBuffers() : void;
        initInstancedOutlineShaders(vertexShaderOutline : string, fragmentShaderOutline : string)  : void;
        initInstancedShadowShaders(vertexShaderShadow : string, fragmentShaderShadow : string)  : void;
        initShadowShaders(vertexShaderShadow : string, fragmentShaderShadow : string)  : void;
        initBlurXShader(vertexShaderBlurX : string, fragmentShaderBlurX : string)  : void;
        initBlurYShader(vertexShaderBlurY : string, fragmentShaderBlurY : string)  : void;
        initOverlayShader(vertexShaderOverlay : string, fragmentShaderOverlay : string)  : void;
        initRenderFrameBufferShaders(vertexShaderRenderFrameBuffer : string, fragmentShaderRenderFrameBuffer : string)  : void;
        initCirclesShaders(vertexShader : string, fragmentShader : string)  : void;
        initTextInstancedShaders(vertexShader : string, fragmentShader : string)  : void;
        initTextBackgroundShaders(vertexShaderTextBackground : string, fragmentShaderTextBackground : string)  : void;
        initOutlineShaders(vertexShader : string, fragmentShader : string)  : void;
        initShaders(vertexShader : string, fragmentShader : string)  : void;
        initShadersInstanced(vertexShader : string, fragmentShader : string)  : void;
        initThickLineNormalShaders(vertexShader : string, fragmentShader : string)  : void;
        initThickLineShaders(vertexShader : string, fragmentShader : string)  : void;
        initLineShaders(vertexShader : string, fragmentShader : string)  : void;
        initDepthShadowPerfectSphereShaders(vertexShader : string, fragmentShader : string)  : void;
        initPerfectSphereOutlineShaders(vertexShader : string, fragmentShader : string)  : void;
        initPerfectSphereShaders(vertexShader : string, fragmentShader : string)  : void;
        initImageShaders(vertexShader : string, fragmentShader : string)  : void;
        initTwoDShapesShaders(vertexShader : string, fragmentShader : string)  : void;
        initPointSpheresShadowShaders(vertexShader : string, fragmentShader : string)  : void;
        initPointSpheresShaders(vertexShader : string, fragmentShader : string)  : void;
        setDraggableMolecule(molecule: moorhen.Molecule): void;
        setOrigin(o: [number, number, number], doDrawScene=true, dispatchEvent=true) : void;
        buildBuffers(): void;
        drawScene() : void;
        appendOtherData(jsondata: any, skipRebuild?: boolean, name?: string) : any;
        setZoom(z: number, drawScene?: boolean);
        setOriginOrientationAndZoomAnimated(o: number[],q: quat4,z: number) : void;
        setOriginAnimated(o: number[], doDrawScene=true) : void;
        initTextureFramebuffer() : void;
        clearMeasureCylinderBuffers() : void;
        getFrontAndBackPos(event: KeyboardEvent) : [number[], number[], number, number];
        render(): any;
        draw(): void;
        startSpinTest(): void;
        stopSpinTest(): void;
        doSpinTestFrame(): void;
        componentDidUpdate(oldProps:any) : void;
        componentDidMount() : void;
        setSpinTestState(doSpin:boolean): void;
        setDiffuseLightNoUpdate(r:number, g:number, b:number) : void;
        setAmbientLightNoUpdate(r:number, g:number, b:number) : void;
        setSpecularLightNoUpdate(r:number, g:number, b:number) : void;
        setSpecularPowerNoUpdate(p:number) : void;
        setLightPositionNoUpdate(x:number, y:number, z:number) : void;
        setDiffuseLight(r:number, g:number, b:number) : void;
        setAmbientLight(r:number, g:number, b:number) : void;
        setSpecularLight(r:number, g:number, b:number) : void;
        setSpecularPower(p:number) : void;
        setLightPosition(x:number, y:number, z:number) : void;
        set_fog_range(fogStart: number, fogEnd: number, update?: boolean) : void;
        set_clip_range(clipStart: number, clipEnd: number, update?: boolean) : void;
        resize(width: number, height: number) : void;
        setShadowDepthDebug(doShadowDepthDebug: boolean): void;
        setShadowsOn(doShadow: boolean): void;
        setOutlinesOn(doOutline: boolean): void;
        setSpinTestState(doSpinTest: boolean): void;
        setBlurSize(blurSize: number): void;
        setTextFont(family: string,size: number) : void;
        setBackground(col: [number, number, number, number]) : void;
        setActiveMolecule(molecule: moorhen.Molecule) : void;
        setQuat(q: quat4) : void;
        setOrientationFrame(qOld: quat4, qNew: quat4, iframe: number) : void;
        setOrientationAndZoomFrame(qOld: quat4, qNew: quat4, oldZoom: number, zoomDelta: number, iframe: number) : void;
        setOrientationAndZoomAnimated(q: quat4,z: number) : void;
        setOrientationAnimated(q: quat4) : void;
        setOriginOrientationAndZoomFrame(oo: number[],d:number[],qOld:quat4, qNew:quat4, oldZoom:number, zoomDelta:number, iframe:number) : void;
        setViewAnimated(o: number[],q: quat4,z: number) : void;
        drawOriginFrame(oo: number[],d: number, iframe: number) : void;
        setWheelContour(contourFactor:number, drawScene:boolean) : void;
        setShowAxes(a: boolean) : void;
        setFog(fog: number[]);
        setSlab(slab: number[]);
        clearTextPositionBuffers(): void;
        recreateSilhouetteBuffers() : void;
        recreateOffScreeenBuffers() : void;
        draggableMolecule: moorhen.Molecule
        activeMolecule: moorhen.Molecule
        specularPower: number;
        atomLabelDepthMode: boolean;
        clipCapPerfectSpheres: boolean;
        useOffScreenBuffers: boolean;
        blurSize: number;
        blurDepth:number;
        myQuat: quat4;
        gl_fog_start: null | number;
        doDrawClickedAtomLines: boolean;
        gl_clipPlane0: null | Float32Array;
        gl_clipPlane1: null | Float32Array;
        fogClipOffset: number;
        zoom: number;
        gl_fog_end: number;
        //light_colours_specular: Float32Array;
        //light_colours_diffuse: Float32Array;
        //light_positions: Float32Array;
        //light_colours_ambient: Float32Array;
        light_colours_specular: any;
        light_colours_diffuse: any;
        light_positions: any;
        light_colours_ambient: any;
        background_colour: [number, number, number, number];
        origin: [number, number, number];
        labelledAtoms: clickAtom[][];
        measuredAtoms: clickAtom[][];
        pixel_data: Uint8Array;
        screenshotBuffersReady: boolean;
        save_pixel_data: boolean;
        renderToTexture: boolean;
        showShortCutHelp: string[];
        WEBGL2: boolean;
        doRedraw: boolean;
        circleCanvasInitialized: boolean;
        textCanvasInitialized: boolean;
        currentlyDraggedAtom: null | {atom: {charge: number, tempFactor: number, x: number, y: number, z: number, symbol: string, label:string}, buffer: DisplayBuffer};
        gl_cursorPos: Float32Array;
        textCtx: CanvasRenderingContext2D;
        circleCtx: CanvasRenderingContext2D;
        canvas: HTMLCanvasElement;
        rttFramebuffer: MGWebGLFrameBuffer;
        doPerspectiveProjection: boolean;
        labelsTextCanvasTexture: TextCanvasTexture;
        currentBufferIdx: number;
        atom_span: number;
        axesColourBuffer: WebGLBuffer;
        axesIndexBuffer: WebGLBuffer;
        axesNormalBuffer: WebGLBuffer;
        axesPositionBuffer: WebGLBuffer;
        axesTextColourBuffer: WebGLBuffer;
        axesTextIndexesBuffer: WebGLBuffer;
        axesTextNormalBuffer: WebGLBuffer;
        axesTextPositionBuffer: WebGLBuffer;
        axesTextTexCoordBuffer: WebGLBuffer;
        backColour: string | number[];
        blurXTexture: WebGLTexture;
        blurYTexture: WebGLTexture;
        calculatingShadowMap: boolean;
        cancelMouseTrack: boolean;
        circleTex: WebGLTexture;
        clipChangedEvent: Event;
        context: CanvasRenderingContext2D;
        diskBuffer: DisplayBuffer;
        diskVertices: number[];
        doShadow: boolean;
        doShadowDepthDebug: boolean;
        doSpin: boolean;
        doStenciling: boolean;
        doneEvents: boolean;
        dx: number;
        dy: number;
        fogChangedEvent: Event;
        fpsText: string;
        framebufferDrawBuffersReady: boolean;
        framebufferDrawIndexesBuffer: WebGLBuffer;
        framebufferDrawPositionBuffer: WebGLBuffer;
        framebufferDrawTexCoordBuffer: WebGLBuffer;
        glTextFont: string;
        gl_clipPlane2: Float32Array;
        gl_clipPlane3: Float32Array;
        gl_clipPlane4: Float32Array;
        gl_clipPlane5: Float32Array;
        gl_clipPlane6: Float32Array;
        gl_clipPlane7: Float32Array;
        gl_nClipPlanes: number;
        hitchometerColourBuffer: WebGLBuffer;
        hitchometerIndexBuffer: WebGLBuffer;
        hitchometerNormalBuffer: WebGLBuffer;
        hitchometerPositionBuffer: WebGLBuffer;
        ids: string[];
        imageBuffer: DisplayBuffer;
        imageVertices: number[];
        init_x: number;
        init_y: number;
        mapLineWidth: number;
        measureCylinderBuffers: DisplayBuffer[];
        measureTextCanvasTexture: TextCanvasTexture;
        mouseDown: boolean;
        mouseDown_x: number;
        mouseDown_y: number;
        mouseDownedAt: number;
        mouseMoved: boolean;
        mouseTrackColourBuffer: WebGLBuffer;
        mouseTrackIndexBuffer: WebGLBuffer;
        mouseTrackNormalBuffer: WebGLBuffer;
        mouseTrackPoints: number[][];
        mouseTrackPositionBuffer: WebGLBuffer;
        moveFactor: number;
        mspfArray: number[];
        mvInvMatrix: Float32Array;
        mvMatrix: Float32Array;
        nAnimationFrames: number;
        nFrames: number;
        nPrevFrames: number;
        offScreenDepthTexture: WebGLTexture;
        offScreenFramebuffer: MGWebGLFrameBuffer;
        offScreenFramebufferBlurX: MGWebGLFrameBuffer;
        offScreenFramebufferBlurY: MGWebGLFrameBuffer;
        offScreenFramebufferColor: MGWebGLFrameBuffer;
        offScreenReady: boolean;
        offScreenRenderbufferColor: WebGLRenderbuffer;
        offScreenRenderbufferDepth: WebGLRenderbuffer;
        offScreenTexture: WebGLTexture;
        pMatrix: Float32Array;
        pmvMatrix: Float32Array;
        prevTime: number;
        radius: number;
        reContourMapOnlyOnMouseUp: boolean;
        ready: boolean;
        renderSilhouettesToTexture: boolean;
        rttFramebufferColor: MGWebGLFrameBuffer;
        rttFramebufferDepth: MGWebGLFrameBuffer;
        rttTexture: WebGLTexture;
        rttTextureDepth: WebGLTexture;
        screenZ: number;
        shaderProgram: ShaderTriangles;
        shaderProgramBlurX: ShaderBlurX;
        shaderProgramBlurY: ShaderBlurY;
        shaderProgramCircles: ShaderCircles;
        shaderProgramImages: ShaderImages;
        shaderProgramInstanced: ShaderTrianglesInstanced;
        shaderProgramInstancedOutline: ShaderTrianglesInstanced;
        shaderProgramInstancedShadow: ShaderTrianglesInstanced;
        shaderProgramLines: MGWebGLShader;
        shaderProgramOutline: ShaderOutLine;
        shaderProgramOverlay: ShaderOverlay;
        shaderProgramPerfectSpheres: ShaderPerfectSpheres;
        shaderProgramPerfectSpheresOutline: ShaderPerfectSpheres;
        shaderProgramPointSpheres: ShaderPointSpheres;
        shaderProgramPointSpheresShadow: ShaderPointSpheres;
        shaderProgramRenderFrameBuffer: ShaderFrameBuffer;
        shaderProgramShadow: MGWebGLShader;
        shaderProgramTextBackground: ShaderTextBackground;
        shaderProgramTextInstanced: ShaderTextInstanced;
        shaderProgramThickLines: ShaderThickLines;
        shaderProgramThickLinesNormal: ShaderThickLinesNormal;
        shaderProgramTwoDShapes: ShaderTwodShapes;
        shaderDepthShadowProgramPerfectSpheres: ShaderPerfectSpheres;
        shinyBack: boolean;
        showAxes: boolean;
        showCrosshairs: boolean;
        showFPS: boolean;
        silhouetteBufferReady: boolean;
        silhouetteDepthTexture: WebGLTexture;
        silhouetteFramebuffer: MGWebGLFrameBuffer;
        silhouetteRenderbufferColor: WebGLRenderbuffer;
        silhouetteRenderbufferDepth: WebGLRenderbuffer;
        silhouetteTexture: WebGLTexture;
        sphereBuffer: DisplayBuffer;
        state:  {width: number, height: number };
        statusChangedEvent: Event;
        stencilPass: boolean;
        stenciling: boolean;
        textHeightScaling: number;
        textTex: WebGLTexture;
        trackMouse: boolean;
        viewChangedEvent: Event;
        props: MGWebGLPropsInterface;
        extraFontCtxs: Dictionary<HTMLCanvasElement>;
        mouseDownButton: number;
        keysDown: Dictionary<number>;

        textLegends: any;
        textureMatrix: mat4;
        displayBuffers: any[];
        gl:  any;
        canvasRef: any;
        depth_texture: any;
        frag_depth_ext: any;
        instanced_ext: any;
        ext: any;
        newTextLabels: any;

    }
}

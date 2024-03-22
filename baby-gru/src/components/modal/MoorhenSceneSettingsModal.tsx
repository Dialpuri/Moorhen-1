import { useState, useEffect, useRef } from "react";
import { MoorhenDraggableModalBase } from "./MoorhenDraggableModalBase";
import { useDispatch, useSelector } from "react-redux";
import { convertRemToPx, convertViewtoPx, rgbToHex } from "../../utils/MoorhenUtils";
import { MoorhenSlider } from "../misc/MoorhenSlider";
import { MoorhenLightPosition } from "../webMG/MoorhenLightPosition";
import { Form, InputGroup, Stack } from "react-bootstrap";
import { 
    setBackgroundColor, setClipCap, setDepthBlurDepth, setDepthBlurRadius, setDoSSAO, setResetClippingFogging,
    setSsaoRadius, setSsaoBias,setUseOffScreenBuffers, setDoEdgeDetect, setEdgeDetectDepthThreshold, setEdgeDetectNormalThreshold,
    setEdgeDetectDepthScale, setEdgeDetectNormalScale
} from "../../store/sceneSettingsSlice";
import { HexColorInput, RgbColorPicker } from "react-colorful";
import { CirclePicker } from "react-color"
import { moorhen } from "../../types/moorhen";
import { webGL } from "../../types/mgWebGL";
import { hexToRgb } from "@mui/material";

const EdgeDetectPanel = (props: {}) => {
    const dispatch = useDispatch()
    const doEdgeDetect = useSelector((state: moorhen.State) => state.sceneSettings.doEdgeDetect)
    const edgeDetectDepthThreshold = useSelector((state: moorhen.State) => state.sceneSettings.edgeDetectDepthThreshold)
    const edgeDetectNormalThreshold = useSelector((state: moorhen.State) => state.sceneSettings.edgeDetectNormalThreshold)
    const edgeDetectDepthScale = useSelector((state: moorhen.State) => state.sceneSettings.edgeDetectDepthScale)
    const edgeDetectNormalScale = useSelector((state: moorhen.State) => state.sceneSettings.edgeDetectNormalScale)
    return <div className="scene-settings-panel-flex-between">
        <InputGroup className='moorhen-input-group-check'>
            <Form.Check 
                type="switch"
                checked={doEdgeDetect}
                onChange={() => { dispatch(
                    setDoEdgeDetect(!doEdgeDetect)
                )}}
                label="Edge detection"/>
        </InputGroup>
        <MoorhenSlider
                isDisabled={!doEdgeDetect}
                minVal={0}
                maxVal={4}
                allowFloats={false}
                logScale={false}
                sliderTitle="Depth scale"
                initialValue={edgeDetectDepthScale}
                externalValue={edgeDetectDepthScale}
                setExternalValue={(val: number) => dispatch(setEdgeDetectDepthScale(val))}/>
        <MoorhenSlider
                isDisabled={!doEdgeDetect}
                minVal={0}
                maxVal={4}
                allowFloats={false}
                logScale={false}
                sliderTitle="Normal scale"
                initialValue={edgeDetectNormalScale}
                externalValue={edgeDetectNormalScale}
                setExternalValue={(val: number) => dispatch(setEdgeDetectNormalScale(val))}/>
        <MoorhenSlider
                isDisabled={!doEdgeDetect}
                minVal={0.1}
                maxVal={2.0}
                logScale={false}
                sliderTitle="Depth threshold"
                initialValue={edgeDetectDepthThreshold}
                externalValue={edgeDetectDepthThreshold}
                setExternalValue={(val: number) => dispatch(setEdgeDetectDepthThreshold(val))}/>
        <MoorhenSlider
                isDisabled={!doEdgeDetect}
                minVal={0.1}
                maxVal={1.0}
                logScale={false}
                sliderTitle="Normal threshold"
                initialValue={edgeDetectNormalThreshold}
                externalValue={edgeDetectNormalThreshold}
                setExternalValue={(val: number) => dispatch(setEdgeDetectNormalThreshold(val))}/>
    </div>
}

const OcclusionPanel = (props: {}) => {
    const dispatch = useDispatch()
    const doSSAO = useSelector((state: moorhen.State) => state.sceneSettings.doSSAO)
    const ssaoRadius = useSelector((state: moorhen.State) => state.sceneSettings.ssaoRadius)
    const ssaoBias = useSelector((state: moorhen.State) => state.sceneSettings.ssaoBias)
    
    return <div className="scene-settings-panel-flex-between">
        <InputGroup className='moorhen-input-group-check'>
            <Form.Check 
                type="switch"
                checked={doSSAO}
                onChange={() => { dispatch(
                    setDoSSAO(!doSSAO)
                )}}
                label="Ambient occlusion"/>
        </InputGroup>
        <MoorhenSlider minVal={0.0} maxVal={2.0} logScale={false}
            isDisabled={!doSSAO}
            sliderTitle="Occlusion radius"
            initialValue={ssaoRadius}
            externalValue={ssaoRadius}
            setExternalValue={(val: number) => dispatch(setSsaoRadius(val))} />
        <MoorhenSlider minVal={0.0} maxVal={1.0} logScale={false}
            isDisabled={!doSSAO}
            sliderTitle="Occlusion effect"
            initialValue={ssaoBias}
            externalValue={ssaoBias}
            setExternalValue={(val: number) => dispatch(setSsaoBias(val))} />
    </div>
}

const BackgroundColorPanel = (props: {}) => {
    
    const backgroundColor = useSelector((state: moorhen.State) => state.sceneSettings.backgroundColor)
    const dispatch = useDispatch()

    const [innerBackgroundColor, setInnerBackgroundColor] = useState<{ r: number; g: number; b: number; }>({
        r: 255 * backgroundColor[0],
        g: 255 * backgroundColor[1],
        b: 255 * backgroundColor[2],
    })

    useEffect(() => {
        try {
            if (JSON.stringify(backgroundColor) !== JSON.stringify([innerBackgroundColor.r / 255., innerBackgroundColor.g / 255., innerBackgroundColor.b / 255., backgroundColor[3]])) {
                dispatch(
                    setBackgroundColor([ innerBackgroundColor.r / 255., innerBackgroundColor.g / 255., innerBackgroundColor.b / 255., backgroundColor[3] ])
                )
            }
        } catch (err) {
            console.log(err)
        }    
    }, [innerBackgroundColor])

    const handleCircleClick = (color: { rgb: { r: number; g: number; b: number; a: number; } }) => {
        try {
            setInnerBackgroundColor(color.rgb)
        }
        catch (err) {
            console.log('err', err)
        }
    }

    const handleColorChange = (color: { r: number; g: number; b: number; }) => {
        try {
            setInnerBackgroundColor(color)
        }
        catch (err) {
            console.log('err', err)
        }
    }

    return <Stack gap={1} direction="vertical" className="scene-settings-panel-flex-center">
        <span>Background Colour</span>
        <div style={{padding: 0, margin: 0, justifyContent: 'center', display: 'flex'}}>
            <RgbColorPicker color={innerBackgroundColor} onChange={handleColorChange} />
        </div>
        <div style={{display: 'flex', justifyContent: 'center'}}>
            <div style={{width: '11rem', padding: '0.5rem', margin: '0.15rem', justifyContent: 'center', display: 'flex', backgroundColor: '#e3e1e1', borderRadius: '8px'}}>
                <CirclePicker onChange={handleCircleClick} width='10rem' circleSize={convertRemToPx(10)/9} color={innerBackgroundColor} colors={['#000000', '#5c5c5c', '#8a8a8a', '#cccccc', '#ffffff']}/>
            </div>
        </div>
        <div style={{padding: 0, margin: 0, justifyContent: 'center', display: 'flex' }}>
            <div className="moorhen-hex-input-decorator">#</div>
            <HexColorInput className='moorhen-hex-input'
                color={rgbToHex(innerBackgroundColor.r, innerBackgroundColor.g, innerBackgroundColor.b)}
                onChange={(hex) => {
                    const [r, g, b] = hexToRgb(hex).replace('rgb(', '').replace(')', '').split(', ').map(item => parseFloat(item))
                    handleColorChange({r, g, b})
            }}/>
        </div>
    </Stack>
}

const DepthBlurPanel = (props: {

}) => {

    const dispatch = useDispatch()
    const useOffScreenBuffers = useSelector((state: moorhen.State) => state.sceneSettings.useOffScreenBuffers)
    const depthBlurDepth = useSelector((state: moorhen.State) => state.sceneSettings.depthBlurDepth)
    const depthBlurRadius = useSelector((state: moorhen.State) => state.sceneSettings.depthBlurRadius)
    
    return <div className="scene-settings-panel-flex-between">
            <InputGroup className='moorhen-input-group-check'>
                <Form.Check 
                    type="switch"
                    checked={useOffScreenBuffers}
                    onChange={() => { dispatch(
                        setUseOffScreenBuffers(!useOffScreenBuffers)
                    )}}
                    label="Depth Blur"/>
            </InputGroup>
            <MoorhenSlider
                isDisabled={!useOffScreenBuffers}
                minVal={0.0}
                maxVal={1.0}
                logScale={false}
                sliderTitle="Blur depth"
                initialValue={depthBlurDepth}
                externalValue={depthBlurDepth}
                setExternalValue={(val: number) => dispatch(setDepthBlurDepth(val))}/>
            <MoorhenSlider
                isDisabled={!useOffScreenBuffers}
                minVal={2}
                maxVal={16}
                logScale={false}
                sliderTitle="Blur radius"
                initialValue={depthBlurRadius}
                externalValue={depthBlurRadius}
                allowFloats={false}
                setExternalValue={(val: number) => dispatch(setDepthBlurRadius(val))}/>
    </div>
}

const ClipFogPanel = (props: {
    glRef: React.RefObject<webGL.MGWebGL>;
}) => {

    const dispatch = useDispatch()
    const [zclipFront, setZclipFront] = useState<number>(props.glRef.current.fogClipOffset + props.glRef.current.gl_clipPlane0[3])
    const [zclipBack, setZclipBack] = useState<number>(props.glRef.current.gl_clipPlane1[3] - props.glRef.current.fogClipOffset)
    const [zfogFront, setZfogFront] = useState<number>(props.glRef.current.fogClipOffset - props.glRef.current.gl_fog_start)
    const [zfogBack, setZfogBack] = useState<number>(props.glRef.current.gl_fog_end - props.glRef.current.fogClipOffset)
    const clipCap = useSelector((state: moorhen.State) => state.sceneSettings.clipCap)
    const resetClippingFogging = useSelector((state: moorhen.State) => state.sceneSettings.resetClippingFogging)

    useEffect(() => {
        if (props.glRef.current && props.glRef.current.gl_clipPlane0 && props.glRef.current.gl_clipPlane1) {
            setZclipFront(props.glRef.current.fogClipOffset + props.glRef.current.gl_clipPlane0[3])
            setZclipBack(props.glRef.current.gl_clipPlane1[3] - props.glRef.current.fogClipOffset)
            setZfogFront(props.glRef.current.fogClipOffset - props.glRef.current.gl_fog_start)
            setZfogBack(props.glRef.current.gl_fog_end - props.glRef.current.fogClipOffset)
        }
    }, [props.glRef.current.gl_clipPlane1[3], props.glRef.current.gl_clipPlane0[3], props.glRef.current.gl_fog_start, props.glRef.current.gl_fog_end])

    return <div className="scene-settings-panel-flex-between">
        <MoorhenSlider minVal={0.1} maxVal={1000} logScale={true}
            sliderTitle="Front clip"
            initialValue={props.glRef.current.fogClipOffset + props.glRef.current.gl_clipPlane0[3]}
            externalValue={zclipFront}
            setExternalValue={(newValue: number) => {
                props.glRef.current.gl_clipPlane0[3] = newValue - props.glRef.current.fogClipOffset
                props.glRef.current.drawScene()
                setZclipFront(newValue)
            }} />
        <MoorhenSlider minVal={0.1} maxVal={1000} logScale={true}
            sliderTitle="Back clip"
            initialValue={props.glRef.current.gl_clipPlane1[3] - props.glRef.current.fogClipOffset}
            externalValue={zclipBack}
            setExternalValue={(newValue: number) => {
                props.glRef.current.gl_clipPlane1[3] = props.glRef.current.fogClipOffset + newValue
                props.glRef.current.drawScene()
                setZclipBack(newValue)
            }} />
        <MoorhenSlider minVal={0.1} maxVal={1000} logScale={true}
            sliderTitle="Front zFog"
            initialValue={props.glRef.current.fogClipOffset - props.glRef.current.gl_fog_start}
            externalValue={zfogFront}
            setExternalValue={(newValue: number) => {
                props.glRef.current.gl_fog_start = props.glRef.current.fogClipOffset - newValue
                props.glRef.current.drawScene()
                setZfogFront(newValue)
            }} />
        <MoorhenSlider minVal={0.1} maxVal={1000} logScale={true}
            sliderTitle="Back zFog"
            externalValue={zfogBack}
            initialValue={props.glRef.current.gl_fog_end - props.glRef.current.fogClipOffset}
            setExternalValue={(newValue: number) => {
                props.glRef.current.gl_fog_end = newValue + props.glRef.current.fogClipOffset
                props.glRef.current.drawScene()
                setZfogBack(newValue)
            }} />
        <InputGroup style={{ paddingLeft: '0.1rem', paddingBottom: '0.5rem' }}>
            <Form.Check
                type="switch"
                checked={resetClippingFogging}
                onChange={() => { dispatch(
                    setResetClippingFogging(!resetClippingFogging) 
                )}}
                label="Reset clipping and fogging on zoom" />
        </InputGroup>
        <InputGroup style={{ paddingLeft: '0.1rem', paddingBottom: '0.5rem' }}>
            <Form.Check
                type="switch"
                checked={clipCap}
                onChange={() => { dispatch(
                    setClipCap(!clipCap)
                )}}
                label="'Clip-cap' perfect spheres" />
        </InputGroup>
    </div>
}

const LightingPanel = (props: {
    glRef: React.RefObject<webGL.MGWebGL>;
}) => {

    const busyLighting = useRef<boolean>(false)
    const newLightPosition = useRef<[number, number, number]>()
    const isSetLightPosIsDirty = useRef<boolean>(false)
    const [diffuse, setDiffuse] = useState<[number, number, number, number]>(props.glRef.current.light_colours_diffuse)
    const [specular, setSpecular] = useState<[number, number, number, number]>(props.glRef.current.light_colours_specular)
    const [ambient, setAmbient] = useState<[number, number, number, number]>(props.glRef.current.light_colours_ambient)
    const [specularPower, setSpecularPower] = useState<number>(props.glRef.current.specularPower)
    const [position, setPosition] = useState<[number, number, number]>([props.glRef.current.light_positions[0], props.glRef.current.light_positions[1], props.glRef.current.light_positions[2]])

    const setLightingPositionIfDirty = () => {
        if (isSetLightPosIsDirty.current) {
            busyLighting.current = true
            isSetLightPosIsDirty.current = false
            props.glRef.current.setLightPosition(newLightPosition.current[0], -newLightPosition.current[1], newLightPosition.current[2])
            props.glRef.current.drawScene()
            busyLighting.current = false
            setLightingPositionIfDirty()
        }
    }

    useEffect(() => {
        if (props.glRef.current && props.glRef.current.light_colours_diffuse) {
            setDiffuse(props.glRef.current.light_colours_diffuse)
            setSpecular(props.glRef.current.light_colours_specular)
            setAmbient(props.glRef.current.light_colours_ambient)
            setSpecularPower(props.glRef.current.specularPower)
            setPosition([props.glRef.current.light_positions[0], props.glRef.current.light_positions[1], props.glRef.current.light_positions[2]])
        }
    }, [props.glRef.current.specularPower, props.glRef.current.light_positions, props.glRef.current.light_colours_diffuse, props.glRef.current.light_colours_specular, props.glRef.current.light_colours_ambient])

    return <div className="scene-settings-panel">
        <MoorhenSlider minVal={0.0} maxVal={1.0} logScale={false}
            sliderTitle="Diffuse"
            initialValue={props.glRef.current.light_colours_diffuse[0]}
            externalValue={props.glRef.current.light_colours_diffuse[0]}
            setExternalValue={(newValue: number) => {
                props.glRef.current.light_colours_diffuse = [newValue, newValue, newValue, 1.0]
                props.glRef.current.drawScene()
                setDiffuse([newValue, newValue, newValue, 1.0])
            }} />
        <MoorhenSlider minVal={0.0} maxVal={1.0} logScale={false}
            sliderTitle="Specular"
            initialValue={props.glRef.current.light_colours_specular[0]}
            externalValue={props.glRef.current.light_colours_specular[0]}
            setExternalValue={(newValue: number) => {
                props.glRef.current.light_colours_specular = [newValue, newValue, newValue, 1.0]
                props.glRef.current.drawScene()
                setSpecular([newValue, newValue, newValue, 1.0])
            }} />
        <MoorhenSlider minVal={0.0} maxVal={1.0} logScale={false}
            sliderTitle="Ambient"
            initialValue={props.glRef.current.light_colours_ambient[0]}
            externalValue={props.glRef.current.light_colours_ambient[0]}
            setExternalValue={(newValue: number) => {
                props.glRef.current.light_colours_ambient = [newValue, newValue, newValue, 1.0]
                props.glRef.current.drawScene()
                setAmbient([newValue, newValue, newValue, 1.0])
            }} />
        <MoorhenSlider minVal={1.0} maxVal={600.0} logScale={false}
            sliderTitle="Specular power"
            initialValue={props.glRef.current.specularPower}
            externalValue={props.glRef.current.specularPower}
            setExternalValue={(newValue: number) => {
                props.glRef.current.specularPower = newValue
                props.glRef.current.drawScene()
                setSpecularPower(newValue)
            }} />
        <MoorhenLightPosition
            initialValue={props.glRef.current.light_positions}
            externalValue={props.glRef.current.light_positions}
            setExternalValue={(newValues: [number, number, number]) => {
                newLightPosition.current = newValues
                isSetLightPosIsDirty.current = true
                if (!busyLighting.current) {
                    setLightingPositionIfDirty()
                }
            }}
        />
    </div>
}

export const MoorhenSceneSettingsModal = (props: {
    glRef: React.RefObject<webGL.MGWebGL>;
    show: boolean;
    setShow: (show: boolean) => void;
}) => {

    const width = useSelector((state: moorhen.State) => state.sceneSettings.width)
    const height = useSelector((state: moorhen.State) => state.sceneSettings.height)

    return <MoorhenDraggableModalBase
                modalId="scene-settings-modal"
                left={width / 5}
                top={height / 6}
                headerTitle="Scene settings"
                defaultHeight={convertViewtoPx(40, height)}
                defaultWidth={convertViewtoPx(40, width)}
                minHeight={convertViewtoPx(60, height)}
                minWidth={convertRemToPx(40)}
                maxHeight={convertViewtoPx(75, height)}
                maxWidth={convertRemToPx(60)}
                enforceMaxBodyDimensions={true}
                body={
                    <Stack gap={2} direction="horizontal" style={{display: 'flex', alignItems: 'start', width: '100%', height:'100%'}}>
                        <Stack gap={2} direction="vertical">
                            <ClipFogPanel glRef={props.glRef}/>
                            <BackgroundColorPanel/>
                            <EdgeDetectPanel/>
                        </Stack>
                        <Stack gap={1} direction="vertical">
                            <LightingPanel glRef={props.glRef}/>
                            {props.glRef.current.isWebGL2() && <DepthBlurPanel/>}
                            <OcclusionPanel/>
                        </Stack>
                    </Stack>
                }
                footer={null}
                {...props}
                />
}

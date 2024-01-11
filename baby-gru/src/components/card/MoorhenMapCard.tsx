import { forwardRef, useImperativeHandle, useEffect, useState, useRef, useCallback, useMemo, Fragment } from "react"
import { Card, Form, Button, Col, DropdownButton, Stack, OverlayTrigger, ToggleButton, Spinner } from "react-bootstrap"
import { doDownload, guid } from '../../utils/MoorhenUtils'
import { getNameLabel } from "./cardUtils"
import { VisibilityOffOutlined, VisibilityOutlined, ExpandMoreOutlined, ExpandLessOutlined, DownloadOutlined, Settings, FileCopyOutlined, RadioButtonCheckedOutlined, RadioButtonUncheckedOutlined, AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';
import { MoorhenMapSettingsMenuItem } from "../menu-item/MoorhenMapSettingsMenuItem";
import { MoorhenRenameDisplayObjectMenuItem } from "../menu-item/MoorhenRenameDisplayObjectMenuItem"
import { MoorhenDeleteDisplayObjectMenuItem } from "../menu-item/MoorhenDeleteDisplayObjectMenuItem"
import { MoorhenSetMapWeight } from "../menu-item/MoorhenSetMapWeight"
import { MoorhenMapHistogram } from "../misc/MoorhenMapHistogram"
import { MoorhenSlider } from "../misc/MoorhenSlider";
import { Accordion, AccordionDetails, AccordionSummary, IconButton, MenuItem, Popover, Tooltip } from "@mui/material"
import { RgbColorPicker } from "react-colorful"
import { moorhen } from "../../types/moorhen"
import { MoorhenNotification } from "../misc/MoorhenNotification"
import { useSelector, useDispatch, batch } from 'react-redux';
import { setActiveMap, setNotificationContent } from "../../store/generalStatesSlice";
import { addMap } from "../../store/mapsSlice";
import { hideMap, setContourLevel, setMapAlpha, setMapColours, setMapRadius, setMapStyle, setNegativeMapColours, setPositiveMapColours, showMap } from "../../store/mapContourSettingsSlice";

type ActionButtonType = {
    label: string;
    compressed: () => JSX.Element;
    expanded: null | ( () => JSX.Element );
}

interface MoorhenMapCardPropsInterface extends moorhen.CollectedProps {
    dropdownId: number;
    accordionDropdownId: number;
    setAccordionDropdownId: React.Dispatch<React.SetStateAction<number>>;
    sideBarWidth: number;
    showSideBar: boolean;
    busy: boolean;
    key: number;
    index: number;
    map: moorhen.Map;
    initialContour?: number;
    initialRadius?: number;
    currentDropdownMolNo: number;
    setCurrentDropdownMolNo: React.Dispatch<React.SetStateAction<number>>;
}

export const MoorhenMapCard = forwardRef<any, MoorhenMapCardPropsInterface>((props, cardRef) => {
    const mapRadius = useSelector((state: moorhen.State) => {
        const map = state.mapContourSettings.mapRadii.find(item => item.molNo === props.map.molNo)
        if (map) {
            return map.radius
        } else {
            return props.initialRadius
        }
    })
    const mapContourLevel = useSelector((state: moorhen.State) => {
        const map = state.mapContourSettings.contourLevels.find(item => item.molNo === props.map.molNo)
        if (map) {
            return map.contourLevel
        } else {
            return props.initialContour
        }
    })
    const mapStyle = useSelector((state: moorhen.State) => {
        const map = state.mapContourSettings.mapStyles.find(item => item.molNo === props.map.molNo)
        if (map) {
            return map.style
        } else {
            return state.mapContourSettings.defaultMapSurface ? "solid" : state.mapContourSettings.defaultMapLitLines ? "lit-lines" : "lines"
        }
    })
    const mapOpacity = useSelector((state: moorhen.State) => {
        const map = state.mapContourSettings.mapAlpha.find(item => item.molNo === props.map.molNo)
        if (map) {
            return map.alpha
        } else {
            return 1.0
        }
    })
    const mapColourString = useSelector((state: moorhen.State) => {
        const map = state.mapContourSettings.mapColours.find(item => item.molNo === props.map.molNo)
        let result: {r: number, g: number, b: number}
        if (map) {
            result = map.rgb
        } else {
            result = {r: props.map.defaultMapColour.r * 255., g: props.map.defaultMapColour.g * 255., b: props.map.defaultMapColour.b * 255.}
        }
        // Need to stringify to ensure the selector is stable... (dont want to return a new obj reference)
        return JSON.stringify(result)
    })
    const negativeMapColourString = useSelector((state: moorhen.State) => {
        const map = state.mapContourSettings.negativeMapColours.find(item => item.molNo === props.map.molNo)
        let result: {r: number, g: number, b: number}
        if (map) {
            result = map.rgb
        } else {
            result = {r: props.map.defaultNegativeMapColour.r * 255., g: props.map.defaultNegativeMapColour.g * 255., b: props.map.defaultNegativeMapColour.b * 255.}
        }
        return JSON.stringify(result)
    })
    const positiveMapColourString = useSelector((state: moorhen.State) => {
        const map = state.mapContourSettings.positiveMapColours.find(item => item.molNo === props.map.molNo)
        let result: {r: number, g: number, b: number}
        if (map) {
            result = map.rgb
        } else {
           result = {r: props.map.defaultPositiveMapColour.r * 255., g: props.map.defaultPositiveMapColour.g * 255., b: props.map.defaultPositiveMapColour.b * 255.}
        }
        return JSON.stringify(result)
    })
    const activeMap = useSelector((state: moorhen.State) => state.generalStates.activeMap)
    const isDark = useSelector((state: moorhen.State) => state.sceneSettings.isDark)
    const contourWheelSensitivityFactor = useSelector((state: moorhen.State) => state.mouseSettings.contourWheelSensitivityFactor)
    const defaultExpandDisplayCards = useSelector((state: moorhen.State) => state.miscAppSettings.defaultExpandDisplayCards)
    const mapIsVisible = useSelector((state: moorhen.State) => state.mapContourSettings.visibleMaps.includes(props.map.molNo))
    const dispatch = useDispatch()

    const [isCollapsed, setIsCollapsed] = useState<boolean>(!defaultExpandDisplayCards);
    const [currentName, setCurrentName] = useState<string>(props.map.name);
    const [popoverIsShown, setPopoverIsShown] = useState<boolean>(false)
    const [showColourPicker, setShowColourPicker] = useState<boolean>(false)
    const [histogramBusy, setHistogramBusy] = useState<boolean>(false)
    
    const colourSwatchRef = useRef<HTMLDivElement | null>(null)
    const nextOrigin = useRef<number[]>([])
    const busyContouring = useRef<boolean>(false)
    const isDirty = useRef<boolean>(false)
    const histogramRef = useRef(null)

    const mapColour = JSON.parse(mapColourString)
    const negativeMapColour = JSON.parse(negativeMapColourString)
    const positiveMapColour = JSON.parse(positiveMapColourString)

    useImperativeHandle(cardRef, () => ({
        forceIsCollapsed: (value: boolean) => { 
            setIsCollapsed(value)
         }
    }), 
    [setIsCollapsed])

    const handlePositiveMapColorChange = (color: { r: number; g: number; b: number; }) => {
        try {
            dispatch( setPositiveMapColours({ molNo: props.map.molNo, rgb: color}) )
            props.map.fetchDiffMapColourAndRedraw('positiveDiffColour')
        }
        catch (err) {
            console.log('err', err)
        }
    }

    const handleNegativeMapColorChange = (color: { r: number; g: number; b: number; }) => {
        try {
            dispatch( setNegativeMapColours({ molNo: props.map.molNo, rgb: color}) )
            props.map.fetchDiffMapColourAndRedraw('negativeDiffColour')
        }
        catch (err) {
            console.log('err', err)
        }
    }

    const handleColorChange = (color: { r: number; g: number; b: number; }) => {
        try {
            dispatch( setMapColours({ molNo: props.map.molNo, rgb: color}) )
            props.map.fetchColourAndRedraw()
        }
        catch (err) {
            console.log('err', err)
        }
    }

    const mapSettingsProps = {
        setPopoverIsShown, mapOpacity, mapStyle, glRef: props.glRef, map: props.map
    }

    const handleDownload = async () => {
        let response = await props.map.getMap()
        doDownload([response.data.result.mapData], `${props.map.name.replace('.mtz', '.map')}`)
        props.setCurrentDropdownMolNo(-1)
    }

    const handleVisibility = useCallback(() => {
        dispatch( mapIsVisible ? hideMap(props.map) : showMap(props.map) )
        props.setCurrentDropdownMolNo(-1)
    }, [mapIsVisible])

    const handleDuplicate = async () => {
        const newMap = await props.map.duplicate()
        dispatch( addMap(newMap) )
    }

    const actionButtons: { [key: number] : ActionButtonType } = {
        1: {
            label: mapIsVisible ? "Hide map" : "Show map",
            compressed: () => { return (<MenuItem key='hide-show-map' onClick={handleVisibility}>{mapIsVisible ? "Hide map" : "Show map"}</MenuItem>) },
            expanded: () => {
                return (<Button key='hide-show-map' size="sm" variant="outlined" onClick={handleVisibility}>
                    {mapIsVisible ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                </Button>)
            },
        },
        2: {
            label: "Download Map",
            compressed: () => { return (<MenuItem key='donwload-map' onClick={handleDownload}>Download map</MenuItem>) },
            expanded: () => {
                return (<Button key='donwload-map' size="sm" variant="outlined" onClick={handleDownload}>
                    <DownloadOutlined />
                </Button>)
            },
        },
        3: {
            label: 'Rename map',
            compressed: () => { return (<MoorhenRenameDisplayObjectMenuItem key='rename-map' setPopoverIsShown={setPopoverIsShown} setCurrentName={setCurrentName} item={props.map} />) },
            expanded: null
        },
        4: {
            label: "Map draw settings",
            compressed: () => { return (<MoorhenMapSettingsMenuItem key='map-draw-settings' disabled={!mapIsVisible} {...mapSettingsProps} />) },
            expanded: null
        },
        5: {
            label: "Duplicate map",
            compressed: () => { return (<MenuItem key='duplicate-map' onClick={handleDuplicate}>Duplicate map</MenuItem>) },
            expanded: () => {
                return (<Button key='duplicate-map' size="sm" variant="outlined" onClick={handleDuplicate}>
                    <FileCopyOutlined />
                </Button>)
            },
        },
        6: {
            label: "Centre on map",
            compressed: () => { return (<MenuItem key='centre-on-map'onClick={() => props.map.centreOnMap()}>Centre on map</MenuItem>) },
            expanded: null
        },
        7: {
            label: "Set map weight...",
            compressed: () => { return (<MoorhenSetMapWeight key='set-map-weight' disabled={!mapIsVisible} map={props.map} setPopoverIsShown={setPopoverIsShown} />) },
            expanded: null
        },
    }

    const getButtonBar = (sideBarWidth: number) => {
        const maximumAllowedWidth = sideBarWidth * 0.55
        let currentlyUsedWidth = 0
        let expandedButtons: JSX.Element[] = []
        let compressedButtons: JSX.Element[] = []

        Object.keys(actionButtons).forEach(key => {
            if (actionButtons[key].expanded === null) {
                compressedButtons.push(actionButtons[key].compressed())
            } else {
                currentlyUsedWidth += 60
                if (currentlyUsedWidth < maximumAllowedWidth) {
                    expandedButtons.push(actionButtons[key].expanded())
                } else {
                    compressedButtons.push(actionButtons[key].compressed())
                }
            }
        })

        compressedButtons.push((
            <MoorhenDeleteDisplayObjectMenuItem
                key='delete-map'
                setPopoverIsShown={setPopoverIsShown}
                glRef={props.glRef}
                item={props.map}/>
        ))

        return <Fragment>
            {expandedButtons}
            <DropdownButton
                title={<Settings />}
                size="sm"
                variant="outlined"
                autoClose={popoverIsShown ? false : 'outside'}
                show={props.currentDropdownMolNo === props.map.molNo}
                onToggle={() => { props.map.molNo !== props.currentDropdownMolNo ? props.setCurrentDropdownMolNo(props.map.molNo) : props.setCurrentDropdownMolNo(-1) }}>
                {compressedButtons}
            </DropdownButton>
            <Button size="sm" variant="outlined"
                onClick={() => {
                    setIsCollapsed(!isCollapsed)
                }}>
                {isCollapsed ? < ExpandMoreOutlined /> : <ExpandLessOutlined />}
            </Button>
        </Fragment>
    }

    const doContourIfDirty = useCallback(() => {
        if (isDirty.current) {
            busyContouring.current = true
            isDirty.current = false
            props.map.drawMapContour().then(() => {
                busyContouring.current = false
                doContourIfDirty()
            })
        }
    }, [mapRadius, mapContourLevel, mapIsVisible, mapStyle])

    const handleOriginUpdate = useCallback((evt: moorhen.OriginUpdateEvent) => {
        nextOrigin.current = [...evt.detail.origin.map((coord: number) => -coord)]
        isDirty.current = true
        if (mapIsVisible && !busyContouring.current) {
                doContourIfDirty()
        }
    }, [doContourIfDirty])

    const handleWheelContourLevelCallback = useCallback((evt: moorhen.WheelContourLevelEvent) => {
        let newMapContourLevel: number
        if (mapIsVisible && props.map.molNo === activeMap.molNo) {
            if (evt.detail.factor > 1) {
                newMapContourLevel = mapContourLevel + contourWheelSensitivityFactor
            } else {
                newMapContourLevel = mapContourLevel - contourWheelSensitivityFactor
            }
            batch(() => {
                dispatch( setContourLevel({ molNo: props.map.molNo, contourLevel: newMapContourLevel }) )
                dispatch(setNotificationContent(
                    <MoorhenNotification key={guid()} hideDelay={5000}>
                    <h5 style={{margin: 0}}>
                        <span>
                            {`Level: ${newMapContourLevel.toFixed(2)} ${props.map.mapRmsd ? '(' + (newMapContourLevel / props.map.mapRmsd).toFixed(2) + ' rmsd)' : ''}`}
                        </span>
                    </h5>
                    </MoorhenNotification>
                ))
            })
        }
    }, [mapContourLevel, mapRadius, activeMap?.molNo, props.map.molNo, mapIsVisible])

    useMemo(() => {
        if (currentName === "") {
            return
        }
        props.map.name = currentName

    }, [currentName]);

    useEffect(() => {
        document.addEventListener("originUpdate", handleOriginUpdate);
        return () => {
            document.removeEventListener("originUpdate", handleOriginUpdate);
        }
    }, [handleOriginUpdate])

    useEffect(() => {
        document.addEventListener("wheelContourLevelChanged", handleWheelContourLevelCallback);
        return () => {
            document.removeEventListener("wheelContourLevelChanged", handleWheelContourLevelCallback);
        }
    }, [handleWheelContourLevelCallback])

    useEffect(() => {
        props.map.fetchMapAlphaAndRedraw()
    }, [mapOpacity])

    useEffect(() => {
        // This looks stupid but it is important otherwise the map is first drawn with the default contour and radius. Probably there's a problem somewhere...
        dispatch(setMapAlpha({molNo: props.map.molNo, alpha: mapOpacity}))
        dispatch(setMapStyle({molNo: props.map.molNo, style: mapStyle}))
        dispatch(setMapRadius({molNo: props.map.molNo, radius: mapRadius}))
        dispatch(setContourLevel({molNo: props.map.molNo, contourLevel: mapContourLevel}))
        dispatch(setMapColours({molNo: props.map.molNo, rgb: mapColour}))
        dispatch(setNegativeMapColours({molNo: props.map.molNo, rgb: negativeMapColour}))
        dispatch(setPositiveMapColours({molNo: props.map.molNo, rgb: positiveMapColour}))
        // Show map only if specified
        if (props.map.showOnLoad) {
            dispatch(showMap(props.map))
        }
    }, [])

    useEffect(() => {
        if (mapIsVisible) {
            nextOrigin.current = props.glRef.current.origin.map(coord => -coord)
            isDirty.current = true
            if (!busyContouring.current) {
                doContourIfDirty()
            }
        } else {
            props.map.hideMapContour()
        }

    }, [doContourIfDirty])

    const increaseLevelButton = <IconButton onClick={() => dispatch( setContourLevel({ molNo: props.map.molNo, contourLevel: mapContourLevel + contourWheelSensitivityFactor }) )} style={{padding: 0, color: isDark ? 'white' : 'black'}}>
                                    <AddCircleOutline/>
                                </IconButton>
    const decreaseLevelButton = <IconButton onClick={() => dispatch( setContourLevel({ molNo: props.map.molNo, contourLevel: mapContourLevel - contourWheelSensitivityFactor }) )} style={{padding: 0, color: isDark ? 'white' : 'black'}}>
                                    <RemoveCircleOutline/>
                                </IconButton>
    const increaseRadiusButton = <IconButton onClick={() => dispatch( setMapRadius({ molNo: props.map.molNo, radius: mapRadius + 2 }) )} style={{padding: 0, color: isDark ? 'white' : 'black'}}>
                                    <AddCircleOutline/>
                                </IconButton>
    const decreaseRadiusButton = <IconButton onClick={() => dispatch( setMapRadius({ molNo: props.map.molNo, radius: mapRadius - 2 }) )} style={{padding: 0, color: isDark ? 'white' : 'black'}}>
                                    <RemoveCircleOutline/>
                                </IconButton>

    const getMapColourSelector = () => {
        if (mapColour === null) {
            return null
        }

        let dropdown: JSX.Element
        if (props.map.isDifference) {
            dropdown = <>
                    <div ref={colourSwatchRef} onClick={() => setShowColourPicker(true)}
                        style={{
                            marginLeft: '0.5rem',
                            width: '25px',
                            height: '25px',
                            borderRadius: '8px',
                            border: '3px solid #fff',
                            boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(0, 0, 0, 0.1)',
                            cursor: 'pointer',
                            background: `linear-gradient( -45deg, rgba(${positiveMapColour.r},${positiveMapColour.g},${positiveMapColour.b}), rgba(${positiveMapColour.r},${positiveMapColour.g},${positiveMapColour.b}) 49%, white 49%, white 51%, rgba(${negativeMapColour.r},${negativeMapColour.g},${negativeMapColour.b}) 51% )`
                    }}/>
                    <Popover 
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                        open={showColourPicker}
                        onClose={() => setShowColourPicker(false)}
                        anchorEl={colourSwatchRef.current}
                        sx={{
                            '& .MuiPaper-root': {
                                overflowY: 'hidden', borderRadius: '8px', padding: '0.5rem', background: isDark ? 'grey' : 'white'
                            }
                        }}
                    >
                <Stack gap={3} direction='horizontal'>
                    <div style={{width: '100%', textAlign: 'center'}}>
                        <span>Positive</span>
                        <RgbColorPicker color={positiveMapColour} onChange={handlePositiveMapColorChange} />
                    </div>
                    <div style={{width: '100%', textAlign: 'center'}}>
                        <span>Negative</span>
                        <RgbColorPicker color={negativeMapColour} onChange={handleNegativeMapColorChange} />
                    </div>
                    
                </Stack>
                    </Popover>
            </>
        } else {
            dropdown = <>
                    <div ref={colourSwatchRef} onClick={() => setShowColourPicker(true)}
                        style={{
                            marginLeft: '0.5rem',
                            width: '25px',
                            height: '25px',
                            borderRadius: '8px',
                            border: '3px solid #fff',
                            boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(0, 0, 0, 0.1)',
                            cursor: 'pointer',
                            backgroundColor: `rgb(${mapColour.r},${mapColour.g},${mapColour.b})` 
                    }}/>
                    <Popover 
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                        open={showColourPicker}
                        onClose={() => setShowColourPicker(false)}
                        anchorEl={colourSwatchRef.current}
                        sx={{
                            '& .MuiPaper-root': {
                                overflowY: 'hidden', borderRadius: '8px'
                            }
                        }}
                    >
                        <RgbColorPicker color={mapColour} onChange={handleColorChange} />
                    </Popover>
            </>
        } 

        return <OverlayTrigger
                placement="top"
                overlay={
                    <Tooltip 
                        id="map-colour-label-tooltip" 
                        title=""
                        style={{
                            zIndex: 9999,
                            backgroundColor: 'rgba(0, 0, 0, 0.85)',
                            padding: '2px 10px',
                            color: 'white',
                            borderRadius: 3,
                        }}>
                            <div>
                                Change map colour
                            </div>
                    </Tooltip>
                }>
                   {dropdown}
                </OverlayTrigger>
    }

    return <Card ref={cardRef} className="px-0" style={{ display: 'flex', minWidth: props.sideBarWidth, marginBottom: '0.5rem', padding: '0' }} key={props.map.molNo}>
        <Card.Header style={{ padding: '0.1rem' }}>
            <Stack gap={2} direction='horizontal'>
                <Col className='align-items-center' style={{ display: 'flex', justifyContent: 'left', color: isDark ? 'white' : 'black' }}>
                    {getNameLabel(props.map)}
                    {getMapColourSelector()}
                </Col>
                <Col style={{ display: 'flex', justifyContent: 'right' }}>
                    {getButtonBar(props.sideBarWidth)}
                </Col>
            </Stack>
        </Card.Header>
        <Card.Body style={{ display: isCollapsed ? 'none' : '', padding: '0.5rem' }}>
            <Stack direction="vertical" gap={1}>
            <Stack direction='horizontal' gap={4}>
                <ToggleButton
                    id={`active-map-toggle-${props.map.molNo}`}
                    type="checkbox"
                    variant={isDark ? "outline-light" : "outline-primary"}
                    checked={props.map === activeMap}
                    style={{ marginLeft: '0.1rem', marginRight: '0.5rem', justifyContent: 'space-betweeen', display: 'flex' }}
                    onClick={() => dispatch( setActiveMap(props.map) )}
                    value={""}                >
                    {props.map === activeMap ? <RadioButtonCheckedOutlined/> : <RadioButtonUncheckedOutlined/>}
                    <span style={{marginLeft: '0.5rem'}}>Active</span>
                </ToggleButton>
                <Col>
                    <Form.Group controlId="contouringLevel" className="mb-3">
                        <span>{`Lvl: ${mapContourLevel.toFixed(2)} ${props.map.mapRmsd ? '(' + (mapContourLevel / props.map.mapRmsd).toFixed(2) + ' rmsd)' : ''}`}</span>
                        <MoorhenSlider
                            minVal={0.001}
                            maxVal={5}
                            showMinMaxVal={false}
                            decrementButton={decreaseLevelButton}
                            incrementButton={increaseLevelButton}
                            allowExternalFeedback={true}
                            logScale={true}
                            showSliderTitle={false}
                            isDisabled={!mapIsVisible}
                            initialValue={props.initialContour}
                            externalValue={mapContourLevel}
                            setExternalValue={(newVal) => dispatch( setContourLevel({molNo: props.map.molNo, contourLevel: newVal}) )}
                        />
                    </Form.Group>
                    <Form.Group controlId="contouringRadius" className="mb-3">
                        <MoorhenSlider
                            minVal={0.01}
                            maxVal={100}
                            showMinMaxVal={false}
                            decrementButton={decreaseRadiusButton} 
                            incrementButton={increaseRadiusButton} 
                            allowExternalFeedback={true} 
                            logScale={false} 
                            sliderTitle="Radius" 
                            decimalPlaces={2} 
                            isDisabled={!mapIsVisible} 
                            initialValue={props.initialRadius} 
                            externalValue={mapRadius} 
                            setExternalValue={(newVal) => dispatch( setMapRadius({molNo: props.map.molNo, radius: newVal}) )}
                        />
                    </Form.Group>
                </Col>
            </Stack>
            <Accordion className="moorhen-accordion" disableGutters={true} elevation={0} TransitionProps={{ unmountOnExit: true }}>
                <AccordionSummary style={{backgroundColor: isDark ? '#adb5bd' : '#ecf0f1'}} expandIcon={histogramBusy ? <Spinner animation='border'/> : <ExpandMoreOutlined />} >
                    Histogram
                </AccordionSummary>
                <AccordionDetails style={{padding: '0.2rem', backgroundColor: isDark ? '#ced5d6' : 'white'}}>
                    <MoorhenMapHistogram
                        ref={histogramRef}
                        setBusy={setHistogramBusy}
                        showHistogram={true}
                        setMapContourLevel={(newVal) => dispatch( setContourLevel({molNo: props.map.molNo, contourLevel: newVal}) )} 
                        map={props.map}/>
                </AccordionDetails>
            </Accordion>
        </Stack>
        </Card.Body>
    </Card >
})

MoorhenMapCard.defaultProps = {
    initialContour: 0.8, initialRadius: 13
}
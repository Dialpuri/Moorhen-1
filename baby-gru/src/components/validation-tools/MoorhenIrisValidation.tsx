import { Fragment, useCallback, useEffect, useRef, useState } from "react"
import { Col, Row, Form } from 'react-bootstrap'
import { MoorhenMoleculeSelect } from '../select/MoorhenMoleculeSelect'
import { convertRemToPx } from '../../utils/MoorhenUtils'
import { useDispatch, useSelector } from "react-redux"
import { Iris, IrisData, IrisAesthetics, IrisProps } from "iris-validation"
import { moorhen } from "../../types/moorhen"
import iris_module from "iris-validation-backend"
import { MoorhenMapSelect } from "../select/MoorhenMapSelect"
import { gemmi } from "../../types/gemmi";
import { setHoveredAtom } from "../../moorhen"
import {libcootApi} from "../../types/libcoot";
import {ChainData, MetricData, ModelData, ResidueData} from "iris-validation/dist/cjs/interface/interface";
import {MultiResultsBinding} from "iris-validation/dist/esm/interface/interface";

interface Props extends moorhen.CollectedProps {
    dropdownId: number;
    accordionDropdownId: number;
    setAccordionDropdownId: React.Dispatch<React.SetStateAction<number>>;
    sideBarWidth: number;
    showSideBar: boolean;
}
export const MoorhenIrisValidation = (props: Props) => {

    const dispatch = useDispatch()
    const newCootCommandAlert = useSelector((state: moorhen.State) => state.generalStates.newCootCommandAlert)
    const width = useSelector((state: moorhen.State) => state.sceneSettings.width)
    const height = useSelector((state: moorhen.State) => state.sceneSettings.height)
    const molecules = useSelector((state: moorhen.State) => state.molecules)
    const maps = useSelector((state: moorhen.State) => state.maps)

    const [plotDimensions, setPlotDimensions] = useState<number>(500)
    const [irisData, setIrisData] = useState<null | IrisData>(null)
    const [selectedModel, setSelectedModel] = useState<null | number>(null)
    const [selectedMap, setSelectedMap] = useState<null | number>(null)

    const mapSelectRef = useRef<undefined | HTMLSelectElement>();
    const moleculeSelectRef = useRef<undefined | HTMLSelectElement>();

    const handleModelChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedModel(parseInt(evt.target.value))
    }

    const handleMapChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedMap(parseInt(evt.target.value))
    }

    // const handleHover = useCallback((residueLabel: string) => {
    //     if (selectedModel !== null) {
    //         const molecule = molecules.find(item => item.molNo === selectedModel)
    //         if (molecule) {
    //             const [chain, resName, resNum] = residueLabel.split('/')
    //             const cid = `//${chain}/${resNum}(${resName})`
    //             dispatch(setHoveredAtom({molecule, cid}))
    //         }
    //     }
    // }, [selectedModel, molecules])
    const handleHover = useCallback(() => {}, [])


    const handleClick = useCallback((residueLabel: string) => {
        if (selectedModel !== null) {
            const molecule = molecules.find(item => item.molNo === selectedModel)
            if (molecule) {
                const [chain, resName, resNum] = residueLabel.split('/')
                const cid = `//${chain}/${resNum}`
                console.log(cid)
                molecule.centreOn(cid)
            }
        }
    }, [selectedModel, molecules])

    const getAvailableMetrics = (selectedModel: number, selectedMap: number, selectedChain: string) => {
        const allMetrics = [
            {command: "density_correlation_analysis", returnType:'validation_data', chainID: selectedChain, commandArgs:[selectedModel, selectedMap], needsMapData: true, displayName:'Dens. Corr.'},
            {command: "density_fit_analysis", returnType:'validation_data', chainID: selectedChain, commandArgs:[selectedModel, selectedMap], needsMapData: true, displayName:'Dens. Fit'},
            {command: "rotamer_analysis", returnType:'validation_data', chainID: selectedChain, commandArgs:[selectedModel], needsMapData: false, displayName:'Rota.'},
            {command: "ramachandran_analysis", returnType:'validation_data', chainID: selectedChain, commandArgs:[selectedModel], needsMapData: false, displayName:'Rama.'},
            {command: "peptide_omega_analysis", returnType:'validation_data', chainID: selectedChain, commandArgs:[selectedModel], needsMapData: false, displayName:'Pept. Omega'},
        ]

        let currentlyAvailable = []
        allMetrics.forEach(metric => {
            if ((metric.needsMapData && selectedMap === null) || selectedModel === null || selectedChain === null) {
                return
            }
            currentlyAvailable.push(metric)
        })

        return currentlyAvailable
    }

    const fetchData = async (selectedModel: number, selectedMap: number, selectedChain: string) => {
        if (selectedModel === null || selectedChain === null) {
            return null
        }
        let availableMetrics = getAvailableMetrics(selectedModel, selectedMap, selectedChain)

        let promises: Promise<moorhen.WorkerResponse<libcootApi.ValidationInformationJS[]>>[] = []
        availableMetrics.forEach(metric => {
            const inputData = { message:'coot_command', ...metric }
            promises.push(props.commandCentre.current.cootCommand(inputData, false))
        })
        let responses = await Promise.all(promises)

        let newPlotData: libcootApi.ValidationInformationJS[][] = []
        responses.forEach(response => {
            newPlotData.push(response.data.result.result)
        })

        return newPlotData
    }

    useEffect(() => {
        console.log("Calling fetch")
        fetchData(selectedModel, selectedMap, "A").then((metrics) => {
            const data: ModelData = {}
            const chain_data: ChainData = {}
            const residue_data: ResidueData = {}
            for (let metricIndex = 0; metricIndex < metrics.length; metricIndex++) {
                for (let residueIndex = 0; residueIndex < metrics[metricIndex].length; residueIndex++) {
                    const metric_data: MetricData = {
                        name: metrics[metricIndex][residueIndex].restype,
                        value: metrics[metricIndex][residueIndex].value,
                        seqnum: metrics[metricIndex][residueIndex].seqNum,
                        metric: `Metric ${metricIndex}`,
                        type: 'continuous',
                    }
                    if (residue_data.hasOwnProperty(metrics[metricIndex][residueIndex].seqNum)) {
                        residue_data[metrics[metricIndex][residueIndex].seqNum].push(metric_data)
                    }
                    else {
                        residue_data[metrics[metricIndex][residueIndex].seqNum] = [metric_data]
                    }
                }
            }

            chain_data["A"] = residue_data
            data['input1'] = chain_data
            console.log(data)
            const irisData = {
                data: data,
                chain_list: ["A"],
                file_list: ["input1"]
            };
            setIrisData(irisData)
        })
    }, [selectedMap, selectedModel, molecules, maps, newCootCommandAlert])

    useEffect(() => {
        if (molecules.length === 0) {
            setSelectedModel(null)
        } else if (selectedModel === null) {
            setSelectedModel(molecules[0].molNo)
        } else if (!molecules.map(molecule => molecule.molNo).includes(selectedModel)) {
            setSelectedModel(molecules[0].molNo)
        }
    }, [molecules.length])

    useEffect(() => {
        if (maps.length === 0) {
            setSelectedMap(null)
        } else if (selectedMap === null) {
            setSelectedMap(maps[0].molNo)
        } else if (!maps.map(map => map.molNo).includes(selectedMap)) {
            setSelectedMap(maps[0].molNo)
        }
    }, [maps.length])
   

    const aes: IrisAesthetics = {
        dimensions: [plotDimensions, plotDimensions],
        radius_change: 50,
        header: 40,
        text_size: 100
    }

    const iris_props: IrisProps = {
        results: irisData,
        from_wasm: false,
        aesthetics: aes,
        click_callback: handleClick,
        hover_callback: handleHover
    }

    return <Fragment>
        <Form style={{ padding:'0', margin: '0' }}>
            <Form.Group>
                <Row style={{ padding:'0', margin: '0' }}>
                    <Col>
                        <MoorhenMoleculeSelect width="" onChange={handleModelChange} molecules={molecules} ref={moleculeSelectRef}/>
                    </Col>
                    <Col>
                        <MoorhenMapSelect width="" onChange={handleMapChange} maps={maps} ref={mapSelectRef}/>
                    </Col>
                </Row>
            </Form.Group>
        </Form>
        {irisData ? <Iris {...iris_props} /> : <>No data</>}
    </Fragment>
}
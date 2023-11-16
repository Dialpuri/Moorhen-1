import { useCallback, useRef, useState } from "react"
import { Col, Row, Form, Card, Button, Stack, InputGroup } from 'react-bootstrap';
import { MoorhenValidationListWidgetBase } from "./MoorhenValidationListWidgetBase"
import { libcootApi } from "../../types/libcoot";
import { moorhen } from "../../types/moorhen";
import { useSelector } from "react-redux";
import { MoorhenNumberForm } from "../select/MoorhenNumberForm";

interface Props extends moorhen.CollectedProps {
    dropdownId: number;
    accordionDropdownId: number;
    setAccordionDropdownId: React.Dispatch<React.SetStateAction<number>>;
    sideBarWidth: number;
    showSideBar: boolean;
}

export const MoorhenWaterValidation = (props: Props) => {

    const isDirty = useRef<boolean>(false)
    const busyFetching = useRef<boolean>(false)
    const bFactorLimRef = useRef<string>(null)
    const sigmaLevelRef = useRef<string>(null)
    const maxDistRef = useRef<string>(null)
    const minDistRef = useRef<string>(null)
    const ignorePartOccRef = useRef<HTMLInputElement>(null)
    const ignoreZeroOccRef = useRef<HTMLInputElement>(null)

    const [triggerDataFetch, setTriggerDataFetch] = useState<boolean>(false)
    const [bFactorLim, setBFactorLim] = useState<number>(60)
    const [sigmaLevel, setSigmaLevel] = useState<number>(0.8)
    const [minDist, setMinDist] = useState<number>(2.3)
    const [maxDist, setMaxDist] = useState<number>(3.5)
    const [ignorePartOcc, setIgnorePartOcc] = useState<boolean>(false)
    const [ignoreZeroOcc, setIgnoreZeroOcc] = useState<boolean>(false)

    const molecules = useSelector((state: moorhen.State) => state.molecules)

    const viewWater = useCallback(async (selectedModel: number, water: libcootApi.AtomSpecJS) => {
        const selectedMolecule = molecules.find(molecule => molecule.molNo === selectedModel)
        if (selectedMolecule) {
            const cid = `/${water.model_number}/${water.chain_id}/${water.res_no}`
            await selectedMolecule.centreOn(cid, true)
        }
    }, [molecules])

    const deleteWater = useCallback(async (selectedModel: number, water: libcootApi.AtomSpecJS) => {
        const selectedMolecule = molecules.find(molecule => molecule.molNo === selectedModel)
        if (selectedMolecule) {
            const cid = `/${water.model_number}/${water.chain_id}/${water.res_no}`
            await selectedMolecule.deleteCid(cid)
        }
    }, [molecules])

    const refineWater = useCallback(async (selectedModel: number, water: libcootApi.AtomSpecJS) => {
        const selectedMolecule = molecules.find(molecule => molecule.molNo === selectedModel)
        if (selectedMolecule) {
            const cid = `/${water.model_number}/${water.chain_id}/${water.res_no}`
            await selectedMolecule.refineResiduesUsingAtomCid(cid, 'SNGLE')
        }
    }, [molecules])

    const fetchCardData = useCallback(async (selectedModel: number, selectedMap: number): Promise<libcootApi.AtomSpecJS[]> => {
        busyFetching.current = true
        let badWaters = []

        if (bFactorLimRef.current && sigmaLevelRef.current  && minDistRef.current  && maxDistRef) {
            const inputData: moorhen.cootCommandKwargs = {
                message:'coot_command',
                command: "find_water_baddies", 
                returnType:'atom_specs',
                commandArgs: [selectedModel, selectedMap, bFactorLim, sigmaLevel, minDist, maxDist, ignorePartOccRef.current.checked, ignoreZeroOccRef.current.checked]
            }
            
            let response = await props.commandCentre.current.cootCommand(inputData, false) as moorhen.WorkerResponse<libcootApi.AtomSpecJS[]>
            badWaters = response.data.result.result
        }

        busyFetching.current = false
        return badWaters
    }, [bFactorLim, sigmaLevel, minDist, maxDist])
    
    const getCards = (selectedModel: number, selectedMap: number, badWaters: libcootApi.AtomSpecJS[]): JSX.Element[] => {
        if (badWaters) {
            return badWaters.map((water, index) => {
                return <Card key={`${index}/${selectedModel}/${water.model_number}/${water.chain_id}/${water.res_no}`} style={{marginTop: '0.5rem'}}>
                        <Card.Body style={{padding:'0.5rem'}}>
                            <Row style={{display:'flex', justifyContent:'between'}}>
                                <Col style={{alignItems:'center', justifyContent:'left', display:'flex', whiteSpace: 'pre'}}>
                                    {`/${water.model_number}/${water.chain_id}/${water.res_no}(HOH)    ${water.string_user_data}`}
                                </Col>
                                <Col className='col-3' style={{margin: '0', padding:'0', justifyContent: 'right', display:'flex'}}>
                                    <Button style={{marginRight:'0.5rem'}} onClick={() => {
                                        viewWater(selectedModel, water)
                                    }}>
                                        View
                                    </Button>
                                    <Button style={{marginRight:'0.5rem'}} onClick={() => {
                                        refineWater(selectedModel, water)
                                    }}>
                                        Refine
                                    </Button>
                                    <Button style={{marginRight:'0.5rem'}} onClick={() => {
                                        deleteWater(selectedModel, water)
                                    }}>
                                        Delete
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
            })
        } else {
            console.warn("Got undefined value for bad waters...")
        }
    }

    const handleControlFormChange = () => {
        setTimeout(() => {
            if (isDirty.current) {
                if (!busyFetching.current) {
                    isDirty.current = false
                    setTriggerDataFetch((prev) => !prev)
                }
                handleControlFormChange()
            }
        }, 2000)
    }

    const extraControls = <>
    <Row>
        <Col style={{justifyContent:'center', alignContent:'center', alignItems:'center', display:'flex'}}>
            <MoorhenNumberForm
                label="B-Factor"
                defaultValue={60}
                ref={bFactorLimRef}
                onChange={(newVal: string) => {
                    setBFactorLim(parseFloat(newVal))
                    isDirty.current = true
                    handleControlFormChange()
                }}/>
            <MoorhenNumberForm
                label="Sigma"
                defaultValue={0.8}
                ref={sigmaLevelRef}
                onChange={(newVal: string) => {
                    setSigmaLevel(parseFloat(newVal))
                    isDirty.current = true
                    handleControlFormChange()
                }}/>
            <MoorhenNumberForm
                label="Min. dist."
                defaultValue={2.3}
                ref={minDistRef}
                onChange={(newVal: string) => {
                    setMinDist(parseFloat(newVal))
                    isDirty.current = true
                    handleControlFormChange()
                }}/>
            <MoorhenNumberForm
                label="Max. dist."
                defaultValue={3.5}
                ref={maxDistRef}
                onChange={(newVal: string) => {
                    setMaxDist(parseFloat(newVal))
                    isDirty.current = true
                    handleControlFormChange()
                }}/>
        </Col>
    </Row>
    <Row>
        <Stack direction="horizontal" gap={1} style={{display: 'flex'}}>
            <InputGroup className='moorhen-input-group-check' style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
                <Form.Check
                    label="Ignore part. occ."
                    ref={ignorePartOccRef}
                    type="switch"
                    style={{marginRight: '2rem'}}
                    checked={ignorePartOcc}
                    onChange={() => { 
                        setIgnorePartOcc((prev) => !prev)
                        setTriggerDataFetch((prev) => !prev)
                    }}/>
                <Form.Check 
                    label="Ignore zero occ."
                    ref={ignoreZeroOccRef}
                    type="switch"
                    checked={ignoreZeroOcc}
                    onChange={() => { 
                        setIgnoreZeroOcc((prev) => !prev)
                        setTriggerDataFetch((prev) => !prev)
                    }}/>
            </InputGroup>
        </Stack>
    </Row>
    </>

    return <MoorhenValidationListWidgetBase 
                sideBarWidth={props.sideBarWidth}
                dropdownId={props.dropdownId}
                accordionDropdownId={props.accordionDropdownId}
                showSideBar={props.showSideBar}
                filterMapFunction={ (map: moorhen.Map) => !map.isDifference }
                fetchData={fetchCardData}
                getCards={getCards}
                extraControlFormValue={triggerDataFetch}
                extraControlForm={extraControls}
            />
}

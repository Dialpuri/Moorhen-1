import {moorhen} from "../../types/moorhen";
import {useSelector} from 'react-redux';
import {Card, Col, Row} from "react-bootstrap";
import {useCallback, useState} from "react";
import {guid} from "../../utils/utils";
import {sails} from "../../types/sails";

export const MoorhenSailsCard = (props: {
    details: sails.SiteResult;
    molecule: moorhen.Molecule;
    selectedModel: number;
    selectedMap: number
}) => {

    const width = useSelector((state: moorhen.State) => state.sceneSettings.width)
    const molecules = useSelector((state: moorhen.State) => state.molecules.moleculeList)
    const maps = useSelector((state: moorhen.State) => state.maps)

    const {details, molecule, selectedModel, selectedMap} = props

    const handleClick = useCallback(async (key: string) => {
        if (key === "") {
            return
        }
        const selectedMolecule = molecules.find(molecule => molecule.molNo === selectedModel)
        const selectedMoorhenMap = maps.find(map => map.molNo === selectedMap)

        const [chain, name, seqid] = key.split("/");
        const newCenterString = `${chain}/${seqid}(${name})`
        await molecule.centreOn(newCenterString, true, true);
        const reflectionFileName: string = selectedMoorhenMap.associatedReflectionFileName;
        const result = await selectedMolecule.getSailsModel(reflectionFileName, chain, Number(seqid));
        selectedMolecule.redraw();
    }, []);

    const [isHovered, setIsHovered] = useState(false);

    const hoverStyle = {
        backgroundColor: isHovered ? 'lightblue' : '',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        padding: "0.5rem",
    };

    // For some reason a random key needs to be used here otherwise the scroll of the card list gets reset with every re-render
    return <Card key={guid()} style={{marginTop: '0.5rem'}}>
        <Card.Body style={hoverStyle}
                   onMouseEnter={() => setIsHovered(true)}
                   onMouseLeave={() => setIsHovered(false)}>
            <Row style={{display: 'flex', justifyContent: 'between'}}>
                <Col style={{alignItems: 'center', justifyContent: 'center', display: 'flex'}}>

                    <div style={{width: "100%", height: '100%'}}
                         onClick={() => handleClick(details.key)} key={details.key}>
                        {details.key}
                    </div>
                </Col>
            </Row>
        </Card.Body>
    </Card>
}


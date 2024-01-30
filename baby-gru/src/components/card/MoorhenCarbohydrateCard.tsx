import { moorhen } from "../../types/moorhen";
import { useSelector } from 'react-redux';
import { Card, Col, Row } from "react-bootstrap";
import { useCallback, useRef } from "react";
import { guid } from "../../utils/MoorhenUtils";
import { privateer } from "../../types/privateer";

export const MoorhenCarbohydrateCard = (props: {
    carbohydrate: privateer.ResultsEntry;
    molecule: moorhen.Molecule;
}) => {

    const divRef = useRef<HTMLDivElement | null>(null)
    
    const width = useSelector((state: moorhen.State) => state.sceneSettings.width)

    const { carbohydrate, molecule } = props

    const handleClick = useCallback(async (e) => {
        if (e.target.dataset?.chainid && e.target.dataset?.seqnum && e.target.dataset?.resname && molecule !== null) {
            const newCenterString = `${e.target.dataset.chainid}/${e.target.dataset.seqnum}(${e.target.dataset.resname})`
            await molecule.centreOn(newCenterString, true, true);
        }
    }, []);

    // For some reason a random key needs to be used here otherwise the scroll of the card list gets reset with every re-render
    return <Card key={guid()} style={{marginTop: '0.5rem'}}>
            <Card.Body style={{padding:'0.5rem'}}>
                <Row style={{display:'flex', justifyContent:'between'}}>
                    <Col style={{alignItems:'center', justifyContent:'center', display:'flex'}}>
                        <div style={{display: "flex", flexDirection: "column", width: width}}>
                            <h4>ID: {carbohydrate.id}</h4>
                            <div
                            onClick={handleClick}
                            ref={divRef}
                            style={{display: "flex", padding: "1rem"}}
                                id="svgContainer"
                                dangerouslySetInnerHTML={{
                                __html: carbohydrate.svg,
                            }}
                            />
                        </div>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
}


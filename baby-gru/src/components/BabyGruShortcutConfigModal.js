import { useState, useRef, useEffect } from "react";
import { Modal, Button, Card, Row, Col } from "react-bootstrap";
import { defaultValues } from "../utils/BabyGruPreferences";

export const BabyGruShortcutConfigModal = (props) => {
    const newShortCutModalRef = useRef();
    const [waitingNewShortCut, setWaitingNewShortCut] = useState(false);
    const [stagedShortCuts, setStagedShortCuts] = useState(props.shortCuts);
    const [shortCutMessage, setShortCutMessage] = useState("... Press something ...");

    const cancelChanges = () => {
        props.setShowModal(false)
        setStagedShortCuts(props.shortCuts)
    }

    const restoreDefaults = () => {
        props.setShowModal(false)
        setStagedShortCuts(defaultValues.shortCuts)
        props.setShortCuts(JSON.stringify(defaultValues.shortCuts))
    }

    const handleSaveChanges = () => {
        props.setShowModal(false)
        props.setShortCuts(JSON.stringify(stagedShortCuts))
    }
    
    const handleKeyUp = (evt) => {
        let modifiers = []
        if (evt.shiftKey) modifiers.push("shiftKey")
        if (evt.ctrlKey) modifiers.push("ctrlKey")
        if (evt.metaKey) modifiers.push("metaKey")
        if (evt.altKey) modifiers.push("altKey")

        setStagedShortCuts((prev) => {
            prev[waitingNewShortCut].keyPress = evt.key.toLowerCase()
            prev[waitingNewShortCut].modifiers = modifiers
            return prev
        })

        setWaitingNewShortCut(false)
        setShortCutMessage("... Press something ...")
    }
    
    const handleKeyDown = (evt) => {
        let modifiers = []
        if (evt.shiftKey) modifiers.push("<Shift>")
        if (evt.ctrlKey) modifiers.push("<Ctrl>")
        if (evt.metaKey) modifiers.push("<Meta>")
        if (evt.altKey) modifiers.push("<Alt>")
    
        setShortCutMessage(`${modifiers.join("-")} ${evt.key.toLowerCase()}`)
    }

    useEffect(() => {
        if (newShortCutModalRef.current && waitingNewShortCut) {
            document.addEventListener("keydown", handleKeyDown)
            document.addEventListener("keyup", handleKeyUp)    
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown)
            document.removeEventListener("keyup", handleKeyUp)    
        }

    }, [waitingNewShortCut])

    return <>
                <Modal show={props.showModal} backdrop="static" size='lg'>
                    <Modal.Header>
                        <Modal.Title>Shortcuts</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {Object.keys(stagedShortCuts).map(key => {
                            let modifiers = []
                            if (stagedShortCuts[key].modifiers.includes('shiftKey')) modifiers.push("<Shift>")
                            if (stagedShortCuts[key].modifiers.includes('ctrlKey')) modifiers.push("<Ctrl>")
                            if (stagedShortCuts[key].modifiers.includes('metaKey')) modifiers.push("<Meta>")
                            if (stagedShortCuts[key].modifiers.includes('altKey')) modifiers.push("<Alt>")                
                            return <Card style={{margin:'0.5rem'}}>
                                        <Card.Body style={{padding:'0.5rem'}}>
                                            <Row className="align-items-center">
                                                <Col style={{justifyContent: 'left', display:'flex'}}>
                                                    <span style={{fontWeight:'bold'}}>
                                                        {`${stagedShortCuts[key].label}`} 
                                                    </span>
                                                    <i>
                                                        {`: ${modifiers.join("-")} ${stagedShortCuts[key].keyPress} `}
                                                    </i>
                                                </Col>
                                                <Col style={{justifyContent: 'right', display:'flex'}}>
                                                    <Button size='sm' value={key} onClick={(evt) => setWaitingNewShortCut(evt.target.value)}>
                                                        Change
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                            })}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={restoreDefaults}>
                            Restore Defaults
                        </Button>
                        <Button variant="primary" onClick={handleSaveChanges}>
                            Save Changes
                        </Button>
                        <Button variant="danger" onClick={cancelChanges}>
                            Cancel
                        </Button>
                    </Modal.Footer>                    
                </Modal>
                <Modal ref={newShortCutModalRef} centered backdrop="static" size='sm' keyboard={false} show={waitingNewShortCut}>
                    <Modal.Header>
                        Define a new shortcut
                    </Modal.Header>
                    <Modal.Body>
                        {shortCutMessage}
                    </Modal.Body>
                </Modal>
            </>
}

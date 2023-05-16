import Draggable from "react-draggable";
import { Button, Card, Spinner } from "react-bootstrap";
import { StandaloneStructServiceProvider } from 'ketcher-standalone'
import { Editor } from 'ketcher-react'
import 'ketcher-react/dist/index.css'
import { Backdrop, IconButton } from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import { convertViewtoPx } from "../../utils/MoorhenUtils";
import { MoorhenMolecule } from "../../utils/MoorhenMolecule";

const structServiceProvider = new StandaloneStructServiceProvider()

export const KetcherModal = (props) => {
  const ketcherEditorRef = useRef(null)
  const [showBusy, setShowBusy] = useState(false)

  const smilesToPDB = async (smiles, instanceName='LIG', nConformer=10, nIteration=100) => {
    if (!smiles) {
        console.log('Empty smile, do nothing...')
        return
    }

    const response = await props.commandCentre.current.cootCommand({
        command: 'shim_smiles_to_pdb',
        commandArgs: [smiles, instanceName, nConformer, nIteration],
        returnType: 'str_str_pair'
    }, true)
    const result = response.data.result.result.second

    if (result) {
        return result
    } else {
        console.log('Error creating molecule... Wrong SMILES?')
        props.commandCentre.current.extendConsoleMessage('Error creating molecule... Wrong SMILES?')
    }
  }

  const handleDictFileContent = async (fileContent, instanceName='LIG') => {
    const selectedMoleculeIndex = parseInt(-999999)
    
    await Promise.all([
      props.commandCentre.current.cootCommand({
        returnType: "status",
        command: 'shim_read_dictionary',
        commandArgs: [fileContent, selectedMoleculeIndex],
        changesMolecules: []
      }, true),
      ...props.molecules.map(molecule => {
        molecule.addDictShim(fileContent)
        return molecule.redraw(props.glRef)
      })
    ])
            
    const result = await props.commandCentre.current.cootCommand({
      returnType: 'status',
      command: 'get_monomer_and_position_at',
      commandArgs: [instanceName, selectedMoleculeIndex, ...props.glRef.current.origin.map(coord => -coord)]
    }, true)
    
    if (result.data.result.status === "Completed") {
      const newMolecule = new MoorhenMolecule(props.commandCentre, props.monomerLibraryPath)
      newMolecule.molNo = result.data.result.result
      newMolecule.name = instanceName
      newMolecule.setBackgroundColour(props.backgroundColor)
      newMolecule.cootBondsOptions.smoothness = props.defaultBondSmoothness
      await newMolecule.addDict(fileContent)
      props.changeMolecules({ action: "Add", item: newMolecule })
      await newMolecule.fetchIfDirtyAndDraw("CBs", props.glRef)
    }
  }

  useEffect(() => {
    setTimeout(() => {
      const cliparea = document.querySelector('.cliparea')
      if (props.show && cliparea) {
        cliparea.style.display = 'none'
      }
    }, 1000)
  }, [props.show])

  const createLigand = async () => {
    setShowBusy(true)
    const smiles = await ketcherEditorRef.current.getSmiles()
    const dictFileContent = await smilesToPDB(smiles)
    handleDictFileContent(dictFileContent)
    setShowBusy(false)
    props.setShow(false)
  }
    
  const handleClose = () => {
    props.setShow(false)
  }

  const handleOnInit = (ketcher) => {
    ketcherEditorRef.current = ketcher
    window.ketcher = ketcher
    if (props.initialData) {
      ketcher.setMolecule(props.initialData)
    }
  }
  
  return ( props.show &&
    <Draggable handle='.handle'>
      <Card style={{position: 'absolute', top: '25rem', left: '25rem', height: convertViewtoPx(60, props.windowHeight), width: convertViewtoPx(70, props.windowWidth)}}>
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showBusy}>
          <Spinner animation="border" style={{ marginRight: '0.5rem' }}/>
          <span>Please wait...</span>
        </Backdrop>
        <Card.Header className="handle" style={{ justifyContent: 'space-between', display: 'flex', cursor: 'move', alignItems:'center', height: convertViewtoPx(4, props.windowHeight)}}>
          Ligand builder using ketcher
          <IconButton style={{margin: '0.1rem', padding: '0.1rem'}} onClick={() => props.setShow(false)}>
            <CloseOutlined/>
          </IconButton>
            </Card.Header>
        <Card.Body style={{padding: 0}}>
          <div style={{position: 'absolute', height: convertViewtoPx(52, props.windowHeight) - 2, width: convertViewtoPx(70, props.windowWidth) - 2}}>
            <Editor
              errorHandler={(message) => {
                console.log(message.toString())
              }}
              staticResourcesUrl={""}
              structServiceProvider={structServiceProvider}
              onInit={handleOnInit}
            />
          </div>
        </Card.Body>
        <Card.Footer style={{display: 'flex', alignItems: 'center', justifyContent: 'right', height: convertViewtoPx(4, props.windowHeight)}}>
          <Button variant='primary' onClick={createLigand}>Create ligand</Button>
          <Button variant='danger' onClick={handleClose} style={{marginLeft: '0.1rem'}}>Close</Button>
        </Card.Footer>
      </Card>
    </Draggable>
  )
}

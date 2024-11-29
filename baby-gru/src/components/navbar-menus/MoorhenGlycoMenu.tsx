import { MoorhenNavBarExtendedControlsInterface } from "./MoorhenNavBar";
import { MenuItem } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { showModal } from "../../store/modalsSlice";
import { modalKeys } from "../../utils/enums";
import { convertViewtoPx } from "../../utils/utils";
import { moorhen } from "../../types/moorhen";

export const MoorhenGlycoMenu = (props: MoorhenNavBarExtendedControlsInterface) => {
    const height = useSelector((state: moorhen.State) => state.sceneSettings.height)
    
    const dispatch = useDispatch()
   
    return <div style={{maxHeight: convertViewtoPx(65, height), overflow: 'auto'}}>
            <MenuItem onClick={() => {
                dispatch(showModal(modalKeys.GLYCO))
                document.body.click()
            }}>Find potential glycosylation sites with Sails...</MenuItem>

    </div>
}


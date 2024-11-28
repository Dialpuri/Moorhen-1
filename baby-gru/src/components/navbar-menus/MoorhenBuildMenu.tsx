import { MoorhenNavBarExtendedControlsInterface } from "./MoorhenNavBar";
import { MenuItem } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { showModal } from "../../store/modalsSlice";
import { modalKeys } from "../../utils/enums";
import { convertViewtoPx } from "../../utils/utils";
import { moorhen } from "../../types/moorhen";

export const MoorhenBuildMenu = (props: MoorhenNavBarExtendedControlsInterface) => {
    const height = useSelector((state: moorhen.State) => state.sceneSettings.height)
    
    const dispatch = useDispatch()
   
    return <div style={{maxHeight: convertViewtoPx(65, height), overflow: 'auto'}}>
            <MenuItem onClick={() => {
                dispatch(showModal(modalKeys.SAILS))
                document.body.click()
            }}>Build carbohydrates with Sails...</MenuItem>

    </div>
}


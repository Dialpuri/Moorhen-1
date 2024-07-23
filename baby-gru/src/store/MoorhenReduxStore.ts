import { configureStore } from '@reduxjs/toolkit'
import moleculesReducer from './moleculesSlice'
import mapsReducer from './mapsSlice'
import mouseSettingsReducer from './mouseSettings'
import backupSettingsReducer from './backupSettingsSlice'
import shortcutSettingsReducer from './shortCutsSlice'
import labelSettingsReducer from './labelSettingsSlice'
import sceneSettingsReducer from './sceneSettingsSlice'
import generalStatesReducer from './generalStatesSlice'
import hoveringStatesReducer from './hoveringStatesSlice'
import modalsReducer from './modalsSlice'
import mapContourSettingsReducer from './mapContourSettingsSlice'
import moleculeMapUpdateReducer from './moleculeMapUpdateSlice'
import sharedSessionReducer from './sharedSessionSlice'
import refinementSettingsReducer from './refinementSettingsSlice'
import sliceNDiceReducer from './sliceNDiceSlice'
import lhasaReducer from './lhasaSlice'

export default configureStore({
    reducer: {
        molecules: moleculesReducer,
        maps: mapsReducer,
        mouseSettings: mouseSettingsReducer,
        backupSettings: backupSettingsReducer,
        shortcutSettings: shortcutSettingsReducer,
        labelSettings: labelSettingsReducer,
        sceneSettings: sceneSettingsReducer,
        generalStates: generalStatesReducer,
        hoveringStates: hoveringStatesReducer,
        modals: modalsReducer,
        mapContourSettings: mapContourSettingsReducer,
        moleculeMapUpdate: moleculeMapUpdateReducer,
        sharedSession: sharedSessionReducer,
        refinementSettings: refinementSettingsReducer,
        lhasa: lhasaReducer,
        sliceNDice: sliceNDiceReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
})
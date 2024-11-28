import {moorhen} from "../../types/moorhen";
import {useSelector} from 'react-redux';
import {privateer} from "../../types/privateer";
import {MoorhenSailsCard} from "../card/MoorhenSailsCard";
import {MoorhenModelBuildingWidgetBase} from "./MoorhenModelBuildingWidgetBase";
import {sails} from "../../types/sails";
import SiteResult = sails.SiteResult;

export const MoorhenSailsBuilding = (props: moorhen.CollectedProps) => {

    const molecules = useSelector((state: moorhen.State) => state.molecules.moleculeList)

    const fetchCardData = async (selectedModel: number): Promise<privateer.ResultsEntry[]> => {
        const selectedMolecule = molecules.find(molecule => molecule.molNo === selectedModel)
        if (selectedMolecule) {
            const result = await selectedMolecule.getSailsSiteResult()
            return result
        }
    }

    const getCards = (selectedModel: number, selectedMap: number, sailsResults: sails.SiteResult[]): [JSX.Element[][], JSX.Element[]] => {
        const selectedMolecule = molecules.find(molecule => molecule.molNo === selectedModel)

        if (!selectedMolecule) {
            return
        }

        const n_glycosylation = sailsResults.filter((entry: SiteResult) => {
            return entry.type == "n-glycosylation"
        });
        const c_glycosylation = sailsResults.filter((entry: SiteResult) => {
            return entry.type == "c-glycosylation"
        });

        const cards = [];
        const titles = [];

        const n_glycosylation_cards = []
        n_glycosylation.map((element) => {
            n_glycosylation_cards.push(<MoorhenSailsCard details={element} molecule={selectedMolecule}/>)
        });

        const c_glycosylation_cards = []
        c_glycosylation.map((element) => {
            c_glycosylation_cards.push(<MoorhenSailsCard details={element} molecule={selectedMolecule}/>)
        });

        if (n_glycosylation.length > 0) {
            titles.push("Potential N-Glycosylation Sites")
            cards.push(n_glycosylation_cards);
        }
        if (c_glycosylation.length > 0) {
            titles.push("Potential C-Glycosylation Sites")
            cards.push(c_glycosylation_cards);
        }

        return [cards, titles];
    }

    return <MoorhenModelBuildingWidgetBase
        enableMapSelect={false}
        fetchData={fetchCardData}
        getCards={getCards}
    />

}

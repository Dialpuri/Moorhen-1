import {moorhen} from "../../types/moorhen";
import {useSelector} from 'react-redux';
import {privateer} from "../../types/privateer";
import {MoorhenSailsCard} from "../card/MoorhenSailsCard";
import {MoorhenGlycoWidgetBase} from "./MoorhenGlycoWidgetBase";
import {sails} from "../../types/sails";
import SiteResult = sails.SiteResult;

export const MoorhenSailsFindSites = (props: moorhen.CollectedProps) => {

    const molecules = useSelector((state: moorhen.State) => state.molecules.moleculeList)
    const maps = useSelector((state: moorhen.State) => state.maps)

    const fetchCardData = async (selectedModel: number, selectedMap: number): Promise<any> => {
        const selectedMolecule = molecules.find(molecule => molecule.molNo === selectedModel)
        const selectedMoorhenMap = maps.find(map => map.molNo === selectedMap)
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

        const glycosylationTypes = [
            { type: "n-glycosylation", title: "Potential N-Glycosylation Sites" },
            { type: "c-glycosylation", title: "Potential C-Glycosylation Sites" },
        ];


        const { cards, titles } = glycosylationTypes.reduce(
            (acc, { type, title }) => {
                const filtered = sailsResults.filter((entry: SiteResult) => entry.type === type);
                if (filtered.length > 0) {
                    acc.titles.push(title);
                    acc.cards.push(filtered.map(element => (
                        <MoorhenSailsCard details={element} molecule={selectedMolecule} selectedModel={selectedModel} selectedMap={selectedMap} />
                    )));
                }
                return acc;
            },
            { cards: [], titles: [] }
        );

        return [cards, titles];
    }

    return <MoorhenGlycoWidgetBase
        enableMapSelect={true}
        fetchData={fetchCardData}
        getCards={getCards}
    />

}

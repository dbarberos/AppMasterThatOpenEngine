import * as BUI from "@thatopen/ui";
import { ItemsDataPanelState, ModelsPanelState, QueriesPanelState } from "../../../sections";

type Viewport = {
    name: "viewport";
    state: {}
}

export type ItemsData = {
    name: "itemsData";
    state: ItemsDataPanelState;
}

export type Queries = {
    name: "queries";
    state: QueriesPanelState;
}

export type Models = {
    name: "models";
    state: ModelsPanelState
}


type ComponentsGridElements = [Viewport, ItemsData, Models, Queries];
type ComponentsGridLayouts = ["Models"];

export type ComponentsGrid = BUI.Grid<ComponentsGridLayouts, ComponentsGridElements>;

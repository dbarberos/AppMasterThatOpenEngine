import * as BUI from "@thatopen/ui";
import { ItemsDataPanelState } from "../../../sections";

type Viewport = {
    name: "viewport";
    state: {}
}

export type ItemsData = {
    name: "itemsData";
    state: ItemsDataPanelState;
}



type ComponentsGridElements = [Viewport, ItemsData];
type ComponentsGridLayouts = ["Models"];

export type ComponentsGrid = BUI.Grid<ComponentsGridLayouts, ComponentsGridElements>;

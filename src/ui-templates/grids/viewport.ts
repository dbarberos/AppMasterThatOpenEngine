import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
import {
    ViewerToolbarState,
    viewerToolbarTemplate,
} from "..";

type BottomToolbar = { name: "bottomToolbar"; state: ViewerToolbarState }

type ViewportGridElements = [BottomToolbar];

type ViewportGridLayouts = ["main"];

export type ViewportGrid = BUI.Grid<ViewportGridLayouts, ViewportGridElements>;

interface ViewportGridState {
    components: OBC.Components
}

export const viewportGridTemplate: BUI.StatefullComponent<ViewportGridState> = (state,) => {
    const { components } = state;

    const elements: BUI.GridComponents<ViewportGridElements> = {
        bottomToolbar: {
            template: viewerToolbarTemplate,
            initialState: { components },
        }
    }

    const onCreated = (e?: Element) => {
        if (!e) return;
        const grid = e as ViewportGrid;
        grid.elements = elements;

        grid.layouts = {
            main: {
                template: `
                "empty" 1fr
                "bottomToolbar" auto
                / 1fr
                `,
            }
        };

        grid.layout = "main";

        // Estilos para que el grid sea responsive y ocupe todo el espacio
        grid.style.width = "100%";
        grid.style.height = "100%";
        grid.style.display = "grid";
        grid.style.gridTemplateRows = "1fr auto";
        grid.style.gap = "8px";
        grid.style.padding = "8px";
    };

    return BUI.html`<bim-grid floating class="viewport-grid" ${BUI.ref(onCreated)}> </bim-grid>`;

}





import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import { appIcons } from "../../global";
export interface LoadModelBtnState {
    components: OBC.Components
}

export const createLoadIfcHandler = (components: OBC.Components) => {
    return async () => {
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = false;
        input.accept = ".ifc";

        input.addEventListener("change", async () => {
            try {
                const file = input.files?.[0];
                if (!file) return;

                const buffer = await file.arrayBuffer();
                const bytes = new Uint8Array(buffer);
                const ifcLoader = components.get(OBC.IfcLoader);
                const modelId = file.name.replace(/\.ifc$/i, "");

                // Esperar a que se complete la carga
                await ifcLoader.load(
                    bytes,
                    true, //instructs the loader to automatically coordinate (position) the model relative to others loaded
                    modelId, // ID with which the model will be loaded into memory (used for referencing the model later)
                );
                console.log("IFC cargado exitosamente");
            } catch (error) {
                console.error("Error cargando IFC:", error);
                throw error;
            }
        })

        input.click();
    }
}

export const createLoadFragHandler = (components: OBC.Components) => {
    return async () => {
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = false;
        input.accept = ".frag";

        input.addEventListener("change", async () => {
            const file = input.files?.[0];
            if (!file) return;

            try {
                const buffer = await file.arrayBuffer();
                const fragments = components.get(OBC.FragmentsManager);
                const modelId = file.name.replace(/\.frag$/i, "");

                await fragments.core.load(buffer, {
                    modelId,
                });

                console.log("FRAG cargado exitosamente");
            } catch (error) {
                console.error("Error cargando FRAG:", error);
                throw error;
            }
        });

        input.click();
    }
}




export const loadModelBtnTemplate: BUI.StatefullComponent<LoadModelBtnState> = (
    state,
) => {
    const { components } = state;
    const onLoadIfc = createLoadIfcHandler(components);

    const onLoadFrag = createLoadFragHandler(components);




    return BUI.html`<bim-button icon=${appIcons.ADD}>
        <bim-context-menu>
            <bim-button class="transparent" @click=${onLoadFrag} label="Load FRAG"></bim-button>
            <bim-button class="transparent" @click=${onLoadIfc} label="Load IFC"></bim-button>
        </bim-context-menu>
    </bim-button>`

}

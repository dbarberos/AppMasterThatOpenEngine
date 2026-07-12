import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";

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
                
                // Esperar a que se complete la carga
                await ifcLoader.load(
                    bytes,
                    true, //instructs the loader to automatically coordinate (position) the model relative to others loaded
                    file.name.replace(".ifc", ""), // ID with which the model will be loaded into memory (used for referencing the model later)
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

export const loadModelBtnTemplate: BUI.StatefullComponent<LoadModelBtnState> = (
    state,
) => {
    const { components } = state;
    const onLoadIfc = createLoadIfcHandler(components);

    return BUI.html`<bim-button @click=${onLoadIfc} label="Load IFC"></bim-button>`
}

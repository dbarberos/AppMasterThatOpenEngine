import * as BUI from "@thatopen/ui";
import { ComponentsGrid } from "./src";
import { viewportContainerTemplate } from "../../containers";
import { itemsDataPanelTemplate } from "../../sections";
import * as OBC from "@thatopen/components";


interface ComponentsGridState {
    components: OBC.Components;
    viewport?: BUI.Viewport

}



export const componentsGridtemplate: BUI.StatefullComponent<ComponentsGridState> = (state) => {

    console.log("componentsGridtemplate: Ejecutando template. Estado recibido:", state);
    const { components, viewport } = state;
    console.log("componentsGridtemplate: Viewport extraído del estado:", viewport);


    const onCreated = (e?: Element) => {
        console.log("componentsGridtemplate: Callback onCreated disparado. Elemento:", e);

        if (!e) return;
        const grid = e as ComponentsGrid;
        // Usamos la aserción de tipo a la clase base BUI.Grid para tener flexibilidad.
        // const grid = e as BUI.Grid>;

        grid.elements = {
            viewport: {
                template: viewportContainerTemplate,
                initialState: { viewport }, // Pasando el viewport (que puede ser undefined) al siguiente template
            },
            itemsData: {
                template: itemsDataPanelTemplate,
                initialState: { components }, // Pasando los componentes al panel de datos
            }
        };

        grid.layouts = {
            Models: {
                template: `
                    "viewport itemsData" 1fr
                    /1fr 22rem
                `,
            },
        };
          // WORKAROUND: En grids anidados, el uso combinado de `grid.layouts` y `grid.layout`
        // parece tener un bug que causa el error "Cannot destructure property 'template'".
        // La solución más robusta es asignar el objeto de definición del layout directamente
        // a `grid.layout`, evitando el mecanismo de búsqueda interno del componente.
        // Aún puedes gestionar tus layouts en un diccionario y seleccionar el que necesites.
        // const availableLayouts = {
        //     Models: { template: `"viewport" 1fr / 1fr` },
            // Aquí puedes añadir más layouts en el futuro


        grid.layout = "Models"
        // SOLUCIÓN: En lugar de asignar el layout por su nombre (string), lo que
        // causa un error de temporización en grids anidados, hacemos la búsqueda
        // nosotros mismos y asignamos el objeto del layout directamente.
        // Esto permite mantener el diccionario `layouts` para futura escalabilidad.
        // grid.layout = grid.layouts.Models;


        // grid.layout = availableLayouts.Models;
        console.log("componentsGridtemplate: Grid interno configurado con layout directo.");
    }

    console.log("componentsGridtemplate: Devolviendo el template de <bim-grid>.");
    return BUI.html `<bim-grid ${BUI.ref(onCreated)} class="components-grid"></bim-grid>`
}

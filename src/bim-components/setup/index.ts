import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
import { createWorld, setupIfcLoader, setupFragmentManager, setupHighlighter } from "./src";
import { createLoadIfcHandler, loadModelBtnTemplate } from "../../ui-templates";


export const setupComponents = async () => {
    // Inicializa el gestor de UI de forma global al arrancar los componentes.
    // Esto asegura que todos los componentes de @thatopen/ui funcionarán correctamente.
    BUI.Manager.init();

    const components = new OBC.Components();
    const { world, viewport } = createWorld(components);

    // Configurar el IfcLoader ANTES de inicializar componentes
    setupIfcLoader(components);
    setupFragmentManager(components, world);
    setupHighlighter(components, world);

    // Inicializar componentes DESPUÉS
    await components.init();

    // // Crear el botón
    // const [loadModelsBtn] = BUI.Component.create(loadModelBtnTemplate, { components })

    // loadModelsBtn.style.position = "absolute";
    // loadModelsBtn.style.top = "1.5rem";
    // loadModelsBtn.style.left = "1.5rem";


    // viewport.appendChild(loadModelsBtn);


    return { components, viewport }
}

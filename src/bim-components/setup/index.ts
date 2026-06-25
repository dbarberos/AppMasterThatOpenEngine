import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
import { createWorld } from "./src";

export const setupComponents = async () => {
    // Inicializa el gestor de UI de forma global al arrancar los componentes.
    // Esto asegura que todos los componentes de @thatopen/ui funcionarán correctamente.
    BUI.Manager.init();

    const components = new OBC.Components();
    const { world, viewport } = createWorld(components);


    // components.init
    await components.init();


    return { components, viewport }
}

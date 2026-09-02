import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
import * as TEMPLATES from "../../../ui-templates";


export const createWorld = (components: OBC.Components) => {
    const worlds = components.get(OBC.Worlds);
    const world = worlds.create <
        OBC.SimpleScene,
        OBC.OrthoPerspectiveCamera,
        OBC.SimpleRenderer
        >();




    world.scene = new OBC.SimpleScene(components);
    world.scene.setup(); // basic lighting and grid
    world.scene.three.background = null; // just to have a transparent background for the viewport

    // const viewport = BUI.Component.create<BUI.Viewport>(
    //     () => {
    //         return BUI.html `<bim-viewport></bim-viewport>`;
    //     }
    // )



    // Forma simplificada y nativa recomendada por la librería para crear el viewport
    // Creamos el viewport como un HTMLElement directamente.
    const viewport = document.createElement("bim-viewport") as BUI.Viewport;

    // Creamos la toolbar/grid dentro del viewport
    const [viewportGrid] = BUI.Component.create(TEMPLATES.viewportGridTemplate, {
        components,
    });

    // Agregamos la toolbar al viewport
    viewport.appendChild(viewportGrid);

    // document.createElement("bim-viewport") crea una instancia real del elemento HTMLElement del viewport.
    // Este HTMLElement es lo que SimpleRenderer espera y también es un tipo que Lit puede renderizar directamente en sus plantillas sin problemas.



    world.renderer = new OBC.SimpleRenderer(components, viewport);

    // Ocultar el logo SVG en este visor específico
    world.renderer.showLogo = false;

    world.camera = new OBC.OrthoPerspectiveCamera(components);

    const resizeWorld = () => {
        try {
            world.renderer?.resize();
            world.camera.updateAspect();
        } catch (error) {
            console.warn("Resizing the world was not possible")
        }
    }

    viewport.addEventListener("resize", resizeWorld);

    //Raycaster is needed for the viewport to work, as it is used to handle mouse interactions
    components.get(OBC.Raycasters).get(world);

    //Añadimos para mostrar la rejilla 3D dentro del Viewport
    components.get(OBC.Grids).create(world)

    return {world, viewport}
}


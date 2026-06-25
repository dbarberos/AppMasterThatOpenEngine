import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";

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

// document.createElement("bim-viewport") crea una instancia real del elemento HTMLElement del viewport.
// Este HTMLElement es lo que SimpleRenderer espera y también es un tipo que Lit puede renderizar directamente en sus plantillas sin problemas.
// Al eliminar la envoltura de BUI.Component.create(), eliminamos el objeto no iterable que estaba causando el error.



    world.renderer = new OBC.SimpleRenderer(components, viewport);

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


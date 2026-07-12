import * as OBC from "@thatopen/components";

export const setupFragmentManager = (components: OBC.Components, world: OBC.SimpleWorld<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBC.SimpleRenderer>) => {
    const fragment = components.get(OBC.FragmentsManager);
    // The worker is set from the node_modules for simplicity purposes.
    // To build the app, the worker file should be set inside the public folder
    // at the root of the project and be referenced as "worker.mjs"
    fragment.init("/node_modules/@thatopen/fragments/dist/Worker/worker.mjs");

    fragment.list.onItemSet.add(async ({ value: model }) => {
        // useCamera is used to tell the model loaded the camera it must use in order to
        // update its culling and LOD state.
        // Culling is the process of not rendering what the camera doesn't see.
        // LOD stands from Level of Detail in 3D graphics (not BIM) and is used
        // to decrease the geometry detail as the camera goes further from the element.
        model.useCamera(world.camera.three);

        //The model is added to the world scene
        world.scene.three.add(model.object);

        //This is extremely important, as it instructs the Fragment Manager
        // the model must be updated because the configuration changed.
        await fragment.core.update(true)
    })
    //Para que cualquier cambio en la cámara (zoom, pan, rotate) actualice el estado de los modelos cargados
    world.camera.controls.addEventListener("rest", async () => {
            await fragment.core.update(true)
        })

}


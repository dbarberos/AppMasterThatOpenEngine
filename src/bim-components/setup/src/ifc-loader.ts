import * as OBC from "@thatopen/components"

export const setupIfcLoader = (components: OBC.Components) => {
    const ifcLoader = components.get(OBC.IfcLoader);
    ifcLoader.settings.autoSetWasm = false; //it tells the component we are going to manually configure its web-ifc.wasm path, so it doesn't try to load it automatically from the default location.

    //web-ifc loaded from internet. Solution inside the master
    ifcLoader.settings.wasm = {absolute: true, path: "https://unpkg.com/web-ifc@0.0.77/"};

    // Usar web-ifc instalado localmente en node_modules
//     ifcLoader.settings.wasm = {
//         absolute: true,
//         path: "/node_modules/web-ifc/",
//     };
}

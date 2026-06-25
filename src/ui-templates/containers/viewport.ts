import * as BUI from "@thatopen/ui";

/**
 * Deprecated by Containers.ts. This file is kept for reference and backward compatibility.
 * Es el empleado en el curso del master BIM Soft.Dev. para mostrar la estructura de un contenedor de viewport.
 * No aparecia en pantalla, pero se mantenia para referencia y compatibilidad con versiones anteriores.
 */


export interface VieportContainerState {
    viewport?: BUI.Viewport;
}


export const viewportContainerTemplate: BUI.StatefullComponent<VieportContainerState> = (state) => {
    let content: HTMLElement | undefined = state.viewport;
    if (!content) {
        content = BUI.Component.create(() => BUI.html`
        <bim-label>No viewer has been defined.</bim-label>
        `,)
    };
    return BUI.html`<div class="viewport-container"
            style="width: 100%; height: 100%; display: flex; overflow: hidden;">
            ${content}
        </div>`;


}

import * as BUI from "@thatopen/ui";

/**
 * Template para el contenedor del Viewport.
 * Utiliza los webcomponents de @thatopen/ui para estructurar el visor 3D
 * y una interfaz flotante.
 */
export const viewportContainerTemplate = (state?: { viewport?: BUI.Viewport }) => {
    const { viewport } = state || {};

    const onCreated = (content: HTMLElement | undefined) => {
        if (!content || !viewport) {
            content = BUI.Component.create(() => BUI.html`
            <bim-label>No viewer has been defined.</bim-label>
            `,)
            return;
        }

        // Limpiar hijos previos
        content.innerHTML = '';

        // Aplicar estilos al viewport para que ocupe el espacio disponible
        if (viewport) {
            viewport.style.width = '100%';
            viewport.style.height = '100%';
            viewport.style.display = 'flex';
            viewport.style.overflow = 'hidden';
        }

        // Inyectar el viewport en el contenedor
        content.appendChild(viewport);

        // Disparar evento resize para que el renderer se ajuste a las nuevas dimensiones
        setTimeout(() => {
            viewport?.dispatchEvent(new Event('resize'));
        }, 100);

        console.log("viewportContainerTemplate: Viewport inyectado en el contenedor");
    };

    return BUI.html`
        <div
            ${BUI.ref(onCreated)}
            style="width: 100%; height: 100%; display: flex; overflow: hidden;">
        </div>
    `;
};

/**
 * Template base para un visor simple.
 */
export const viewerTemplate = () => {
    return BUI.html`<div class="viewer-container">${viewportContainerTemplate()}</div>`;
};

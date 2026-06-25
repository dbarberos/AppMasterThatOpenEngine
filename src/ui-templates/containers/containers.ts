import * as BUI from "@thatopen/ui";

/**
 * Template para el contenedor del Viewport.
 * Utiliza los webcomponents de @thatopen/ui para estructurar el visor 3D
 * y una interfaz flotante.
 *
 * containers.ts es un archivo variante independiente de viewport.ts que ajusta las dimensiones del viewport y maneja la inyección del mismo en el contenedor.
 * Aunque ambos archivos contienen un viewportContainerTemplate, este archivo es el que actualmente se está utilizando en tu componentsGridtemplate.
 * Por lo tanto, cualquier cambio en containers.ts afectará directamente a la forma en que se renderiza el viewport dentro de tu grid.

containers.ts contiene el viewportContainerTemplate que estamos usando desde tu grid.
containers/viewport.ts es otro archivo distinto y no es el que está actualmente conectado en tu componentsGridtemplate.
Así que sí: containers.ts es una variante separada, no la misma implementación que containers/viewport.ts.
 */



export const viewportContainerTemplate = (state?: { viewport?: BUI.Viewport }) => {
    const { viewport } = state || {};

    const onCreated = (container: HTMLDivElement) => {
        if (!container || !viewport) {
            container = BUI.Component.create(() => BUI.html`
            <bim-label>No viewer has been defined.</bim-label>
            `,)
            return;
        }

        // Limpiar hijos previos
        container.innerHTML = '';

        // Aplicar estilos al viewport para que ocupe el espacio disponible
        if (viewport) {
            viewport.style.width = '100%';
            viewport.style.height = '100%';
            viewport.style.display = 'flex';
            viewport.style.overflow = 'hidden';
        }

        // Inyectar el viewport en el contenedor
        container.appendChild(viewport);

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

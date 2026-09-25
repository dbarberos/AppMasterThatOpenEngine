import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import { appIcons } from "../../global";
import * as THREE from "three";

import * as FRAGS from "@thatopen/fragments";


const originalMaterialsData = new Map<
    FRAGS.BIMMaterial,
    { color: number; transparent: boolean; opacity: number; lodOpacity?: number }
>()

const logToolbar = (message: string, details?: unknown) => {
    console.debug(`[viewport-toolbar] ${message}`, details ?? "");
};


export interface ViewerToolbarState {
    components: OBC.Components
}

export const viewerToolbarTemplate: BUI.StatefullComponent<ViewerToolbarState> = (state) => {
    const { components } = state;

    let colorInput: BUI.ColorInput | undefined;

    const onInputCreated = (e?: Element) => {
        console.debug("[viewport-toolbar] onInputCreated", { element: e });
        if (!e) {
            console.warn("[viewport-toolbar] Color input was not created");
            return;
        }
        colorInput = e as BUI.ColorInput;
        logToolbar("Color input is ready");
    };

    const onApplyColor = async ({ target: button }: {target: BUI.Button}) => {
        logToolbar("onApplyColor called", { colorInputReady: Boolean(colorInput) });
        if (!colorInput) {
            console.warn("[viewport-toolbar] Cannot apply color: color input is unavailable");
            return;
        }
        const { color } = colorInput;
        const highlighter = components.get(OBF.Highlighter);
        const selection = highlighter.selection.select;
        logToolbar("Applying color to selection", { color, selection });
        if (OBC.ModelIdMapUtils.isEmpty(selection)) {
            console.warn("[viewport-toolbar] Cannot apply color: selection is empty");
            return;
        }

        button.loading = true;

        if (!highlighter.styles.has(color)) {
            highlighter.styles.set(color, {
                color: new THREE.Color(color),
                renderedFaces: 1,
                opacity: 1,
                transparent: false,
            });
        }

        await Promise.all([highlighter.highlightByID(
            color,
            selection,
            false,
            false,
        ),
            highlighter.clear("select")])

        button.loading = false;
        logToolbar("Color applied successfully", { color });
        BUI.ContextMenu.removeMenus();
    };

    const onReset = async ({ target }: { target: BUI.Button }) => {
        logToolbar("onReset called");
        target.loading = true;
        const highlighter = components.get (OBF.Highlighter)
        await highlighter.clear ()
        BUI.ContextMenu.removeMenus()
        target.loading = false;
        logToolbar("Selection highlighting reset");
    }


    const onHide = async ({ target }: { target: BUI.Button }) => {
        logToolbar("onHide called");
        const highlighter = components.get(OBF.Highlighter);
        const selection = highlighter.selection.select;
        if (OBC.ModelIdMapUtils.isEmpty(selection)) {
            console.warn("[viewport-toolbar] Cannot hide: selection is empty");
            return;
        }
        target.loading = true;
        const hider = components.get(OBC.Hider);
        const promises = [hider.set(false, selection), highlighter.clear("select")];
        await Promise.all(promises);
        target.loading = false;
        logToolbar("Selection hidden", { selection });
    }

    const onIsolate = async ({ target }: { target: BUI.Button }) => {
        logToolbar("onIsolate called");
        const highlighter = components.get(OBF.Highlighter);
        const selection = highlighter.selection.select;
        if (OBC.ModelIdMapUtils.isEmpty(selection)) {
            console.warn("[viewport-toolbar] Cannot isolate: selection is empty");
            return;
        }
        target.loading = true;
        const hider = components.get(OBC.Hider);
        await hider.isolate(selection);
        target.loading = false;
        logToolbar("Selection isolated", { selection });
    }
    const OnShowAll = async ({ target }: { target: BUI.Button }) => {
        logToolbar("OnShowAll called");
        target.loading = true;
        const hider = components.get(OBC.Hider);
        await hider.set(true);
        target.loading = false;
        logToolbar("All model elements shown");
    }

    const setModelTransparency = (opacity: number) => {
        logToolbar("setModelTransparency called", { opacity });
        const fragments = components.get(OBC.FragmentsManager);
        const materials = [...fragments.core.models.materials.list.values()];
        let changedMaterials = 0;

        for (const material of materials) {
            if (material.userData.customId) {
                logToolbar("Skipping custom material", { material });
                continue;
            }
            let color: number | undefined;
            let lodOpacity: number | undefined;
            if ("color" in material) {
                color = material.color.getHex();
            } else {
                color = material.lodColor.getHex();
                lodOpacity = material.uniforms.lodOpacity.value
            }
            originalMaterialsData.set(material, {
                color,
                transparent: material.transparent,
                opacity: material.opacity,
                lodOpacity,
            })

            material.transparent = true;
            if ("color" in material) {
                material.opacity = opacity;
                material.color.setColorName("white");

            } else {
                material.uniforms.lodColor.value.setColorName("white");
                material.uniforms.lodOpacity.value = opacity
            }
            material.needsUpdate = true;
            changedMaterials += 1;

        }
        logToolbar("Model transparency applied", {
            totalMaterials: materials.length,
            changedMaterials,
            storedMaterials: originalMaterialsData.size,
        });
    };

    const restoreTransparency = () => {
        logToolbar("restoreTransparency called", { storedMaterials: originalMaterialsData.size });
        let restoredMaterials = 0;
        for (const [material, data] of originalMaterialsData) {
            const { color, transparent, opacity, lodOpacity } = data;

            material.transparent = transparent;
            if ("color" in material) {
                material.opacity = opacity;
                material.color.setHex(color);

            } else {
                material.uniforms.lodColor.value.setHex(color);
                material.uniforms.lodOpacity.value = lodOpacity
            }
            material.needsUpdate = true;
            restoredMaterials += 1;
        }
        originalMaterialsData.clear();
        logToolbar("Original material state restored", { restoredMaterials });
    }

    const onToggleGhost = () => {
        logToolbar("onToggleGhost called", {
            ghostActive: originalMaterialsData.size > 0,
            storedMaterials: originalMaterialsData.size,
        });
        if (originalMaterialsData.size > 0) {
            restoreTransparency();
        } else {
            setModelTransparency(0.05);
        }
        logToolbar("onToggleGhost completed", {
            ghostActive: originalMaterialsData.size > 0,
            storedMaterials: originalMaterialsData.size,
        });
    }


    return BUI.html`
        <div style="display: flex; justify-content: center; width: 100%; padding: 0.5rem; ;">
            <bim-toolbar style="display: flex; flex-direction: row; gap: 0.5rem; padding: 0.5rem; background: rgba(0, 0, 0, 0.8); border-radius: var(--bim-panel-section--bdrs, 0.75rem);; width: fit-content;">
                <bim-toolbar-section label="Visibility" icon=${appIcons.SHOW}>
                    <bim-button icon=${appIcons.SHOW} label="Show All" @click=${OnShowAll}></bim-button>
                    <bim-button icon=${appIcons.TRANSPARENT} label="Toggle Ghost" @click=${onToggleGhost}></bim-button>
                </bim-toolbar-section>
                <bim-toolbar-section label="Selection" icon=${appIcons.SELECT}>
                    <bim-button icon=${appIcons.HIDE} label="Hide" @click=${onHide}></bim-button>
                    <bim-button icon=${appIcons.ISOLATE} label="Isolate" @click=${onIsolate}></bim-button>
                    <bim-button icon=${appIcons.COLORIZE} label="Colorize">
                        <bim-context-menu>
                            <div style="display: flex; flex-direction: column; gap: 0.5rem; padding: 0.5rem;">
                                <bim-color-input ${BUI.ref(onInputCreated)}></bim-color-input>
                                <div style="display: flex; gap: 0.5rem">
                                    <bim-button @click=${onApplyColor} icon=${appIcons.APPLY} label="Apply"></bim-button>
                                    <bim-button icon=${appIcons.CLEAR} label="Reset" @click=${onReset}></bim-button>
                                </div>
                            </div>
                        </bim-context-menu>
                    </bim-button>
                </bim-toolbar-section>
            </bim-toolbar>
        </div>
    `;
}





import { ProjectsManager } from "./ProjectsManager"


//Storage the state of the checkbox sidebar-active
const sidebarActiveCheckbox = document.getElementById("sidebar-active") as HTMLInputElement

//Recover the state of the checkbox from the local storage
const sidebarActiveState = localStorage.getItem("sidebar-active")
if (sidebarActiveState === "active" && sidebarActiveCheckbox !== null) {
    sidebarActiveCheckbox.checked = true
}

//Adding an eventListener to the sidebar-active checkbox in order to update the local storage when the checkbox change of state
sidebarActiveCheckbox?.addEventListener('change', () => {
    // Save the state in the Local Storage
    if (sidebarActiveCheckbox.checked) {
        localStorage.setItem("sidebar-active", "active");
    } else {
        localStorage.setItem("sidebar-active", "");
    }
});





export function showModal(id: string) {
    const modal = document.getElementById(id)
    if (modal && modal instanceof HTMLDialogElement) {
        modal.showModal()
    } else {
        console.warn("No modal found related with the provided ID", id)
    }
}
export function closeModal(id: string) {
    const modal = document.getElementById(id)
    if (modal && modal instanceof HTMLDialogElement) {
        modal.close()
    } else {
        console.warn("No modal found related with the provided ID", id)
    }
}

export function toggleModal(id: string) {
    const modal = document.getElementById(id)
    if (modal && modal instanceof HTMLDialogElement) {
        modal.open ? modal.close() : modal.showModal()
    } else {
        console.warn("No modal found related with the provided ID", id)
    }
}

export function closeModalProject(id: string, projectsManager: ProjectsManager) {
    console.log(`Intentando cerrar modal: ${id}`);


    

    const confirmBtn = document.getElementById("confirm-json-list")
    const cancelProjectBtn: Element | null = document.getElementById("cancel-json-list-btn")

    if (confirmBtn && projectsManager.confirmBtnClickListener) {
        confirmBtn.removeEventListener("click", projectsManager.confirmBtnClickListener)
        console.log("Listener de confirmación removido");
    }

    
    if (cancelProjectBtn) {
        if (projectsManager.cancelExportProjectBtnClickListener) {
            cancelProjectBtn.removeEventListener("click", projectsManager.cancelExportProjectBtnClickListener)
            console.log("Listener de cancelar exportación removido");
        }
        if ( projectsManager.cancelImportProjectBtnClickListener) {
            cancelProjectBtn.removeEventListener("click", projectsManager.cancelImportProjectBtnClickListener)
            console.log("Listener de cancelar importació removido");
        }
    }

    // const cancelExportProjectBtn: Element | null = document.getElementById("cancel-json-list-btn")
    // if (cancelExportProjectBtn && projectsManager.cancelExportProjectBtnClickListener) {
    //     cancelExportProjectBtn.removeEventListener("click", projectsManager.cancelExportProjectBtnClickListener)
    // }
    // const cancelImportProjectBtn: Element | null = document.getElementById("cancel-json-list-btn")
    // if (cancelImportProjectBtn && projectsManager.cancelImportProjectBtnClickListener) {
    //     cancelImportProjectBtn.removeEventListener("click", projectsManager.cancelImportProjectBtnClickListener)
    // }


    const modal = document.getElementById(id)
    if (modal && modal instanceof HTMLDialogElement) {
        console.log('Cerrando modal:', id);
        modal.close()

    } else {
        console.warn("No modal found related with the provided ID", id)
    }
    
}

export function changePageContent(pageToShow: string, modeDisplay: string) {
    const showPage = document.querySelector<HTMLElement>(`#${pageToShow}`)
    if (!showPage) { return }

    //Show the page to Show
    showPage.style.display = modeDisplay
    console.log(`show the loaded page: ${pageToShow}`);
    

    //Hide the rest of pages of the content area.We keep asidea area rest in peace
    const allPages = document.querySelectorAll<HTMLElement>("[data-page]")
    allPages.forEach(page => {
        if (page.id !== pageToShow) {
            page.style.display = "none"
            console.log(`hide the page: ${page.id}`);
        }
    })
    // Actualize localStorage
    localStorage.setItem("pageWIP", pageToShow);

}

export function showPageContent(pageToShow: string, modeDisplay: string) {
    const showPage = document.querySelector<HTMLElement>(`#${pageToShow}`)
    if (!showPage) { return }
    showPage.style.display = modeDisplay
}

export function hidePageContent(pageToHide: string) {
    const hidePage = document.querySelector<HTMLElement>(`#${pageToHide}`)
    if (!hidePage) { return }
    hidePage.style.display = "none"
}


// Function to load the page saved in localStorage on startup
function loadSavedPage() {
    const savedPage = localStorage.getItem("pageWIP");
    if (savedPage) {
        changePageContent(savedPage, 'block');
    }
}

// Invoke loadSavedPage upon DOMContentLoaded
document.addEventListener("DOMContentLoaded", loadSavedPage);
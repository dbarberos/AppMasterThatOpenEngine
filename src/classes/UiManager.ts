import { ProjectsManager } from "./ProjectsManager"



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
    const modal = document.getElementById(id)
    if (modal && modal instanceof HTMLDialogElement) {
        modal.close()
    } else {
        console.warn("No modal found related with the provided ID", id)
    }
    const confirmBtn = document.getElementById("confirm-json-list")
    if (confirmBtn && projectsManager.confirmBtnClickListener) {
        confirmBtn.removeEventListener("click", projectsManager.confirmBtnClickListener)
    }
    const cancelExportProjectBtn: Element | null = document.getElementById("cancel-json-list-btn")
    if (cancelExportProjectBtn && projectsManager.cancelExportProjectBtnClickListener) {
        cancelExportProjectBtn.removeEventListener("click", projectsManager.cancelExportProjectBtnClickListener)
    }
    const cancelImportProjectBtn: Element | null = document.getElementById("cancel-json-list-btn")
    if (cancelImportProjectBtn && projectsManager.cancelImportProjectBtnClickListener) {
        cancelImportProjectBtn.removeEventListener("click", projectsManager.cancelImportProjectBtnClickListener)
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
}
    
    // export function changePageContent(pageToShow: string, pageToHide: string, modeDisplay: string) {
    //     const showPage = document.querySelector<HTMLElement>(pageToShow)
    //     const hidePage = document.querySelector<HTMLElement>(pageToHide)
    //     if (!showPage || !hidePage) { return }
    //     showPage.style.display = modeDisplay
    //     hidePage.style.display = "none"

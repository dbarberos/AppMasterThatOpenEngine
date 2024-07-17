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


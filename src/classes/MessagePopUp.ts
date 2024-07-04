import { showModal, closeModal, toggleModal } from "../index"

export class MessagePopUp {
    name: string
    title: "error" | "warning" | "info" | "success" | "update"
    message: string
    icon: string
    nameClass: string
    ui: HTMLElement
    parent :HTMLElement

    setIcon(): string {
        switch (this.title) {
            case "error":
                return "report"
                break;
            case "warning":
                return "warning"
                break;
            case "success":
                return "check_circle"
                break;
            case "info":
                return "notifications_active"
                break;
            case "update":
                return "info"
                break;
            default:
                return "radio_button_unchecked"
                break;
        }
    }

    setNameClass(): string {
        switch (this.nameClass) {
            case "error":
                return "popup-error"
                break;
            case "warning":
                return "popup-warning"
                break;
            case "info":
                return "popup-info"
                break;
            case "success":
                return "popup-success"
                break;
            case "update":
                return "info"
                break;
            default:
                return ""
                break;
        }
    }

    constructor(container: HTMLElement, error: Error, title: "error" | "warning" | "info" | "success" | "update") {
        this.name = error.name
        this.title = title
        this.message = error.message
        this.icon = this.setIcon()
        this.nameClass = this.setNameClass()
        this.parent = container
    }


    showError() {
        this.ui = document.createElement("dialog");
        this.ui.classList.add(this.nameClass);
        this.ui.id = "message-popup";
        this.ui.innerHTML = `
            <div class="message-popup">
                <div style="display: flex; column-gap: var(--gap-lg); align-items: center;">
                    <div id="message-popup-icon">
                        <span class="material-icons-round" style="font-size: var(--font-icon-lg);">
                        ${this.icon}
                        </span>
                    </div>
                    <div id="message-popup-text"  style="display: flex; flex-direction: column; justify-content: start;row-gap: var(--gap-5xs);">
                        <h5 style="font-weight: bold;">${this.title}</h5>
                        <p>${this.message}</p>
                    </div>
                </div>
                <button class="btn-popup">
                    <div class="popup-text">Got it</div>
                </button>
            </div>
            `;
        this.parent.appendChild(this.ui)
            (this.ui as HTMLDialogElement).showModal()
        const closeBtn = this.ui.querySelector(".btn-popup")
        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                (this.ui as HTMLDialogElement).close()
                this.ui.remove()
            })
        }
    }    
}




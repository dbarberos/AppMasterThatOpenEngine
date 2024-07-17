import { showModal, closeModal, toggleModal } from "./ModalManager"


export class MessagePopUp {
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
        const icon = this.setIcon()
        switch (icon) {
            case "report":
                return "popup-error"
                break;
            case "warning":
                return "popup-warning"
                break;
            case "notifications_active":
                return "popup-info"
                break;
            case "check_circle":
                return "popup-success"
                break;
            case "info":
                return "popup-update"
                break;
            default:
                return "popup-default"
                break;
        }
    }

    constructor(
        container: HTMLElement,
        title: "error" | "warning" | "info" | "success" | "update",
        messageText: string
    ) {
        this.title = title
        this.message = messageText
        this.icon = this.setIcon()
        this.nameClass = this.setNameClass()
        this.parent = container
    }


    showMessageError() {
        //Check is a dialog already exist
        const existingDialog = this.parent.querySelector(".nameClass")
        if (existingDialog && this.parent.contains(existingDialog)) {
            //Remove the existing dialog only if it´s a child of this.parent
            this.parent.removeChild(existingDialog)
            }            
        
        //Create a new dialog element
        this.ui = document.createElement("dialog");
        this.ui.classList.add(this.nameClass);
        this.ui.id = "message-error-popup";
        //Set the dialog content
        this.ui.innerHTML = `
            <div class="message-popup">
                <div style="display: flex; column-gap: var(--gap-lg); align-items: center;">
                    <div id="message-popup-icon">
                        <span class="material-icons-round" style="font-size: var(--font-icon-lg);">
                        ${this.icon}
                        </span>
                    </div>
                    <div id="message-popup-text"  style="display: flex; flex-direction: column; justify-content: start;row-gap: var(--gap-5xs);">
                        <h5 style="font-weight: bold; text-transform: uppercase;">${this.title}</h5>
                        <p>${this.message}</p>
                    </div>
                </div>
                <button class="btn-popup">
                    <div id="btn-popup-text">Got it</div>
                </button>
            </div>
            `;
        this.parent.appendChild(this.ui);
        (this.ui as HTMLDialogElement).showModal();
        const closeBtn = this.ui.querySelector(".btn-popup");

        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                (this.ui as HTMLDialogElement).close()
                this.ui.remove()
            })
        };
  
    }
}    





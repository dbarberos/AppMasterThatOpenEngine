import { showModal, closeModal, toggleModal } from "./UiManager"


export class MessagePopUp {
    type: "error" | "warning" | "info" | "success" | "update" | "message" | "clock" | "arrowup"
    title: string
    message: string
    icon: string
    nameClass: string
    ui: HTMLElement
    parent: HTMLElement
    messageHeight: string /// New feature
    actions: []

    setIcon(): string {
        switch (this.type) {
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
                return "update"
                break;
            case "message":
                return "message"
                break;
            case "clock":
                return "clock"
                break;
            case "arrowup":
                return "arrowup"
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
            case "update":
                return "popup-update"
                break;
            case "check_circle":
                return "popup-success"
                break;
            case "message":
                return "popup-message"
                break;
            case "clock":
                return "popup-clock"
                break;
            case "uparrow":
                return "popup-uparrow"
                break;
            default:
                return "popup-default"
                break;
        }
    }

    constructor(
        container: HTMLElement,
        type: "error" | "warning" | "info" | "success" | "update" | "message" | "clock" | "arrowup",
        title: string,
        messageText: string,
        btnActions: [],
        messageHeight?: string /// New feature, ? symbol makes it optional
    ) {
        this.type = type
        this.title = title
        this.message = messageText
        this.icon = this.setIcon()
        this.nameClass = this.setNameClass()
        this.parent = container
        this.actions = btnActions
        this.messageHeight = messageHeight || "200" /// New feature
        // this.showNotificationMessage()
    }

    // private getDefaultHeight(): string {
    //     // Get the default height from the parent container's computed style
    //     const computedStyle = window.getComputedStyle(this.parent);
    //     return computedStyle.getPropertyValue('height'); 
    // }




    showNotificationMessage(buttonCallbacks: { [action: string]: () => void } = {}): Promise<void> {
        return new Promise((resolve) => {
            //Check is a dialog already exist
            const existingDialog = this.parent.querySelector(".nameClass")
            if (existingDialog && this.parent.contains(existingDialog)) {
                // existingDialog.remove


                //Remove the existing dialog only if it´s a child of this.parent
                this.parent.removeChild(existingDialog)
                }            
            
            //Create a new dialog element
            this.ui = document.createElement("dialog");
            this.ui.classList.add(this.nameClass);
            this.ui.id = "message-error-popup";

            //Create the buttons according to actions array
            let buttonsHTML = "";
            if (this.actions && this.actions.length > 0) { // Check if actions is defined and not empty
                this.actions.forEach(action => {
                    buttonsHTML += `<button style="all=initial" class="message-btn" data-action="${action}"><span class="message-btn-text">${action}</span></button>`;
                });
            } else {
                // Handle the case where actions is undefined or empty
                buttonsHTML = '<button style="all=initial" class="message-btn"><span class="message-btn-text">ok</span></button>'; // Default button
            }
            
            //Set the dialog content
            this.ui.innerHTML = `
                <div class="message-popup" >
                    <div class="message-content toast toast-${this.nameClass}" style="height: ${this.messageHeight}">
                        <div id="message-popup-icon" class="message-icon toast-icon" >
                            <svg class="message-icon-svg" role="img" aria-label="${this.icon}" width="100px" height="100px">
                                <use href="#${this.icon}"></use> 
                            </svg>
                        </div>
                        <div class="message_text" id="message-popup-text"  style="display: flex; flex-direction: column; justify-content: start;row-gap: var(--gap-5xs);">
                            <h5 class="message-text-title" >${this.title}</h5>
                            <p class="message-text-message">${this.message}</p>
                        </div>
                        <div class="message-btns">
                        ${buttonsHTML}
                        </div>
                    </div>                
                </div>
                `;
            
            // <div id="message-popup-icon" class="message-icon >
            //     <span span class="material-icons-round" class="message-icon-svg" >
            //         ${ this.icon }
            //      </span>
            //  </div>
            
            this.parent.appendChild(this.ui);
            (this.ui as HTMLDialogElement).showModal();

            // Automatically focus on the newly opened dialog ***
            this.ui.focus()

            //Prevent the use of the keydown Escape
            this.ui.addEventListener('keydown', (event) => {
                if (event.code === 'Escape') {
                    event.stopPropagation()
                    event?.preventDefault()
                }
            })

            // *** Use a mutation observer to wait for ALL buttons ***
            const observer = new MutationObserver((mutations) => {
                // Check if the number of buttons matches the actions array
                const buttons = this.ui.querySelectorAll('.button-popup'); // Select all buttons
                if (buttons.length === this.actions.length) {
                    observer.disconnect(); // Stop observing
                    // resolve(); // Resolve the Promise, indicating all buttons are ready
                }
            })           
            observer.observe(this.ui, { childList: true, subtree: true }); // Observe for changes
            
            // *** Attach event listeners to ALL buttons AFTER adding the dialog to the DOM ***
            const buttons = this.ui.querySelectorAll('.message-btn');
            buttons.forEach(button => {
                const action = button.getAttribute("data-action");
                if (action && buttonCallbacks[action]) {
                    button.addEventListener("click", () => {
                        buttonCallbacks[action](); // Execute the callback for this action                        
                    });
                }
            });
            
            resolve(); // Resolve the Promise after attaching event listeners
        }); 
    }
    
    
    closeMessageModal() {
        if (this.ui instanceof HTMLDialogElement) {
            this.ui.close();
            this.ui.remove(); // Optional: Remove the dialog from the DOM after closing
            }
    }
    


}    





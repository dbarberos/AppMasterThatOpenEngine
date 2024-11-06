import { MessagePopUp } from "./MessagePopUp"
import { showModal, closeModal, toggleModal, closeModalProject, changePageContent, showPageContent, hidePageContent } from "./UiManager"

export function toUpperCase(input: HTMLInputElement) {
    input.value = input.value.toUpperCase();
}

// Alltext inside the input is in capital letters
// Add the DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", () => {
    // Select all inputs elements with the data-uppercase attribute
    const inputsToConvert = document.querySelectorAll('input[data-uppercase]');
    
    // Check if the input element were found
    if (inputsToConvert.length > 0) {
        // Add an event listener to each input element
        inputsToConvert.forEach(input => {
            // Type assertion to ensure it's an HTMLInputElement
            if (input instanceof HTMLInputElement) {
                input.addEventListener("input", () => {
                    // Convert the input value to uppercase
                    toUpperCase(input);
                });
            }
        });
    }
});



//Take the actual date for use it in the form in case the user do not give one.
export function getActualDate () {
    const getActualDate = new Date();
    const finishDateInput = document.getElementById('finishDateInput') as HTMLInputElement;;
    if (finishDateInput) {
    const month = (getActualDate.getMonth() + 1).toString().padStart(2, "0")
    const day = getActualDate.getDate().toString().padStart(2, "0")
    finishDateInput.value = `${getActualDate.getFullYear()}-${month}-${day}`
    } else {
        console.error('No input element with id "finishDateInput" found.');
    }
}




//Set the minimum date for de todo Issue Form as de date of tomorrow
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const minDate = tomorrow.toISOString().split('T')[0];

const dueDateElement = document.getElementById("todo-dueDate") as HTMLInputElement
const dueDateDetailsInputElement = document.getElementById("todo-dueDate-details-input") as HTMLInputElement
const dueDateFinishProjectElement = document.getElementById("finisProjecthDate") as HTMLInputElement

if (dueDateElement && dueDateDetailsInputElement) {

    dueDateElement.min = minDate
    dueDateDetailsInputElement.min = minDate
    dueDateFinishProjectElement.min = minDate
    
} else {
    console.error("One or both of the elements with IDs 'todo-dueDate' and 'todo-dueDate-details-input' do not exist.")
}



//Sanitization of the ToDo Textarea Issue with JavaScript
export function sanitizeHtml(html) {
    // Allowed tags
    const allowedTags = ['p', 'br', 'strong', 'em', 'span']
    // Allowed attributes
    const allowedAttributes = ['style']

    // Create a new document fragment to hold the sanitized HTML
    const sanitizedFragment = document.createDocumentFragment()

    // Parse the HTML string into a DOM
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    function sanitizeElement(element) {
        if (!element) {
            return document.createTextNode("")  
        }

        if (element.nodeType === Node.TEXT_NODE) {
            return document.createTextNode(element.nodeValue)
        } else if (element.nodeType === Node.ELEMENT_NODE) {
            if (allowedTags.includes(element.tagName.toLowerCase())) {
                const newElement = document.createElement(element.tagName)
                for (const attribute of element.attributes) {
                    if (allowedAttributes.includes(attribute.name.toLowerCase())) {
                        newElement.setAttribute(attribute.name, attribute.value)
                    }
                }
                for (const child of element.childNodes) {
                    newElement.appendChild(sanitizeElement(child))
                }            
                return newElement;
            } else {
                return document.createTextNode(element.outerHTML)
            }
        } else {
            return document.createTextNode('')
        }
    }
    for (const element of doc.body.childNodes) {
        sanitizedFragment.appendChild(sanitizeElement(element))
    }

    // Create a new div element
    const sanitizedDiv = document.createElement('div')

    // Append the sanitized content to the div
    sanitizedDiv.appendChild(sanitizedFragment)

    // Now you can access the innerHTML of the div
    // Before returning the sanitized HTML, replace <br> with newline characters
    const sanitizedHtml = sanitizedDiv.innerHTML.replace(/<br>/g, '\n')
    return sanitizedDiv.innerHTML;
}


//Slidding bar inside Users-Header
document.addEventListener("DOMContentLoaded", function () {
    const navLinks = document.querySelectorAll("#users-sliding-nav1  a");
    const slideUsers1 = document.querySelector("#users-sliding-nav1 .users-slide1") as HTMLElement | null;
    const slideUsers2 = document.querySelector("#users-sliding-nav1 .users-slide2") as HTMLElement | null;

    const container = document.querySelector("#users-sliding-nav1")as HTMLElement;

    // Function to set the position of the slider
    const setSliderPosition = (link: HTMLElement) => {
        if (slideUsers1 && container) {
            const position = link.offsetLeft;
            const width = link.offsetWidth;
            slideUsers1.style.opacity = "1";
            slideUsers1.style.left = `${position}px`;
            slideUsers1.style.width = `${width}px`;
        }
        // Save the selected tab to localStorage
        localStorage.setItem("selectedUsersTab", link.getAttribute("href") || "");

        // Show the corresponding content
        const contentId = link.getAttribute("href")?.substring(2); // Remove the '#/' from the href
        if (contentId) {
            showPageContent(contentId === 'users' ? 'users-index' : 'teams-page', 'block');
            hidePageContent(contentId === 'users' ? 'teams-page' : 'users-index');
            localStorage.setItem("pageWIP", contentId === 'users' ? 'users-page' : 'teams-page');
        }
    };



    // Initialize the position of the first tab
    const setInitialPosition = () => {
        const savedTab = localStorage.getItem("selectedUsersTab") || "#/users";
        const defaultLink = document.querySelector(`#users-sliding-nav1 a[href="${savedTab}"]`) as HTMLElement;
        if (defaultLink) {
            setSliderPosition(defaultLink);
        }


        // const currentLink = navLinks[0]; // First link
        // if (currentLink && slideUsers1 && slideUsers2 && container) {
        //     const currentWidth = currentLink.offsetWidth;
        //     const currentPosition = currentLink.offsetLeft;
        //     slideUsers1.style.left = `${currentPosition}px`;
        //     slideUsers1.style.width = `${currentWidth}px`;
        // }
    };

    // Handle click on links
    navLinks.forEach(link => {
        link.addEventListener("click", function (this: HTMLElement, event: Event) {
            event.preventDefault();
            setSliderPosition(this);
        });

        // Handle mouseover on links
        link.addEventListener("mouseover", function (this: HTMLElement) {
            if (container && slideUsers2) {
                const position = this.offsetLeft;
                const width = this.offsetWidth;
                slideUsers2.style.opacity = "1";
                slideUsers2.style.left = `${position}px`;
                slideUsers2.style.width = `${width}px`;
                slideUsers2.classList.add("squeeze");
            }
        });

        // Handle mouseout on links
        link.addEventListener("mouseout", function () {
            if (slideUsers2) {
                slideUsers2.style.opacity = "0";
                slideUsers2.classList.remove("squeeze");
            }
        });
    });

    // Initialize position on page load
    setInitialPosition();

    // Handle #asideBtnUsers click
    const asideBtnUsers = document.querySelector('#asideBtnUsers');
    if (asideBtnUsers) {
        asideBtnUsers.addEventListener('click', () => {
            const savedTab = localStorage.getItem("selectedUsersTab") || "#/users";
            const usersLink = document.querySelector(`#users-sliding-nav1 a[href="${savedTab}"]`) as HTMLElement;
            if (usersLink) {
                setSliderPosition(usersLink);
            }
        });
    }

});

// Function to initialize tab functionality of the slidding users-bar
function initializeTabs() {
    const usersTab = document.querySelector('a[href="#/users"]');
    const teamsTab = document.querySelector('a[href="#/teams"]');

    usersTab?.addEventListener('click', (event) => {
        event.preventDefault(); 
        showPageContent('users-index', 'block'); 
        hidePageContent('teams-page'); 
        localStorage.setItem("pageWIP", "users-page");
    });

    teamsTab?.addEventListener('click', (event) => {
        event.preventDefault(); 
        showPageContent('teams-page', 'block'); 
        hidePageContent('users-index'); 
        localStorage.setItem("pageWIP", "teams-page");
    });
}

// Call the function to initialize tabs when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", initializeTabs);
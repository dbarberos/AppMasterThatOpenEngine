import { MessagePopUp } from "./MessagePopUp"

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










// Pasado a ToDoManager
// // Introduce and store tags for the To-DO Input element
// const tagsInput = document.getElementById('todo-tags-input');
// const tagsList = document.getElementById('todo-tags-list');

// if (tagsInput) {
//     tagsInput.addEventListener('keydown', (e) => {
//         const inputValue = (e.target as HTMLInputElement).value.trim()
//         if ((e.key === "Enter") && inputValue) {
//             e.preventDefault()
//             const newTags = inputValue.split(/[,]+/).filter((tag) => tag !== "");
//             if (Array.isArray(newTags)) {
//                 newTags.forEach(tagText => {
//                     // Check if the tag already exists in the list
//                     const existingTag = Array.from(tagsList?.children ?? []).find(child =>
//                         child.textContent?.trim().toLowerCase() === tagText.toLowerCase()
//                     );

//                     if (existingTag) {
//                         // Tag already exists, show error message
//                         const existTagPopup = new MessagePopUp(
//                             document.body,
//                             "warning",
//                             "Duplicate Tag",
//                             `The tag "${tagText}" already exists.`,
//                             ["Got it"]
//                         );
//                         // Define button callback
//                         const buttonCallbacks = {
//                             "Got it": () => {
//                                 existTagPopup.closeMessageModal();
//                             }
//                         }
//                         existTagPopup.showNotificationMessage(buttonCallbacks);
//                     } else {

//                         // Tag is new, add it to the list
//                         const tag = document.createElement('li')
//                         tag.textContent = tagText
//                         tag.classList.add("todo-tags")
//                         if (tagsList) {
//                             tagsList.appendChild(tag)
//                         }
//                     }
//                 })
//             }
//             console.log(tagsList);
            
//             (e.target as HTMLInputElement).value = "" // Clear input after adding tags
//         }
//     });
// }

// if (tagsList) {
//     tagsList.addEventListener('click', (e) => {
//         if (e.target instanceof HTMLElement) {
//             const target = e.target
//             if (target.tagName === 'LI') {
//                 const tag = e.target
//                 tagsList.removeChild(tag)
//             }
//         }
        
//     })
// }
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
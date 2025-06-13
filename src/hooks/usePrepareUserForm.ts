import * as React from 'react';

import {User} from '../classes/User'
import {UsersManager } from '../classes/UsersManager'

interface Props {
    userToBeUpdated: User | null, 
    usersManager: UsersManager | undefined
}

export function usePrepareUserForm({ userToBeUpdated, usersManager }: Props) {
    const [formData, setFormData] = React.useState<User | null>(null)

    React.useEffect(() => {
        if (userToBeUpdated) {
            setFormData(userToBeUpdated)

            //Update modal elements
            const modalElements = {
                title: { id: "modal-user-title", text: "Update User" },
                acceptBtn: { id: "accept-project-btn", text: "Save Changes" },
                cancelBtn: { id: "cancel-project-btn", text: "Discard Changes" }
            }

            Object.values(modalElements).forEach(({ id, text }) => {
                const element = document.getElementById(id);
                if (element) element.textContent = text;
            })

            // Populate the form fields with project data
            UsersManager.populateUserDetailsForm(userToBeUpdated);
        } else {
            setFormData(null);

            // *** RESET THE FORM ***
            // 1. Target specific input types
            const userForm = document.getElementById("new-user-form") as HTMLFormElement;
            const inputsToReset = userForm.querySelectorAll('input[type="text"], input[type="date"], input[type="number"], textarea, select');

            // 2. Loop through and reset each element
            inputsToReset.forEach(element => {

                // Additional handling for select elements
                if (element instanceof HTMLSelectElement) {
                    element.selectedIndex = 0; // Reset to the first option
                } else {
                    (element as HTMLInputElement).value = '' // Reset to empty string
                }
            });
            // Update modal elements
            const modalElements = {
                title: { id: "modal-user-title", text: "User's Data" },
                acceptBtn: { id: "accept-user-btn", text: "Accept" },
                cancelBtn: { id: "cancel-user-btn", text: "Cancel" }
            };

            Object.values(modalElements).forEach(({ id, text }) => {
                const element = document.getElementById(id);
                if (element) element.textContent = text;
            })
        }
    }, [userToBeUpdated, usersManager]);
}



import * as React from 'react';

import { ProjectsManager } from '../classes/ProjectsManager';
import { Project } from '../classes/Project';

interface Props {
    projectToBeUpdated: Project | null,
    projectsManager: ProjectsManager | undefined
}

export function usePrepareProjectForm({ projectToBeUpdated, projectsManager }:Props) {
    const [formData, setFormData] = React.useState<Project | null>(null);

    React.useEffect(() => {
        if (projectToBeUpdated) {
            setFormData(projectToBeUpdated);

            // Update modal elements
            const modalElements = {
                title: { id: "modal-project-title", text: "Update Project" },
                acceptBtn: { id: "accept-project-btn", text: "Save Changes" },
                cancelBtn: { id: "cancel-project-btn", text: "Discard Changes" }
            };

            Object.values(modalElements).forEach(({ id, text }) => {
                const element = document.getElementById(id);
                if (element) element.textContent = text;
            })
            /*
            // Update modal title and button text
            const modalProjectTitle = document.getElementById("modal-project-title");
            if (modalProjectTitle) {
                modalProjectTitle.textContent = "Update Project";
            }

            const submitButton = document.getElementById("accept-project-btn");
            if (submitButton) {
                submitButton.textContent = "Save Changes";
            }

            const discardButton = document.getElementById("cancel-project-btn");
            if (discardButton) {
                discardButton.textContent = "Discard Changes";
            }
            */

            // Populate the form fields with project data
            ProjectsManager.populateProjectDetailsForm(projectToBeUpdated);
        } else {
            setFormData(null);

            // *** RESET THE FORM ***
            // 1. Target specific input types
            const projectForm = document.getElementById("new-project-form") as HTMLFormElement;
            const inputsToReset = projectForm.querySelectorAll('input[type="text"], input[type="date"], input[type="number"], textarea, select');

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
                title: { id: "modal-project-title", text: "New Project" },
                acceptBtn: { id: "accept-project-btn", text: "Accept" },
                cancelBtn: { id: "cancel-project-btn", text: "Cancel" }
            };

            Object.values(modalElements).forEach(({ id, text }) => {
                const element = document.getElementById(id);
                if (element) element.textContent = text;
            })
            /*
            // Update modal title and button text for new project
            const modalProjectTitle = document.getElementById("modal-project-title");
            if (modalProjectTitle) {
                modalProjectTitle.textContent = "New Project";
            }

            const submitButton = document.getElementById("accept-project-btn");
            if (submitButton) {
                submitButton.textContent = "Accept";
            }

            const discardButton = document.getElementById("cancel-project-btn");
            if (discardButton) {
                discardButton.textContent = "Cancel";
            }
            */
        }
    }, [projectToBeUpdated, projectsManager]);

}

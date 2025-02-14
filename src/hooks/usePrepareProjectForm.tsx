import * as React from 'react';

import { ProjectsManager } from '../classes/ProjectsManager';
import { Project } from '../classes/Project';



export function usePrepareProjectForm(projectToBeUpdated: Project | null, projectsManager: ProjectsManager | undefined) {
    const [formData, setFormData] = React.useState<Project | null>(null);

    React.useEffect(() => {
        if (projectToBeUpdated) {
            setFormData(projectToBeUpdated);

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
                (element as HTMLInputElement).value = ''; // Reset to empty string

                // Additional handling for select elements
                if (element instanceof HTMLSelectElement) {
                    element.selectedIndex = 0; // Reset to the first option
                }
            });

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
        }
    }, [projectToBeUpdated, projectsManager]);

}

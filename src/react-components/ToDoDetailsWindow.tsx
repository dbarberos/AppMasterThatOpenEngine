import React from 'react'

import { MessagePopUp, MessagePopUpProps, DeleteToDoIssueBtn, toggleSidebar } from '../react-components';
import { type Project } from '../classes/Project';
import { ToDoIssue } from '../classes/ToDoIssue';

import { EditIcon, Report2Icon, ReportIcon, TrashIcon } from './icons';
import { ToDoEditableField } from './ToDoEditableField';
import { updateDocument, UpdateDocumentOptions } from '../services/firebase';
import { useSidebarState } from '../hooks';
import { IToDoIssue } from '../types';


interface ToDoDetailsWindowProps {
    project: Project
    toDoIssue: ToDoIssue
    onClose: () => void
    // onUpdatedToDoIssue: (updatedTodo: ToDoIssue) => void
    // onDeleteToDoIssueButtonClick: (projectId: string, todoId: string) => Promise<void>
    onUpdatedToDoIssue: (projectId: string, todoId: string, updates: Partial<IToDoIssue>) => Promise<void>
    onDeleteToDoIssueButtonClick: (projectId: string, todoId: string) => Promise<void>
}



export function ToDoDetailsWindow({ project, toDoIssue, onClose, onUpdatedToDoIssue, onDeleteToDoIssueButtonClick }) {

    const [editingField, setEditingField] = React.useState<string | null>(null);
    //const [previousValue, setPreviousValue] = React.useState<ToDoIssue>(toDoIssue);
    //const [currentToDoIssue, setCurrentToDoIssue] = React.useState<ToDoIssue>(toDoIssue); // Use local state for current todo issue

    const [showMessagePopUp, setShowMessagePopUp] = React.useState(false)
    const [messagePopUpContent, setMessagePopUpContent] = React.useState<MessagePopUpProps | null>(null)

    //const [initialSidebarState, setInitialSidebarState] = React.useState<boolean | null>(null);
    const { storeSidebarState, restoreSidebarState } = useSidebarState();


    // // Handler to check if specific field is being edited
    // const isFieldEditing = (fieldName: string) => editingField === fieldName;


    // React.useEffect(() => {
        
    //     // This effect will run every time the `toDoIssue` prop changes.
    //     // This is crucial for updating the window when a new ToDo is selected
    //     // from outside while the window is already open.

    //     const hasChanged = compareToDoIssues(currentToDoIssue, toDoIssue);

    //     if (hasChanged) {
    //         console.log('ToDoDetailsWindow: Updating state due to changes:', {
    //             field: hasChanged.field,
    //             from: hasChanged.from,
    //             to: hasChanged.to
    //         });
        
    //         setCurrentToDoIssue(toDoIssue); // Update the local state with the new ToDo
    //         setPreviousValue(toDoIssue);    // Update the rollback value
    //         setEditingField(null);          // Exit any active editing mode
    //     }
    // }, [toDoIssue]); 




    // // Hlper function for comparing todos
    // const compareToDoIssues = (current: ToDoIssue, next: ToDoIssue) => {
    //     const relevantFields = [
    //         { field: 'statusColumn', getValue: (todo: ToDoIssue) => todo.statusColumn },
    //         { field: 'title', getValue: (todo: ToDoIssue) => todo.title },
    //         { field: 'description', getValue: (todo: ToDoIssue) => todo.description },
    //         { field: 'dueDate', getValue: (todo: ToDoIssue) => todo.dueDate?.getTime() },
    //         { field: 'tags', getValue: (todo: ToDoIssue) => JSON.stringify(todo.tags) },
    //         { field: 'assignedUsers', getValue: (todo: ToDoIssue) => JSON.stringify(todo.assignedUsers) }
    //     ];

    //     for (const { field, getValue } of relevantFields) {
    //         const currentValue = getValue(current);
    //         const nextValue = getValue(next);

    //         if (currentValue !== nextValue) {
    //             return { field, from: currentValue, to: nextValue };
    //         }
    //     }

    //     return false;
    // };

    React.useEffect(() => {
        storeSidebarState();
        return () => {
            restoreSidebarState();
        };
    }, []);

    // // Store initial sidebar state when mounting
    // React.useEffect(() => {
    //     const sidebarCheckbox = document.getElementById('sidebar-checkbox-switch') as HTMLInputElement;
    //     if (sidebarCheckbox && initialSidebarState === null) {
    //         setInitialSidebarState(sidebarCheckbox.checked);
    //     }
    // }, []);

    // React.useEffect(() => {
    //     // When component mounts (window opens)
    //     const currentState = toggleSidebar.getState();
    //     setPreviousSidebarState(currentState);
    //     toggleSidebar.collapse();

    //     // When component unmounts (window closes)
    //     return () => {
    //         if (previousSidebarState !== null) {
    //             toggleSidebar.setState(previousSidebarState);
    //         }
    //     };
    // }, [])


    const handleClose = () => {
        restoreSidebarState();
        onClose();
    };

    // // Handle close with sidebar state restoration
    // const handleClose = () => {
    //     const sidebarCheckbox = document.getElementById('sidebar-checkbox-switch') as HTMLInputElement;
    //     if (sidebarCheckbox && initialSidebarState !== null) {
    //         sidebarCheckbox.checked = initialSidebarState;
    //     }
    //     onClose();
    // };




    const handleToDoFieldSave = async (fieldName: string, newValue: any) => {
        try {

            const updates: Partial<IToDoIssue> = { [fieldName]: newValue };

            console.log('ToDoDetailsWindow: Propagando actualización parcial...', {
                projectId: project.id,
                todoId: toDoIssue.id,
                updates,
            });

            // La única responsabilidad de este componente es notificar al padre.
            // La actualización de la UI ocurrirá cuando las props cambien como resultado.
            await onUpdatedToDoIssue(project.id, toDoIssue.id, updates);


            // // Store current state for potential rollback
            // setPreviousValue(toDoIssue);

            // // Create updated todo
            // const updatedTodo = new ToDoIssue({
            //     ...currentToDoIssue,
            //     //...toDoIssue,
            //     [fieldName]: newValue
            // });


            // // Prepare data for updateDocument
            // let updateData: any;
            // let options: UpdateDocumentOptions;

            // if (fieldName === 'tags' || fieldName === 'assignedUsers') {
            //     // Subcollection replacement
            //     updateData = newValue; // The array of tags or assigned users
            //     options = {
            //         basePath: 'projects',
            //         subcollection: fieldName, // 'tags' or 'assignedUsers'
            //         parentId: project.id,
            //         todoId: toDoIssue.id,
            //         isArrayCollection: true
            //     };
            // } else {
            //     // Single field update
            //     updateData = { [fieldName]: newValue };
            //     options = {
            //         basePath: 'projects',
            //         subcollection: 'todoList',
            //         parentId: project.id,
            //         todoId: toDoIssue.id,
            //         isArrayCollection: false
            //     };
            // }

            // // Update Firebase first
            // await updateDocument(
            //     toDoIssue.id,
            //     updateData,
            //     options
            // );

            // // If Firebase update succeeds, update local state and notify parent
            // // Update local state
            // setCurrentToDoIssue(updatedTodo)
            // // Notify parent components
            // onUpdatedToDoIssue(updatedTodo);
            // //setError(null);

        } catch (error) {
            console.error('Error updating todo:', error);
            // Aquí solo manejamos:
            // 1. Rollback del estado local
            // 2. Mostrar mensaje al usuario
            // 3. Actualizar UI

            // Rollback to previous state
            //onUpdatedToDoIssue(previousValue);



            // El rollback del estado ya no es necesario porque no tenemos estado local que revertir.
            // La UI simplemente no cambiará porque la prop `toDoIssue` no ha cambiado.
            // Show message error to user
            setMessagePopUpContent({
                type: "error",
                title: "Update Failed",
                message: "There was a problem updating the ToDo Issue. Please try again later.",
                actions: ["Ok"],
                onActionClick: {
                    "Ok": () => setShowMessagePopUp(false),
                },
                onClose: () => setShowMessagePopUp(false),
            })
            setShowMessagePopUp(true)
            //throw error
        }
    }

    const handleEditQuillContentStart = React.useCallback(() => {
        console.log('Setting editingField to description');
        setEditingField((prev) => prev === 'description' ? prev : 'description');
    }, []); // Sin dependencias: siempre misma referencia

    const handleEditQuillContentEnd = React.useCallback(() => {
        console.log('Setting editingField to null');
        setEditingField((prev) => prev === 'description' ? null : prev);
    }, []); // Actualización funcional del estado


    // Helper function to format the date
    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };



    return (
        <section
            className="half-page"
            id="todo-details"
            data-page=""
        >
            <div className="sliding-panel-todoIssue open-panel ">
                <div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}
                    >
                        <ToDoEditableField
                            //label="Title"
                            fieldName="title"
                            //value={currentToDoIssue.title}
                            value={toDoIssue.title}
                            onSave={handleToDoFieldSave}
                            type="text"
                            style={{ marginTop: 30, minHeight: 50, paddingRight: 15, alignItems: "" }}
                            //toDoIssue={currentToDoIssue}
                            toDoIssue={toDoIssue}
                        />
                    
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                columnGap: 10,
                                alignItems: "center"
                            }}
                        >

                            <DeleteToDoIssueBtn
                                projectId={toDoIssue.todoProject}
                                todoToBeDeleted={toDoIssue}
                                onDeleteToDoIssue={onDeleteToDoIssueButtonClick}
                                onClose={onClose} />
                            <button
                                className="todo-icon-edit"
                                id="close-todoIssue-details-btn"
                                onClick={handleClose}
                                style={{
                                    display: "flex",
                                    borderRadius: "var(--br-circle)",
                                    aspectRatio: 1,
                                    padding: 0,
                                    justifyContent: "center"
                                }}
                            >
                                <ReportIcon size={50} className="todo-icon-edit" color="var(--color-fontbase)" />

                            </button>
                        </div>
                    </div>
                    {/* Display Not Editable Data */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            rowGap: 10,
                            paddingBottom: 30,
                            borderBottom: "2px dotted var(--color-fontbase-dark)",
                            userSelect: "none"
                        }}
                    >
                        <div className="todo-detail-withlogo">
                            <div style={{ display: "flex", alignItems: "center", columnGap: 15 }}>
                                <abbr
                                    title="Acronym of the project"
                                    style={{
                                        marginLeft: 4,
                                        fontSize: 15,
                                        backgroundColor: "#f08080",
                                        padding: 6,
                                        borderRadius: "100%",
                                        aspectRatio: 1,
                                        color: "#343537",
                                        display: "flex",
                                        alignItems: "center"
                                    }}
                                    data-todo-info="acronym"
                                >
                                    {project.acronym}
                                </abbr>
                                <p style={{ color: "var(--color-fontbase-dark)" }}>
                                    Open in:
                                    <span
                                        data-todo-info="todoProject"
                                        style={{
                                            color: "var(--color-fontbase)",
                                            fontSize: "var(--font-lg)",
                                            fontWeight: "bold"
                                        }}
                                    >
                                        {project.name}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className="todo-detail-withlogo">
                            <div style={{ display: "flex", alignItems: "center", columnGap: 15 }}>
                                <svg
                                    className="todo-icon-edit svg-edit"
                                    role="img"
                                    aria-label="radio_button_unchecked"
                                    width={37}
                                    height={37}
                                    style={{ boxShadow: "none" }}
                                >
                                    <use href="#radio_button_unchecked" />
                                </svg>
                                <p style={{ color: "var(--color-fontbase-dark)" }}>
                                    Open by:
                                    <span
                                        data-todo-info="todoUserOrigen"
                                        style={{ color: "var(--color-fontbase)" }}
                                    >
                                        {toDoIssue.todoUserOrigin}User Origin (WIP)
                                    </span>
                                </p>
                            </div>
                            <p
                                style={{
                                    color: "var(--color-fontbase-dark)",
                                    transform: "translateX(55px)"
                                }}
                            >
                                in date:{" "}
                                <span
                                    data-todo-info="createdDate"
                                    style={{ color: "var(--color-fontbase)" }}
                                >
                                    {formatDate(toDoIssue.createdDate)}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
                {/* Display Description */}
                <div
                    style={{
                        maxHeight: "calc(100% - 1100px)",
                        overflowY: "auto",
                        height: editingField === 'description'
                            ? "calc(100vh - 220px)"
                            : "fit-content",
                        transition: "all 0.3s ease-in-out"
                    }}
                    className="scrollbar-manage"
                >
                    <div className="todo-detail-datafield" >
                        <ToDoEditableField
                            fieldName="description"
                            //value={currentToDoIssue.description}
                            value={toDoIssue.description}
                            onSave={handleToDoFieldSave}
                            type="textRich"
                            //type="textarea"
                            style={{ marginTop: 25, width: "100%" }}
                            onEditStart={ handleEditQuillContentStart }
                            onEditEnd={ handleEditQuillContentEnd }
                            //toDoIssue={currentToDoIssue}
                            toDoIssue={toDoIssue}
                        />
                    </div>
                </div>

                {/* Display StatusColumn */}
                <div className="todo-detail-datafiled-title">
                    <label>
                        <span className="material-icons-round">view_column</span>
                    </label>
                    <h3 style={{ padding: "20px 0", color: "var(--color-fontbase-dark)" }}>
                        Stage
                    </h3>
                </div>
                <ToDoEditableField
                    //label="Stage:"
                    fieldName="statusColumn"
                    //value={currentToDoIssue.statusColumn}
                    value={toDoIssue.statusColumn}
                    onSave={handleToDoFieldSave}
                    type="select"
                    style={{  }}
                    onEditStart={() => setEditingField('statusColumn')}
                    onEditEnd={() => setEditingField(null)}
                    //toDoIssue={currentToDoIssue}
                    toDoIssue={toDoIssue}
                />

                {/* Display AssignedUsers */}
                <div className="todo-detail-datafiled-title">
                    <label>
                        <span className="material-icons-round">person</span>
                    </label>
                    <h3 style={{ padding: "20px 0", color: "var(--color-fontbase-dark)" }}>
                        Assigned to
                    </h3>
                </div>
                <div className="todo-detail-datafield"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: "fit-content",
                        height: "170px",
                        overflow: "visible",
                        justifyContent: "flex-start",
                        position: "relative"
                    }}>
                    <ToDoEditableField
                        fieldName="assignedUsers"
                        //value={currentToDoIssue.assignedUsers}
                        value={toDoIssue.assignedUsers}
                        onSave={handleToDoFieldSave}
                        type="array"
                        style={{
                            transition: "min-height 0.3s ease",
                            minHeight: "fit-content",
                            height: "auto",
                            overflow: "visible",
                        }}
                        onEditStart={() => setEditingField('assignedUsers')}
                        onEditEnd={() => setEditingField(null)}
                        //toDoIssue={currentToDoIssue}
                        toDoIssue={toDoIssue}

                    />
                </div>

                {/* Display Tags */}
                <div className="todo-detail-datafiled-title">
                    <label>
                        <span className="material-icons-round">label</span>
                    </label>
                    <h3 style={{ padding: "20px 0", color: "var(--color-fontbase-dark)" }}>
                        Tags
                    </h3>
                </div>
                <div className="todo-detail-datafield"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: "fit-content",
                        height: "170px",
                        overflow: "visible",
                        justifyContent: "flex-start",
                        position: 'relative'
                    }}>
                    <ToDoEditableField
                        //label="Stage:"
                        fieldName="tags"
                        //value={currentToDoIssue.tags}
                        value={toDoIssue.tags}
                        onSave={handleToDoFieldSave}
                        type="array"
                        style={{
                            transition: "min-height 0.3s ease",
                            minHeight: "fit-content",
                            height: "auto",
                            overflow: "visible",
                        
                        }}
                        onEditStart={() => setEditingField('tags')}
                        onEditEnd={() => setEditingField(null)}
                        //toDoIssue={currentToDoIssue}
                        toDoIssue={toDoIssue}
                    />
                </div>

                {/* Display Due Date */}
                <div className="todo-detail-datafiled-title">
                    <label>
                        <span className="material-icons-round">calendar_today</span>
                    </label>
                    <h4 style={{ padding: "20px 0", color: "var(--color-fontbase-dark)" }}>
                        Finish issue date
                    </h4>
                </div>
                <div className="todo-detail-datafield">
                    <ToDoEditableField
                        fieldName="dueDate"
                        //value={currentToDoIssue.dueDate}
                        value={toDoIssue.dueDate}
                        onSave={handleToDoFieldSave}
                        type="date"
                        style={{
                            // minHeight: "fit-content",
                            // height: "auto",
                            // overflow: "visible",
                        }}
                        onEditStart={() => setEditingField('dueDate')}
                        onEditEnd={() => setEditingField(null)}
                        //toDoIssue={currentToDoIssue}
                        toDoIssue={toDoIssue}
                    />
                </div>
            </div>
            {showMessagePopUp && messagePopUpContent && (<MessagePopUp {...messagePopUpContent} />)}
        </section>
    )
}

// Add display name for debugging purposes
ToDoDetailsWindow.displayName = 'ToDoDetailsWindow'


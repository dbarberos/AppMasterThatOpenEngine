import React from 'react'

import { type Project } from '../classes/Project';
import { type ToDoIssue } from '../classes/ToDoIssue';

import { EditIcon, Report2Icon, ReportIcon, TrashIcon } from './icons';
import { ToDoEditableField } from './ToDoEditableField';




interface ToDoDetailsWindowProps {
    project: Project
    toDoIssue: ToDoIssue
    onClose: () => void
    onUpdatedToDoIssue: (updatedTodo: ToDoIssue) => void
    onDeleteToDoIssueButtonClick: (toDoToDeleted: ToDoIssue) => void
}




export function ToDoDetailsWindow({ project, toDoIssue, onClose, onUpdatedToDoIssue, onDeleteToDoIssueButtonClick }) {

    const [editingField, setEditingField] = React.useState<string | null>(null);

    // Handler to check if specific field is being edited
    const isFieldEditing = (fieldName: string) => editingField === fieldName;


    // const handleSave = async () => {
    //     try {
    //         // Create updated todo instance
    //         const updatedTodo = {
    //             ...toDoIssue,
    //             [fieldName]: fieldValue
    //         };

    //         // Update Firebase
    //         await updateToDoIssueField(toDoIssue.id!, fieldName, fieldValue);

    //         // Notify parent
    //         onUpdate(updatedTodo);
    //         setIsEditing(false);
    //     } catch (error) {
    //         console.error(`Error updating ${fieldName}:`, error);
    //     }
    // };






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
                            value={toDoIssue.title}
                            onSave={onUpdatedToDoIssue}
                            type="text"
                            style={{ marginTop: 30, minHeight: 50, paddingRight: 15, alignItems: "" }}
                        />
                        {/* OLD TITLE TODO ISSUE
                        <div
                            className="todo-detail-datafield"
                            style={{
                                marginTop: 30,
                                minHeight: 50,
                                flexDirection: "row",
                                justifyContent: "flex-start",
                                paddingRight: 15
                            }}
                            data-todo-info-btn="title"
                        >
                            <button
                                className="todo-icon-edit svg-edit"
                                style={{
                                    display: "flex",
                                    borderRadius: "var(--br-circle)",
                                    aspectRatio: 1,
                                    padding: 0,
                                    justifyContent: "center",
                                    position: "absolute"
                                }}
                                data-todo-info-btn="title"
                            >
                                <EditIcon size={22} className="todo-icon-edit" color="var(--color-fontbase)" />

                                
                            </button>
                            <button
                                className="todo-icon-edit svg-save"
                                style={{
                                    display: "flex",
                                    borderRadius: "var(--br-circle)",
                                    aspectRatio: 1,
                                    padding: 0,
                                    justifyContent: "center",
                                    position: "absolute"
                                }}
                                data-todo-info-btn="title"
                            >
                                <svg role="img" aria-label="save" width={22} height={22}>
                                    <use href="#save" />
                                </svg>
                            </button>
                            <h2 style={{ marginLeft: 25 }} data-todo-info="title">
                                Title To-Do Issue
                            </h2>
                            <input
                                data-todo-info-origin="title"
                                name="title"
                                className="title-todo-card"
                                type="text"
                                //size={var(--font-3xl)}
                                placeholder="Title"
                                required
                                minLength={5}
                                style={{
                                    height: "20px",
                                    fontSize: "var(--font-3xl)",
                                    transform: "translateY(-2px) translateX(29px)",
                                    display: "none"
                                }}
                            />
                        </div>
                        */}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                columnGap: 10,
                                alignItems: "center"
                            }}
                        >
                            <button
                                title="Delete To-Do"
                                className="todo-icon-edit"
                                id="delete-todoIssue-btn"
                                style={{
                                    display: "flex",
                                    borderRadius: "var(--br-circle)",
                                    aspectRatio: 1,
                                    padding: 0,
                                    justifyContent: "center"
                                }}
                            >
                                <TrashIcon size={30} className="todo-icon-edit" color="var(--color-fontbase)" />

                            </button>
                            <button
                                className="todo-icon-edit"
                                id="close-todoIssue-details-btn"
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
                                    Ac
                                </abbr>
                                <p style={{ color: "var(--color-fontbase-dark)" }}>
                                    Open in:{" "}
                                    <span
                                        data-todo-info="todoProject"
                                        style={{ color: "var(--color-fontbase)" }}
                                    >
                                        Project Name
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
                                    Open by:{" "}
                                    <span
                                        data-todo-info="todoUserOrigen"
                                        style={{ color: "var(--color-fontbase)" }}
                                    >
                                        User Origin (WIP)
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
                                    ***-**-**
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
                <div
                    style={{
                        maxHeight: "calc(100% - 780px)",
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
                            //label="Issue Description:"
                            fieldName="description"
                            value={toDoIssue.description}
                            onSave={onUpdatedToDoIssue}
                            type="textarea"
                            style={{ marginTop: 25, width: "100%" }}
                            onEditStart={() => {
                                setEditingField('description')
                                console.log('Setting editingField to description', editingField)
                            }} onEditEnd={() => {
                                setEditingField(null)
                                console.log('Setting editingField to null', editingField)
                            }}
                        />

                        {/*<div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "flex-start",
                                justifyContent: "flex-start",
                                marginTop: 25,
                                width: "100%"
                            }}
                            data-todo-info-btn="description"                        
                        >                            
                            <button
                                className="todo-icon-edit  svg-edit"
                                style={{
                                    display: "flex",
                                    borderRadius: "var(--br-circle)",
                                    aspectRatio: 1,
                                    padding: 0,
                                    justifyContent: "center",
                                    boxShadow: "transparent",
                                    position: "absolute"
                                }}
                                data-todo-info-btn="description"
                            >
                                <EditIcon size={22} className="todo-icon-edit" color="var(--color-fontbase)" />
                                
                            </button>
                            <button
                                className="todo-icon-edit  svg-save"
                                style={{
                                    display: "flex",
                                    borderRadius: "var(--br-circle)",
                                    aspectRatio: 1,
                                    padding: 0,
                                    justifyContent: "center",
                                    boxShadow: "transparent",
                                    position: "absolute"
                                }}
                                data-todo-info-btn="description"
                            >
                                <svg role="img" aria-label="save" width={22} height={22}>
                                    <use href="#save" />
                                </svg>
                            </button>
                            <fieldset
                                className="todo-fieldset father-todoissue-textarea-fielset"
                                style={{ width: "100%", marginLeft: 30 }}
                            >
                                <legend style={{ transform: "translatex(15px)" }}>
                                    <h3>Issue Description: </h3>
                                </legend>
                                <div
                                    style={{
                                        height: "auto",
                                        display: "flex",
                                        flexDirection: "column",
                                        flexGrow: 1,
                                        transition: "min-height 0.3s ease"
                                    }}
                                    className="father-todoissue-textarea"
                                >
                                    <textarea
                                        data-todo-info-origin="description"
                                        name="description"
                                        id=""
                                        style={{
                                            resize: "vertical",
                                            scrollbarWidth: "none",
                                            fontSize: "var(--font-lg)",
                                            transform: "translateY(-15px) translateX(13px)",
                                            maxHeight: 550,
                                            height: "auto",
                                            overflow: "visible",
                                            whiteSpace: "pre-wrap",
                                            display: "none"
                                        }}
                                        cols={59}
                                        rows={15}
                                        placeholder="Leave a comment"
                                        defaultValue={""}
                                    />
                                </div>
                                <div style={{ width: "90%", maxHeight: "calc(100% - 900px)" }}>
                                    <p
                                        data-todo-info="description"
                                        style={{
                                            height: "fit-content",
                                            color: "var(--color-fontbase)"
                                        }}
                                    >
                                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugiat
                                        quasi ut repellat consectetur quod perspiciatis nihil et quae
                                        enim aperiam impedit, tempore debitis velit voluptate? Corporis
                                        ullam est aut quia. Voluptatibus, sint illo? Doloremque eligendi
                                        illo repudiandae esse dolor? Non neque aut alias odit mollitia
                                        recusandae illo temporibus, facilis nostrum maxime dolores est
                                        voluptas quam, at eius, a molestias sunt? Similique asperiores
                                        rem ad expedita esse deserunt minima illum, magnam laudantium.
                                        Totam hic architecto sed id, dolore harum laudantium qui ipsum?
                                        Architecto, laudantium at accusamus placeat quasi corrupti eaque
                                        et?
                                    </p>
                                </div>
                            </fieldset>
                        </div> */}
                    </div>
                </div>
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
                    value={toDoIssue.statusColumn}
                    onSave={onUpdatedToDoIssue}
                    type="select"
                    style={{ alignItems: "center" }}
                    onEditStart={() => setEditingField('statusColumn')}
                    onEditEnd={() => setEditingField(null)}
                />

                {/*}
                <div
                    className="todo-detail-datafield"
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-start"
                    }}
                    data-todo-info-btn="statusColumn"
                >
                    <button
                        className="todo-icon-edit  svg-edit"
                        style={{
                            display: "flex",
                            borderRadius: "var(--br-circle)",
                            aspectRatio: 1,
                            padding: 0,
                            justifyContent: "center",
                            position: "absolute"
                        }}
                        data-todo-info-btn="statusColumn"
                    >
                        <EditIcon size={22} className="todo-icon-edit" color="var(--color-fontbase)" />
                        
                    </button>
                    <button
                        className="todo-icon-edit  svg-save"
                        style={{
                            display: "flex",
                            borderRadius: "var(--br-circle)",
                            aspectRatio: 1,
                            padding: 0,
                            justifyContent: "center",
                            position: "absolute"
                        }}
                        data-todo-info-btn="statusColumn"
                    >
                        <svg role="img" aria-label="save" width={22} height={22}>
                            <use href="#save" />
                        </svg>
                    </button>

                    <select
                        data-todo-info-origin="statusColumn"
                        name="statusColumn"
                        id="todo-stagecolumn-detail-select"
                        style={{
                            height: 20,
                            fontSize: "var(--font-lg)",
                            transform: "translateY(0px) translateX(40px)",
                            backgroundColor: "var(--color-bg1)",
                            opacity: "0.5",
                            display: "none"
                        }}
                    >
                        
                        <option
                            label="Task ready"
                            value="backlog"
                            style={{ color: "var(--background-100)" }}
                        />
                        <option
                            label="In progress"
                            value="wip"
                            style={{ color: "var(--background-100)" }}
                        />
                        <option
                            label="In review"
                            value="qa"
                            style={{ color: "var(--background-100)" }}
                        />
                        <option
                            label="Done"
                            value="completed"
                            style={{ color: "var(--background-100)" }}
                        />
                    </select>
                    <p>
                        <span
                            className="todo-task-move todo-tags"
                            style={{
                                textWrap: "nowrap",
                                marginLeft: 25,
                                color: "var(--background) !important",
                                fontSize: "var(--font-base)"
                            }}
                            data-todo-info="statusColumn"
                        >
                            Column stage To-Do Issue
                        </span>
                    </p>
                </div>
                */}
                <div className="todo-detail-datafiled-title">
                    <label>
                        <span className="material-icons-round">person</span>
                    </label>
                    <h3 style={{ padding: "20px 0", color: "var(--color-fontbase-dark)" }}>
                        Assigned to
                    </h3>
                </div>
                <div className="todo-detail-datafield" style={{ position: "relative" }}>
                    <ToDoEditableField
                        //label="Stage:"
                        fieldName="tags"
                        value={toDoIssue.tags}
                        onSave={onUpdatedToDoIssue}
                        type="array"
                        style={{ alignItems: "stretch" }}
                        onEditStart={() => setEditingField('statusColumn')}
                        onEditEnd={() => setEditingField(null)}
                    />
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "flex-start",
                            justifyContent: "flex-start"
                        }}
                        data-todo-info-btn="assignedUsers"
                    >
                        <button
                            className="todo-icon-edit  svg-edit"
                            style={{
                                display: "flex",
                                borderRadius: "var(--br-circle)",
                                aspectRatio: 1,
                                padding: 0,
                                justifyContent: "center",
                                position: "absolute"
                            }}
                            data-todo-info-btn="assignedUsers"
                        >
                            <EditIcon size={22} className="todo-icon-edit" color="var(--color-fontbase)" />
                            {/* <svg role="img" aria-label="edit" width={22} height={22}>
                                <use href="#edit" />
                            </svg> */}
                        </button>
                        <button
                            className="todo-icon-edit  svg-save"
                            style={{
                                display: "flex",
                                borderRadius: "var(--br-circle)",
                                aspectRatio: 1,
                                padding: 0,
                                justifyContent: "center",
                                position: "absolute"
                            }}
                            data-todo-info-btn="assignedUsers"
                        >
                            <svg role="img" aria-label="save" width={22} height={22}>
                                <use href="#save" />
                            </svg>
                        </button>
                        <input
                            data-todo-info-origin="assignedUsers"
                            name="assignedUsers"
                            className="assignedUsers-todo-card"
                            type="text"
                            //size="var(--sm)"
                            id="todo-assignedUsers-detail-input"
                            placeholder="New users + Enter key"
                            style={{
                                fontSize: "var(--sm)",
                                height: 20,
                                transform: "translateY(-50px) translateX(200px)",
                                width: "fit-content",
                                minWidth: "50%",
                                position: "absolute",
                                display: "none"
                            }}
                        />
                        <ul
                            data-todo-info="assignedUsers"
                            className="todo-tags-list todo-form-field-container"
                            aria-labelledby="assignedUsers"
                            //name="assignedUsers"
                            id="todo-assignedUsers-list-detail-page"
                            style={{
                                paddingLeft: 20,
                                position: "relative",
                                marginLeft: 25,
                                listStyle: "none"
                            }}
                        >
                            <li className="todo-tags">WIP_1</li>
                            <li className="todo-tags">WIP_2</li>
                            {/* ${toDoIssue.tags.map(tag => `<span class="todo-tags">${tag}</span>`).join('')} */}
                        </ul>
                    </div>
                </div>
                <div className="todo-detail-datafiled-title">
                    <label>
                        <span className="material-icons-round">label</span>
                    </label>
                    <h3 style={{ padding: "20px 0", color: "var(--color-fontbase-dark)" }}>
                        Tags
                    </h3>
                </div>
                <div className="todo-detail-datafield">
                    <ToDoEditableField
                        //label="Stage:"
                        fieldName="tags"
                        value={toDoIssue.tags}
                        onSave={onUpdatedToDoIssue}
                        type="array"
                        style={{
                            transition: "min-height 0.3s ease",
                            minHeight: "fit-content",
                            height: "auto",
                            overflow: "visible",
                            
}}
                        onEditStart={() => setEditingField('statusColumn')}
                        onEditEnd={() => setEditingField(null)}
                    />
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "flex-start",
                            justifyContent: "flex-start"
                        }}
                        data-todo-info-btn="tags"
                    >
                        <button
                            className="todo-icon-edit  svg-edit"
                            style={{
                                display: "flex",
                                borderRadius: "var(--br-circle)",
                                aspectRatio: 1,
                                padding: 0,
                                justifyContent: "center",
                                position: "absolute"
                            }}
                            data-todo-info-btn="tags"
                        >
                            <EditIcon size={22} className="todo-icon-edit" color="var(--color-fontbase)" />
                            {/* <svg role="img" aria-label="edit" width={22} height={22}>
                                <use href="#edit" />
                            </svg> */}
                        </button>
                        <button
                            className="todo-icon-edit  svg-save"
                            style={{
                                display: "flex",
                                borderRadius: "var(--br-circle)",
                                aspectRatio: 1,
                                padding: 0,
                                justifyContent: "center",
                                position: "absolute"
                            }}
                            data-todo-info-btn="tags"
                        >
                            <svg role="img" aria-label="save" width={22} height={22}>
                                <use href="#save" />
                            </svg>
                        </button>
                        <input
                            data-todo-info-origin="tags"
                            name="tags"
                            className="tags-todo-card"
                            type="text"
                            //size="var(--sm)"
                            id="todo-tags-detail-input"
                            placeholder="New tags + Enter key"
                            style={{
                                fontSize: "var(--sm)",
                                height: 20,
                                transform: "translateY(-50px) translateX(200px)",
                                minWidth: "50%",
                                width: "fit-content",
                                display: "none"
                            }}
                        />
                        <ul
                            data-todo-info="tags"
                            aria-labelledby="tags"
                            //name="tags"
                            className="todo-tags-list todo-form-field-container"
                            id="todo-tags-list-details-page"
                            style={{
                                paddingLeft: 20,
                                position: "relative",
                                marginLeft: 25,
                                listStyle: "none"
                            }}
                        ></ul>
                    </div>
                </div>
                <div className="todo-detail-datafiled-title">
                    <label>
                        <span className="material-icons-round">calendar_today</span>
                    </label>
                    <h4 style={{ padding: "20px 0", color: "var(--color-fontbase-dark)" }}>
                        Finish issue date
                    </h4>
                </div>
                <div className="todo-detail-datafield">
                    <div
                        className="todo-detail-datafield"
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "flex-start"
                        }}
                        data-todo-info-btn="dueDate"
                    >
                        <button
                            className="todo-icon-edit  svg-edit"
                            style={{
                                display: "flex",
                                borderRadius: "var(--br-circle)",
                                aspectRatio: 1,
                                padding: 0,
                                justifyContent: "center",
                                position: "absolute"
                            }}
                            data-todo-info-btn="dueDate"
                        >
                            <EditIcon size={22} className="todo-icon-edit" color="var(--color-fontbase)" />
                            {/* <svg role="img" aria-label="edit" width={22} height={22}>
                                <use href="#edit" />
                            </svg> */}
                        </button>
                        <button
                            className="todo-icon-edit  svg-save"
                            style={{
                                display: "flex",
                                borderRadius: "var(--br-circle)",
                                aspectRatio: 1,
                                padding: 0,
                                justifyContent: "center",
                                position: "absolute"
                            }}
                            data-todo-info-btn="dueDate"
                        >
                            <svg role="img" aria-label="save" width={22} height={22}>
                                <use href="#save" />
                            </svg>
                        </button>
                        <input
                            data-todo-info-origin="dueDate"
                            name="dueDate"
                            type="date"
                            id="todo-dueDate-details-input"
                            style={{
                                height: 20,
                                fontSize: "var(--font-lg)",
                                transform: "translateY(-60px) translateX(250px)",
                                minWidth: "50%",
                                width: "fit-content",
                                display: "none"
                            }}
                            min="2024-01-01"
                        />
                        <p style={{ marginLeft: 25 }} data-todo-info="dueDate">
                            ***-**-** To-Do Issue
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}


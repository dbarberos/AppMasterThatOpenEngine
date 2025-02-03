import * as React from 'react';
import * as Router from 'react-router-dom';

import { ToDoIssue, IToDoIssue } from '../classes/ToDoIssue';
import { Project } from '../classes/Project';

interface Props {   
    toDoIssue: ToDoIssue
    
}

export function ToDoDetailsCard(props: Props) {

    const dueDateFormatted = props.toDoIssue.dueDate.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).replace(/\//g, "-");

    const todoTagsList = props.toDoIssue.tags.map((tag, index) => (<span key={index} className="todo-tags">{tag}</span>));


    return (
        <div className="todo-item">
            <div
                className="todo-color-column"
                style={{ backgroundColor: props.toDoIssue.backgroundColorColumn }}
            />
            <div
                className="todo-card"
                style={{
                display: "flex",
                flexDirection: "column",
                borderLeftColor: props.toDoIssue.backgroundColorColumn
                }}
            >
                <div className="todo-taks">
                    <div className="todo-tags-list">
                        {todoTagsList} {/* Array of JSX elements */}
                    </div>
                    <button className="todo-task-move handler-move">
                        <svg
                        className="todo-icon"
                        role="img"
                        aria-label="edit"
                        width={24}
                        height={24}
                        >
                        <use href="#drag-indicator" />
                        </svg>
                    </button>
                </div>
                <div className="todo-title">
                <h5
                    style={{
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    marginLeft: 15
                    }}
                >
                    {props.toDoIssue.title}
                </h5>
                </div>
                <div className="todo-stats">
                    <span
                        style={{ textWrap: "nowrap", marginLeft: 10 }}
                        className="todo-task-move"
                    >
                        <svg
                        className="todo-icon"
                        role="img"
                        aria-label="edit"
                        width={24}
                        height={24}
                        >
                        <use href="#flag" />
                        </svg>
                            {dueDateFormatted}
                    </span>
                    <span
                        style={{ textWrap: "nowrap", marginLeft: 5 }}
                        className="todo-task-move"
                    >
                        <svg
                        className="todo-icon"
                        role="img"
                        aria-label="edit"
                        width={24}
                        height={24}
                        >
                        <use href="#chat-bubble" />
                        </svg>
                            {`${props.toDoIssue.assignedUsers.length}`} assigned
                    </span>
                    <span
                        className="todo-task-move todo-tags"
                        style={{
                        textWrap: "nowrap",
                        marginLeft: 5,
                        color: "var(--background) !important",
                        backgroundColor: "${this.backgroundColorColumn}",
                        fontSize: "var(--font-base)"
                        }}
                    >
                        {`${ToDoIssue.getStatusColumnText(props.toDoIssue.statusColumn || "Not Assigned")}`}
                    </span>
                </div>
            </div>
            </div>
    )
}

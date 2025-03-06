import * as React from 'react';
import * as Router from 'react-router-dom';

import { ChatBubbleIcon, DragIndicatorIcon, FlagIcon } from './icons';

import { ToDoIssue, IToDoIssue } from '../classes/ToDoIssue';
import { Project } from '../classes/Project';

interface Props {   
    toDoIssue: ToDoIssue
    handleClickOpenToDoDetailsWindow: () => void
    
}

interface Tag {
    title: string
}

export function ToDoCard({ toDoIssue, handleClickOpenToDoDetailsWindow }: Props) {
    console.log('ToDoCard rendering with:', toDoIssue);

    // Convert Firebase timestamp to Date object    

    const formatDueDate = (date: Date | string |number|undefined) => {
        if (!date) return 'No date set';

        try {
            const dateObj = date instanceof Date
                ? date: typeof date ==='number'
                ? new Date(date)
                : new Date(date);

            if (isNaN(dateObj.getTime())) {
                console.error('Invalid date:', date);
                return 'Invalid date';
            }

            return dateObj.toLocaleDateString("es-ES", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }).replace(/\//g, "-");

        } catch (error) {
            console.error('Error formatting date:', date, error);
            return 'Error formatting date'            
        }
    }

    // Get the formatted date string
    const formattedDate = React.useMemo(() =>{
        return formatDueDate(toDoIssue.dueDate);
        }, [toDoIssue.dueDate]);

    const todoTagsList = toDoIssue.tags.map((tag, index) => (
        <span key={index} className="todo-tags">
            {typeof tag === 'object' && 'title' in tag
                ? (tag as Tag).title
                : tag}
        </span>));


    return (
        <div
            className="todo-item"
            onClick={handleClickOpenToDoDetailsWindow}
        >
            <div
                className="todo-color-column"
                style={{ backgroundColor: toDoIssue.backgroundColorColumn }}
            />
            <div
                className="todo-card"
                style={{
                display: "flex",
                flexDirection: "column",
                borderLeftColor: toDoIssue.backgroundColorColumn
                }}
            >
                <div className="todo-taks">
                    <div className="todo-tags-list">
                        {todoTagsList} {/* Array of JSX elements */}
                    </div>
                    <button className="todo-task-move handler-move">
                        <DragIndicatorIcon size={24} className="todo-icon" color="var(--color-fontbase)" />                        
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
                    {toDoIssue.title}
                </h5>
                </div>
                <div className="todo-stats">
                    <span
                        style={{ textWrap: "nowrap", marginLeft: 10 }}
                        className="todo-task-move"
                    >
                        <FlagIcon size={24} className="todo-icon" color="var(--color-fontbase)" />
                        {formattedDate}
                    </span>
                    <span
                        style={{ textWrap: "nowrap", marginLeft: 5 }}
                        className="todo-task-move"
                    >
                        <ChatBubbleIcon size={24} className="todo-icon" color="var(--color-fontbase)" />
                        {`${toDoIssue.assignedUsers.length}`} assigned
                    </span>
                    <span
                        className="todo-task-move todo-tags"
                        style={{
                            textWrap: "nowrap",
                            marginLeft: 5,
                            color: "var(--color-fontbase) !important",
                            backgroundColor: `${toDoIssue.backgroundColorColumn}`,
                            fontSize: "var(--font-base)"
                        }}
                    >
                        {`${ToDoIssue.getStatusColumnText(toDoIssue.statusColumn || "Not Assigned")}`}
                    </span>
                </div>
            </div>
            </div>
    )
}

import * as React from 'react'

import {EditIcon, ReportIcon, SaveIcon } from './icons'
import { ToDoIssue } from '../classes/ToDoIssue'
import {updateToDoIssueField } from '../services/firebase'
import { ToDoFieldText } from './ToDoFieldText'
import { ToDoFieldTextArea } from './ToDoFieldTextArea'
import { ToDoFieldSelect } from './ToDoFieldSelect'
import { ToDoFieldArray } from './ToDoFieldArray'
import { StatusColumnKey } from '../Types'



interface Props {
    //label: string   
    //icon?: string
    fieldName: keyof ToDoIssue
    value: string | Date | string[]
    onSave: ( typeField, newValueDataField ) => void
    type: 'text' | 'textarea' | 'array' | 'date' | 'select'
    options?: string[]
    style?: React.CSSProperties    
    onEditStart?: () => void;
    onEditEnd?: () => void;    
}

export function ToDoEditableField({
    //label,
    //icon,
    fieldName,
    value,
    onSave,
    type = 'text',
    options = [],
    style = {},    
    onEditStart,
    onEditEnd,    
    ...props
}: Props) {

    const [isEditing, setIsEditing] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)
    const textAreaRef = React.useRef<HTMLTextAreaElement>(null)
    const selectRef = React.useRef<HTMLSelectElement>(null)
    const arrayRef = React.useRef<HTMLDivElement>(null)



    // Notificar al padre cuando cambia el estado local
    React.useEffect(() => {
        if (isEditing ) {
            onEditStart?.();
        } else if (!isEditing)  {
            onEditEnd?.();
        }
    }, [isEditing]);


    const handleEditClikBtn = () => {
        setIsEditing(true);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleSaveClickBtn = () => {
        // Get current input value directly from the field component
        const currentValue = inputRef.current?.value;
        if (currentValue !== undefined && currentValue !== value) {
            onSave(fieldName, currentValue);
        }
        setIsEditing(false);
        
    };

    const handleCancelClickBtn = () => {
        setIsEditing(false)
    }


    // Helper function to render appropriate input type
    function renderInput() {

        switch (type) {
            case 'textarea':
                return (
                    <ToDoFieldTextArea
                        value={value as string}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        onChange={(newValue) => onSave(fieldName, newValue)}
                        placeholder={`Leave a comment. Enter ${fieldName}...`}
                        textAreaRef={textAreaRef} />
                )
            case 'select':
                return (
                    <ToDoFieldSelect
                        value={value as StatusColumnKey}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        onChange={(newValue) => onSave(fieldName, newValue)}
                        options={['backlog', 'wip', 'qa', 'completed']}
                        selectRef={selectRef} />
                )
            case 'array':                
                return (
                    <ToDoFieldArray
                        fieldName={fieldName as 'tags' | 'assignedUsers'}
                        value={value as string[]}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        onChange={(newValue) => onSave(fieldName, newValue)}
                        placeholder={`Add ${fieldName === 'tags' ? 'a tag' : 'a user'}...`}
                        arrayRef={inputRef} />
                )
            case 'date':
                return <ToDoFieldDate value={fieldValue} onChange={setFieldValue} inputRef={inputRef} />;
            case 'text':
                return (
                    <ToDoFieldText
                        value={value as string}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        onChange={(newValue) => onSave(fieldName, newValue)}
                        placeholder={`Enter ${fieldName}...`}
                        inputRef={inputRef} />
                )
            default:
                return null
        }
    }



    const combinedStyle: React.CSSProperties = { 
        display:"flex",
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        
        ...style 
    }


    return (
        <div className="todo-detail-datafield"
            style={combinedStyle}
            data-todo-info-btn={fieldName}
        >
            {/* Field Header */}
            {/* {icon && (
                <div className="todo-detail-datafiled-title">
                    <label>
                        <span className="material-icons-round">{icon}</span>
                    </label>
                    <h3>{label}</h3>
                </div>
            )} */}

            {/* Edit/Save Button */}
            {isEditing
                ? (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            columnGap: 5,
                            justifyContent: "flex-start",
                            alignItems: "center",
                            
                        }}
                    >
                        <button
                            className={`todo-icon-edit ${isEditing ? 'svg-save' : 'svg-edit'}`}
                            onClick={handleSaveClickBtn}
                            style={{
                                display: "flex",
                                borderRadius: "var(--br-circle)",
                                aspectRatio: 1,
                                padding: 0,
                                justifyContent: "center",
                                
                            }}
                            data-todo-info-btn={fieldName}
                        >
                            <SaveIcon size={22} className="todo-icon-edit" color="var(--color-fontbase)" />
                        </button>
                        <button
                            className={`todo-icon-edit ${isEditing ? 'svg-save' : 'svg-edit'}`}
                            onClick={handleCancelClickBtn}
                            style={{
                                display: "flex",
                                borderRadius: "var(--br-circle)",
                                aspectRatio: 1,
                                padding: 0,
                                justifyContent: "center",
                                
                            }}
                            data-todo-info-btn={fieldName}
                        >
                            <ReportIcon size={22} className="todo-icon-edit" color="var(--color-fontbase)" />
                        </button>
                    </div>
                    )
            : (
                <button
                    className={`todo-icon-edit ${isEditing ? 'svg-save' : 'svg-edit'}`}
                        onClick={handleEditClikBtn}
                    style={{
                        display: "flex",
                        borderRadius: "var(--br-circle)",
                        aspectRatio: 1,
                        padding: 0,
                        justifyContent: "center",
                        position: "absolute"
                    }}
                    data-todo-info-btn={fieldName}
                >
                
                    <EditIcon size={22} className="todo-icon-edit" color="var(--color-fontbase)" />
                </button>
            )}
            {/* Dynamic Input Field */}
            {renderInput()}
        </div>
    )

}


import * as React from 'react'

import {EditIcon, ReportIcon, SaveIcon } from './icons'
import { ToDoIssue } from '../classes/ToDoIssue'
import { ToDoFieldText } from './ToDoFieldText'
import { ToDoFieldTextArea } from './ToDoFieldTextArea'
import { ToDoFieldSelect } from './ToDoFieldSelect'
import { ToDoFieldArray, IToDoFieldArrayRef } from './ToDoFieldArray'
import { IAssignedUsers, ITag, StatusColumnKey } from '../Types'
import { ToDoFieldDate } from './ToDoFieldDate'



interface Props {    
    fieldName: keyof ToDoIssue
    value: string | Date | ITag[] | IAssignedUsers[];
    type: 'text' | 'textarea' | 'array' | 'date' | 'select'
    onSave: ( fieldDataName: string, newValueDataField: any ) => void
    style?: React.CSSProperties
    options?: string[]
    onEditStart?: () => void
    onEditEnd?: () => void
}

export function ToDoEditableField({    
    fieldName,
    value: initialValue,
    onSave,
    type = 'text',
    options = [],
    style = {},
    onEditStart,
    onEditEnd,
    ...props
}: Props) {

    const [isEditing, setIsEditing] = React.useState(false)    
    
    // Referencias para los componentes hijos
    const textRef = React.useRef<{ handleSave: () => void }>(null);
    const textAreaRef = React.useRef<{ handleSave: () => void }>(null);
    const selectRef = React.useRef<{ handleSave: () => void }>(null);
    const dateRef = React.useRef<{ handleSave: () => void }>(null);
    const arrayRef = React.useRef<{ handleSave: () => void }>(null);



    // Notificar al padre cuando cambia el estado local
    React.useEffect(() => {
        if (isEditing ) {
            onEditStart?.();
        } else {
            onEditEnd?.();
        }
    }, [isEditing, onEditStart, onEditEnd]);


    const handleEditClikBtn = () => {
        setIsEditing(true)
    };

    const handleSaveClickBtn = (newValue:any) => {
        try {
            // Determine which component is active and call its handleSave
            switch (type) {
                case 'text':
                    textRef.current?.handleSave();
                    break;
                case 'textarea':
                    textAreaRef.current?.handleSave();
                    break;
                case 'select':
                    selectRef.current?.handleSave();
                    break;
                case 'date':
                    dateRef.current?.handleSave();
                    break;
                case 'array':
                    arrayRef.current?.handleSave();
                    break;
            }
        } catch (error) {
            console.error('Error in field update:', error);
        }
    }
    

    const handleCancelClickBtn = () => {
        try {            
            setIsEditing(false)
            onEditEnd?.()
        
        } catch (error) {
            console.error('Error handling cancel:', error);
        }
    }


    // Helper function to render appropriate input type
    function renderInput() {

        switch (type) {
            case 'text':
                return (
                    <ToDoFieldText
                        ref={textRef}
                        value={initialValue as string}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        onSave={(newValue) => onSave(fieldName, newValue)}
                        onCancel={handleCancelClickBtn}
                        placeholder={`Enter ${fieldName}...`}
                    />
                )
            case 'textarea':
                return (
                    <ToDoFieldTextArea
                        ref={textAreaRef}
                        value={initialValue as string}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        onSave={(newValue) => onSave(fieldName, newValue)}
                        onCancel={handleCancelClickBtn}
                        placeholder={`Leave a comment. Enter ${fieldName}...`}
                    />
                )
            case 'select':
                return (
                    <ToDoFieldSelect
                        ref={selectRef}
                        value={initialValue as StatusColumnKey}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        onChange={(newValue) => onSave(fieldName, newValue)}
                        options={['backlog', 'wip', 'qa', 'completed']}
                    />
                )
            case 'array':
                return (
                    <ToDoFieldArray
                        ref={arrayRef}
                        fieldName={fieldName as 'tags' | 'assignedUsers'}
                        value={initialValue as ITag[] | IAssignedUsers[]}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        onSave={(newValue) => onSave(fieldName, newValue)}
                        onCancel={handleCancelClickBtn}
                        placeholder={`Add ${fieldName === 'tags' ? 'a tag' : 'a user'}..`}
                    />
                )
            case 'date':
                return (
                    <ToDoFieldDate
                        ref={dateRef}
                        fieldName={fieldName}
                        value={initialValue as Date}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        onSave={(newValue) => onSave(fieldName, newValue)}
                        onCancel={handleCancelClickBtn} />
                )
            default:
                return null
        }
    }



    const combinedStyle: React.CSSProperties = {
        display: "flex",
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
                )
            }
            {/* Dynamic Input Field */}
            {renderInput()}
        </div>
    )    
}
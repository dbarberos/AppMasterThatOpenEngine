import * as React from 'react'

import { MessagePopUp, MessagePopUpProps, QuillEditorRef, QuillEditor } from '../react-components';

import {EditIcon, ReportIcon, SaveIcon } from './icons'
import { ToDoIssue } from '../classes/ToDoIssue'
import { ToDoFieldText } from './ToDoFieldText'
import { ToDoFieldTextArea } from './ToDoFieldTextArea'
import { ToDoFieldSelect } from './ToDoFieldSelect'
import { ToDoFieldArray, IToDoFieldArrayRef } from './ToDoFieldArray'
import { IAssignedUsers, ITag, StatusColumnKey } from '../types'
import { ToDoFieldDate } from './ToDoFieldDate'
import { ToDoFieldTextQuill } from './ToDoFieldTextQuill'


interface Props {    
    fieldName: keyof ToDoIssue
    value: string | Date | ITag[] | IAssignedUsers[];
    type: 'text' | 'textarea' | 'textRich' | 'array' | 'date' | 'select'
    onSave: (fieldDataName: string, newValueDataField: any) => Promise<void>
    style?: React.CSSProperties
    options?: string[]
    onEditStart?: () => void
    onEditEnd?: () => void
    toDoIssue: ToDoIssue
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
    toDoIssue,
    ...props
}: Props) {

    const [isEditing, setIsEditing] = React.useState(false)
    const [currentValue, setCurrentValue] = React.useState(initialValue)
    const [isValid, setIsValid] = React.useState(true)
    
    // Referencias para los componentes hijos
    const textRef = React.useRef<{ handleSave: () => void, setIsValid: React.Dispatch<React.SetStateAction<boolean>> }>(null)
    const textAreaRef = React.useRef < { handleSave: () => void, setIsValid: React.Dispatch<React.SetStateAction<boolean>> }>(null)
    const selectRef = React.useRef < { handleSave: () => void, setIsValid: React.Dispatch<React.SetStateAction<boolean>> }>(null)    
    const arrayRef = React.useRef < { handleSave: () => void, setIsValid: React.Dispatch<React.SetStateAction<boolean>> }>(null)
    const dateRef = React.useRef<{ handleSave: () => void, setIsValid: React.Dispatch<React.SetStateAction<boolean>> }>(null)

    const quillRef = React.useRef<{ handleSave: () => void, setIsValid: React.Dispatch<React.SetStateAction<boolean>>}>(null);
    

    const [showMessagePopUp, setShowMessagePopUp] = React.useState(false)
    const [messagePopUpContent, setMessagePopUpContent] = React.useState<MessagePopUpProps | null>(null)


    // UseEffect para actualizar el valor cuando cambia el todo
    React.useEffect(() => {
        if (fieldName === 'statusColumn') {
            console.log('ToDoEditableField: Status column update:', {
                current: currentValue,
                new: initialValue
            });
        }
        setCurrentValue(initialValue);
    }, [initialValue, fieldName, toDoIssue.id]); 


    // Notificar al padre cuando cambia el estado local
    React.useEffect(() => {
        if (isEditing ) {
            onEditStart?.()
        } else {
            onEditEnd?.()
        }
    }, [isEditing, onEditStart, onEditEnd])


    // Update the currentValue when the initialValue prop changes
    React.useEffect(() => {
        if (!isEditing) {
            // Get the updated value from the toDoIssue
            //const updatedValue = toDoIssue[fieldName]
            setCurrentValue(initialValue)
            setIsValid(true)
        } else {
            setCurrentValue(initialValue);
            setIsValid(false);
        }
    }, [initialValue, isEditing]) 

    //}, [toDoIssue, fieldName, isEditing])


    const handleEditClikBtn = () => {
        console.log("ToDoEditableField: handleEditClikBtn - Setting isEditing to true")
        setIsEditing(true)
        setIsValid(false)
    }
    

    const handleSaveClickBtn = async (newValue: any) => {

        console.log("ToDoEditableField: handleSaveClickBtn called", {
            fieldName,
            newValue,
            isValid,
            type,
        });


        if (!isValid) {
            setMessagePopUpContent({
                type: "error",
                title: "Invalid Value",
                message: "The value must be different from the original and cannot be empty.",
                actions: ["Ok"],
                onActionClick: {
                    "Ok": () => setShowMessagePopUp(false),
                },
                onClose: () => setShowMessagePopUp(false),
            })
            setShowMessagePopUp(true)

            console.warn("Cannot save: Field is not valid.");
            return; // Do not proceed if not valid
        }

        try {
            let savedValue
            // Determine which component is active and call its handleSave
            switch (type) {
                case 'text':
                    console.log("ToDoEditableField: Calling textRef.current?.handleSave()");

                    savedValue = await textRef.current?.handleSave()
                    if (typeof savedValue === 'string') {
                        setCurrentValue(savedValue);
                    }
                    break;
                case 'textarea':
                    console.log("ToDoEditableField: Calling textAreaRef.current?.handleSave()");

                    savedValue = await textAreaRef.current?.handleSave()
                    if (typeof savedValue === 'string') {
                        setCurrentValue(savedValue);
                    }
                    break;
                
                
                
                case 'textRich':
                    console.log("ToDoEditableField: Calling textAreaRef.current?.handleSave()");

                    savedValue = await quillRef.current?.handleSave()
                    if (typeof savedValue === 'string') {
                        setCurrentValue(savedValue);
                    }
                    break;
                
                
                
                case 'select':
                    console.log("ToDoEditableField: Calling selectRef.current?.handleSave()");

                    savedValue = await selectRef.current?.handleSave()
                    if (typeof savedValue === 'string') {
                        setCurrentValue(savedValue);
                    }
                    break;
                case 'date':
                    console.log("ToDoEditableField: Calling dateRef.current?.handleSave()");

                    savedValue = await dateRef.current?.handleSave()
                    if (savedValue instanceof Date) {
                        setCurrentValue(savedValue);
                    }                    
                    break;
                case 'array':
                    console.log("ToDoEditableField: Calling arrayRef.current?.handleSave()");

                    savedValue = await arrayRef.current?.handleSave()
                    if (Array.isArray(savedValue)) {
                        setCurrentValue(savedValue);
                    }
                    break;
            }

            console.log("ToDoEditableField: handleSaveClickBtn - After switch, before updating state", { newValue });
            // Update the current value after saving
            //setCurrentValue(newValue)
            if (savedValue !== null && savedValue !== undefined) {
                setIsEditing(false)
                onEditEnd?.()
            }

        } catch (error) {
            console.error('Error during save process in ToDoEditableField:', error)
        } 

    }
    

    const handleCancelClickBtn = () => {
        console.log("ToDoEditableField: handleCancelClickBtn called")
        try {
            setIsEditing(false)
            setCurrentValue(initialValue)
            setIsValid(true)
            onEditEnd?.()
        
        } catch (error) {
            console.error('Error handling cancel:', error)
        }
    }


    // Helper function to render appropriate input type
    function renderInput() {

        switch (type) {
            case 'text':
                return (
                    <ToDoFieldText
                        ref={textRef}
                        value={currentValue as string}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        onSave={(newValue) => {
                            console.log("ToDoEditableField: onSave callback from ToDoFieldText", { newValue })
                            onSave(fieldName, newValue)                            
                        }}
                        onCancel={handleCancelClickBtn}
                        onInvalid={() => setIsValid(false)}
                        setIsValid={setIsValid}
                        isValid={isValid}
                        
                    />
                )
            case 'textarea':
                return (
                    <ToDoFieldTextArea
                        ref={textAreaRef}
                        value={currentValue as string}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        onSave={(newValue) => {
                            
                            onSave(fieldName, newValue)                            
                        }}
                        onCancel={handleCancelClickBtn}
                        onInvalid={() => setIsValid(false)}
                        setIsValid={setIsValid}
                        isValid={isValid}
                        placeholder={`Leave a comment. Enter ${fieldName}...`}
                    />
                )
            case 'textRich':
                return ( 
                <ToDoFieldTextQuill
                    ref={ quillRef} 
                    value={currentValue as string}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing} 
                    onSave={(newValue) => {
                        console.log("ToDoEditableField: onSave callback from ToDoFieldQuill", { newValue });
                        return onSave(fieldName, newValue); // Asegúrate de retornar la promesa si onSave es async
                    }}
                    onCancel={handleCancelClickBtn} 
                    onInvalid={() => setIsValid(false)}
                    setIsValid={setIsValid} 
                    isValid={isValid} 
                    placeholder={`Enter ${fieldName}...`}
                    />
                )            
            case 'select':
                return (
                    <ToDoFieldSelect
                        ref={selectRef}
                        value={currentValue as StatusColumnKey}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        onSave={(newValue) => {
                            onSave(fieldName, newValue)
                        }}
                        onCancel={handleCancelClickBtn}
                        options={['backlog', 'wip', 'qa', 'completed']}
                        isValid={isValid}
                        setIsValid={setIsValid}
                    />
                )
            case 'array':
                return (
                    <ToDoFieldArray
                        ref={arrayRef}
                        fieldName={fieldName as 'tags' | 'assignedUsers'}
                        value={currentValue as ITag[] | IAssignedUsers[]}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        onSave={(newValue) => {
                            onSave(fieldName, newValue)
                            //handleSaveClickBtn(newValue)
                        }}
                        onCancel={handleCancelClickBtn}
                        placeholder={`Add ${fieldName === 'tags' ? 'a tag' : 'a user'}..`}
                        onInvalid={() => setIsValid(false)}
                        setIsValid={setIsValid}
                        isValid={isValid}
                    />
                )
            case 'date':
                return (
                    <ToDoFieldDate
                        ref={dateRef}
                        fieldName={fieldName}
                        value={currentValue as Date}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        onSave={(newValue) => {
                            onSave(fieldName, newValue)
                            //handleSaveClickBtn(newValue)
                        }}
                        onCancel={handleCancelClickBtn}                        
                        setIsValid={setIsValid}
                        isValid={isValid}
                        onInvalid={() => setIsValid(false)}
                    />
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
                            position: 'relative',
                            zIndex: 999,
                        
                        }}
                    >
                        <button
                            className={`todo-icon-edit ${isEditing ? 'svg-save' : 'svg-edit'}`}
                            onClick={handleSaveClickBtn}
                            disabled={!isValid }
                            style={{
                                display: "flex",
                                borderRadius: "var(--br-circle)",
                                aspectRatio: 1,
                                padding: 0,
                                justifyContent: "center",
                                opacity: isValid ? 1 : 0.5,
                                cursor: isValid ? 'pointer' : 'not-allowed'
                            
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
            {showMessagePopUp && messagePopUpContent && (<MessagePopUp {...messagePopUpContent} />)}
        </div>
    )    
}

// Add display name for debugging purposes
ToDoEditableField.displayName = 'ToDoEditableField'

import * as React from 'react'
import { ToDoIssue } from '../classes/ToDoIssue'
import { TODO_STATUSCOLUMN } from '../const'
import { StatusColumnKey } from '../Types'

interface ToDoFieldSelectProps {
    value: StatusColumnKey;
    isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
    //onChange: (value: StatusColumnKey) => void;
    onSave: (value: StatusColumnKey) => void;
    onCancel?: () => void;
    options: Array<ToDoIssue['statusColumn']>;
    selectRef?: React.RefObject<HTMLSelectElement>;
    onInvalid?: () => void;
    setIsValid: React.Dispatch<React.SetStateAction<boolean>>;
    isValid: boolean;
}

export const ToDoFieldSelect = React.forwardRef <
    {
        handleSave: () => void 
        setIsValid: React.Dispatch<React.SetStateAction<boolean>>;
    }, ToDoFieldSelectProps
>(({
    value,
    isEditing,
    setIsEditing,
    //onChange,
    onSave,
    onCancel,
    options,
    selectRef,
    onInvalid,
    setIsValid,
    isValid,
}, ref) => {
    const defaultSelectRef = React.useRef<HTMLSelectElement>(null);
    const actualSelectRef = selectRef || defaultSelectRef;
    const originalValueRef = React.useRef(value);
    const [isSaving, setIsSaving] = React.useState(false)

    //const [hasChanged, setHasChanged] = React.useState(false)


    // Sync local state with props when not editing
    React.useEffect(() => {
        console.log("ToDoFieldSelect: useEffect - Value or isEditing", { value, isEditing });
        if (!isEditing && actualSelectRef.current) {
            actualSelectRef.current.value = value;
            originalValueRef.current = value;
            setIsValid(false);
        }
    }, [value, isEditing]);


    const handleSave = async() => {
        if (!actualSelectRef.current) return

        try {
            setIsSaving(true)
            const newValue = actualSelectRef.current?.value as StatusColumnKey;
            
            if (!newValue) {
                console.warn("ToDoFieldSelect: handleSave - Value empty");
                setIsValid(false);
                return;
            }

            if (newValue === value) {
                console.warn("ToDoFieldSelect: handleSave - Value unchanged");
                setIsValid(false);
                return;
            }

            console.log("ToDoFieldSelect: handleSave - calling onSave", { newValue });
            
            await onSave(newValue);            

            originalValueRef.current = newValue;
            setIsEditing(false);

        } catch (error) {
            console.error('Error saving select field:', error)
            if (actualSelectRef.current) {
                actualSelectRef.current.value = value;
            }
            setIsValid(false);
            onInvalid?.();
        } finally {
            setIsSaving(false);
        }
    }
    // Expose handleSave through ref
    React.useImperativeHandle(ref, () => ({
        handleSave,
        setIsValid
    }))
    

    // Focus management
    React.useEffect(() => {
        if (isEditing && actualSelectRef?.current) {
            actualSelectRef.current.focus();
            actualSelectRef.current.value = value;
        }
    }, [isEditing, value])


    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        console.log("ToDoFieldSelect: handleChange", {
            newValue: e.target.value,
            originalValue: value
        });

        const newValue = e.target.value as StatusColumnKey;
        const isValueValid = newValue !== value;
        setIsValid(isValueValid);
    }


    const handleCancel = () => {
        if (actualSelectRef.current) {
            actualSelectRef.current.value = originalValueRef.current;
        }
        setIsValid(false);
        setIsEditing(false);
        onCancel?.();
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLSelectElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    }

    // const handleChange = () => {
    //     setHasChanged(true);
    // };
    

    // const handleBlur = (e: React.FocusEvent) => {
    //     // Only reset value on blur, don't trigger save
    //     if (actualSelectRef.current && !hasChanged) {
    //         actualSelectRef.current.value = value;
    //     }
    //     setIsEditing(false);
    // }

    return (
        <>
            {/* Overlay when editing */}
            {isEditing && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'var(--color-tododetails-bg)',
                        backdropFilter: 'blur(1px)',
                        zIndex: 997,
                        cursor: 'not-allowed',
                        animation: 'slideInBackdrop 0.3s ease-out',
                    }}
                />
            )}

            <div className="todo-field-select">                
                {/* Display Value */}
                <div
                    style={{
                        display: !isEditing ? 'block' : 'none',
                        padding: "8px 12px",
                        textWrap: "nowrap",
                        marginLeft: 35,
                        fontSize: "var(--font-base)"
                    }}
                >
                    <span
                        className={`todo-tags status-${value}`}
                        data-todo-info="statusColumn"
                    >
                        {TODO_STATUSCOLUMN[value]}
                    </span>
                </div>

                {/* Edit Select */}
                <div
                    style={{
                        display: isEditing ? 'block' : 'none',
                        position: 'relative',
                        zIndex: 998
                    }}
                >
                    <select
                        ref={actualSelectRef}
                        defaultValue={value}
                        onChange={handleChange}
                        onKeyPress={handleKeyPress}
                        //onBlur={handleBlur}
                        className="todo-status-select"
                        data-todo-info-origin="statusColumn"
                        name="statusColumn"
                        id="todo-stagecolumn-detail-select"
                        style={{
                            fontSize: "var(--font-base)",
                            transform: "translateY(-2px) translateX(-10px)",
                            padding: "8px 12px",
                            borderRadius: "var(--br-sm)",
                            border: "1px solid var(--color-border)",
                            background: "var(--color-bg1)",
                            color: "var(--color-fontbase)",
                            cursor: "pointer",
                            minWidth: "150px",
                            opacity: isValid ? 1 : 1
                        }}
                    >
                        {Object.entries(TODO_STATUSCOLUMN)
                            .filter(([key]) => key !== 'notassigned')
                            .map(([key, label]) => (
                            <option
                                key={key}
                                value={key}
                                className={`status-option-${key}`}
                            >
                                {label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </>
    );
})

// Add display name for debugging
ToDoFieldSelect.displayName = 'ToDoFieldSelect';
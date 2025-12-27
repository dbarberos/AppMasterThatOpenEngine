import * as React from 'react';

interface ToDoFieldDateProps {
    fieldName: string;
    value: Date;
    isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
    onSave: (value: Date) => void;
    onCancel?: () => void;    
    isValid: boolean
    setIsValid: React.Dispatch<React.SetStateAction<boolean>>
    onInvalid?: () => void
}

export const ToDoFieldDate = React.forwardRef <
    {
        handleSave: () => void 
        setIsValid: React.Dispatch<React.SetStateAction<boolean>>;
    },

    ToDoFieldDateProps
>(({
    fieldName,
    value,
    isEditing,
    setIsEditing,
    onSave,
    onCancel,    
    setIsValid,
    isValid,
    onInvalid,
}, ref) => {
    const dateInputRef = React.useRef<HTMLInputElement>(null)
    const [editValue, setEditValue] = React.useState<Date>(value);

    //const [selectedDate, setSelectedDate] = React.useState<Date>(value);
    //const [hasChanged, setHasChanged] = React.useState(false);
    const [currentValue, setCurrentValue] = React.useState<Date | null>(value);
    const [isSaving, setIsSaving] = React.useState(false);



    // Reset edit value when value prop changes
    React.useEffect(() => {
        setEditValue(value);
    }, [value]);

    // Focus management
    React.useEffect(() => {
        if (isEditing && dateInputRef.current) {
            dateInputRef.current.focus();
        }
        if (value && dateInputRef.current) {
            dateInputRef.current.value = value.toISOString().split('T')[0];
        }
    }, [isEditing, value])

    //Reset Validity when entering edit mode. Cleanup ehwn unmounting or leaving edit mode
    React.useEffect(() => {
        if (isEditing) {
            setIsValid?.(false)
        }
        return () => {
            setIsValid?.(false);
        }
    }, [isEditing, setIsValid])


    const validateDate = (date: Date): boolean => {
        const isValidDate = !isNaN(date.getTime());
        const isNotPastDate = date >= new Date(new Date().setHours(0, 0, 0, 0))
        const isValid = isValidDate && isNotPastDate
        return isValid
    }


    const handleSave = async() => {
        console.log('💾 ToDoFieldArray - Pre-Save:', {
            fieldName,
            editValue,            
            isSaving
        })
        if (isSaving) return

        try {
            setIsSaving(true)
            // Get the current input value before any state updates
            const inputValue = dateInputRef.current?.value;
            if (!inputValue) {
                setIsValid(false);
                return;
            }

            const newDate = new Date(inputValue)

            // Validate before saving
            const isValidDate = validateDate(newDate);
            const hasChanged = newDate.toISOString().split('T')[0] !== value.toISOString().split('T')[0];

            if (!isValidDate || !hasChanged) {
                setIsValid?.(false)
                onInvalid?.()
                return
            }
            console.log("ToDoFieldDate: handleSave - calling onSave", { newDate })

            await onSave(newDate)

            // Update UI state after save
            setEditValue(newDate);
            setIsEditing(false)
            setIsValid?.(false)

;
        } catch (error) {
            console.error('Error saving date field:', error);
            onInvalid?.()
            setIsValid?.(false)
        }
    }

    // Expose handleSave through ref
    React.useImperativeHandle(ref, () => ({
        handleSave: async () => {
            if (isValid && dateInputRef.current?.value) {
                await handleSave()
                return new Date(dateInputRef.current.value)
            } else {
                return null
            }
        },
        setIsValid
    }), [handleSave, isValid, setIsValid]);


    const handleCancel = () => {
        if (dateInputRef.current && value) {
            dateInputRef.current.value = value.toISOString().split('T')[0];
        }
        setEditValue(value);
        //setSelectedDate(value);
        setIsEditing(false);
        onCancel?.();
    }


    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = new Date(e.target.value)
        setEditValue(newDate)
        // Validate if the new date is valid and diferent from "value"
        const isValidDate = validateDate(newDate);
        const hasChanged = newDate.toISOString().split('T')[0] !== value.toISOString().split('T')[0]
        // Update isValid state
        if (isValidDate && hasChanged) {
            setIsValid?.(true);
        } else {
            setIsValid?.(false);
        }

    }


    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    }

    const formatDate = (date: Date): string => {
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            console.error('Invalid date object:', date);
            return 'Invalid date';
        }

        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    }


    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isOverdue = value < today;



    return (
    <>
        {/* Overlay when editing */ }
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

        <div className="todo-field-date"
            // style={{
            //     display: 'flex',
            //     alignItems: 'center',
            //     gap: '8px'
            //}}
            >
            {/* Display Mode */}
            <div
                style={{
                    display: !isEditing ? 'block' : 'none',
                    padding: "8px 12px",
                    textWrap: "nowrap",
                    marginLeft: 35,
                    fontSize: "var(--font-lg)"
                }}
            >
                <span
                    className="field-display"
                    style={{
                        marginLeft: 25,
                        color: isOverdue ? 'var(--color-warning1)' : 'var(--color-fontbase)',
                        fontWeight: isOverdue ? 'bold' : 'normal'
                    }}
                >
                    {value ? formatDate(value) : 'No date set'}
                    {isOverdue && <span> - The established date is overdue, set a new one.</span>}
                </span>
            </div>
            {/* Edit Mode */}
            <div
                style={{
                    display: isEditing ? 'block' : 'none',
                    position: 'relative',
                    zIndex: 998
                }}>
                <input
                    ref={dateInputRef}
                    data-todo-info-origin="dueDate"
                    id="todo-dueDate-details-input"
                    name="dueDate"
                    type="date"
                    value={editValue.toISOString().split('T')[0]}
                    onChange={handleDateChange}
                    //onBlur={handleBlur}
                    onKeyPress={handleKeyPress}
                    min={new Date().toISOString().split('T')[0]}
                    aria-invalid={!isValid}
                    style={{
                        height: 20,
                        fontSize: "var(--font-lg)",
                        transform: "translateY(0px) translateX(-10px)",
                        minWidth: "75%",
                        width: "fit-content",
                        cursor: "pointer",

                        //padding: '4px 8px',
                        borderRadius: 'var(--br-sm)',
                        position: "relative",
                        zIndex: 998,
                        backgroundColor: 'var(--color-bg)',
                        border: isValid === false ? '1px solid var(--color-error)' : undefined,
                        
                    }}
                />
            </div>

            </div>
        </>
    )
})

// Add display name for debugging
ToDoFieldDate.displayName = 'ToDoFieldDate';
import * as React from 'react';

interface ToDoFieldTextProps {
    value: string;
    isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>; 
    onSave: (value: string) => void;
    onCancel: () => void;
    placeholder?: string;
    inputRef?: React.RefObject<HTMLInputElement>;
    onInvalid: () => void

    setIsValid: React.Dispatch<React.SetStateAction<boolean>>
    isValid: boolean
    
}

export const ToDoFieldText = React.forwardRef<
    {
        handleSave: () => void,
        setIsValid: React.Dispatch<React.SetStateAction<boolean>>
    }, ToDoFieldTextProps>
(({
    value,
    isEditing,
    setIsEditing,
    onSave,
    onCancel,
    placeholder, 
    inputRef,
    onInvalid,
    setIsValid, 
    isValid,
    
}, ref) => {
    
    
    const defaultInputRef = React.useRef<HTMLInputElement>(null)
    const actualInputRef = inputRef || defaultInputRef
    const [currentValue, setCurrentValue] = React.useState(value)
    //const [showTooltip, setShowTooltip] = React.useState(false)
    const originalValueRef = React.useRef(value)
    //const containerRef = React.useRef<HTMLDivElement>(null);
    const [isSaving, setIsSaving] = React.useState(false);

    // Sync local state with props only when not editing
    React.useEffect(() => {
        console.log("ToDoFieldText: useEffect - Value or isEditing", {value, isEditing })
        if (!isEditing) {
            setCurrentValue(value);
            setIsValid(false)
            //setShowTooltip(false)
            originalValueRef.current = value
        }
    }, [value, isEditing]);

    const handleSave = async () => {
        console.log("ToDoFieldText: handleSave called", { isValid, value, currentValue })

        if (!isValid) {
            console.warn("ToDoFieldText: handleSave - Cannot save invalid value");
            return // Do nothing if not valid
        }
        
        try {
            setIsSaving(true)
            // Ensure we're working with the actual string value
            const valueToSave = typeof currentValue === 'string' ? currentValue.trim() : '';

            console.log("ToDoFieldText: handleSave - trimmedValue", { valueToSave })

            // Additional validations. trimmedValue is empty
            if (!valueToSave) {
                console.warn("ToDoFieldText: handleSave - Cannot save empty value");
                setIsValid(false);
                return;
            }

            if (valueToSave === value) {
                console.warn("ToDoFieldText: handleSave - Value unchanged");
                setIsValid(false);
                //setIsEditing(false);
                return;
            }

            console.log("ToDoFieldText: handleSave - calling onSave", { valueToSave })
            await onSave(valueToSave)
            originalValueRef.current = valueToSave;

            // Only set isEditing to false after successful save
            setIsEditing(false)
            
        } catch (error) {
            console.error('Error saving text field:', error)
            console.log("ToDoFieldText: handleSave - Error block", { value, currentValue })
            if (actualInputRef.current) {
                actualInputRef.current.value = value
            }
            setIsValid(false)

        } finally {
            setIsSaving(false)
        }
    }

    // Expose handleSave through ref for parent component
    React.useImperativeHandle(ref, () => ({
        handleSave,
        setIsValid
    }))

    // Focus management and value sync
    React.useEffect(() => {
        console.log("ToDoFieldText: useEffect - isEditing changed", { isEditing, currentValue })
        if (actualInputRef?.current) {
            if (isEditing) {
                actualInputRef.current.focus()
                // Set initial value when entering edit mode
                actualInputRef.current.value = currentValue // Set local state value
                setIsValid(true)
            }
        }
    }, [isEditing, currentValue, setIsValid])


    const handleCancel = () => {
        if (actualInputRef.current) {
            actualInputRef.current.value = originalValueRef.current; // Reset to original value
        }
        setIsValid(false)        
        setIsEditing(false)
        onCancel?.()
    }


    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        console.log("ToDoFieldText: handleKeyPress called", { key: e.key })
        if (e.key === 'Enter') {
            e.preventDefault()
            handleSave()
        } else if (e.key === 'Escape') {
            handleCancel()
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {        
        const newValue = e.target.value
        const trimmedValue = newValue.trim()

        console.log("ToDoFieldText: handleChange", {
            newValue,
            trimmedValue,
            originalValue: value,
            currentValue
        })

        setCurrentValue(newValue)  // Update local state
        
        const newIsValid = trimmedValue !== value && trimmedValue !== "";
        setIsValid(newIsValid)
        
        if (!newIsValid) {
            onInvalid?.(); // Notify parent about invalid value
        }
    }


    // const handleBlur = (e: React.FocusEvent) => {
    //     if (isValid) {
    //         handleSave()
    //     }else {
    //         if (actualInputRef.current) {
    //             actualInputRef.current.value = originalValueRef.current
    //         }
    //         setIsEditing(false)
    //     }
        
    // }


    return (
        <>
            {/* Add overlay when editing */}
            {isEditing && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        //backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
                        background: 'var(--color-tododetails-bg)',
                        backdropFilter: 'blur(1px)',
                        zIndex: 998, // Below the input but above everything else
                        cursor: 'not-allowed'
                    }}
                />
            )}



            <div className="todo-field-text"
                //ref={containerRef}
                style={{
                    position: isEditing ? 'relative' : 'static',
                    zIndex: isEditing ? 999 : 'auto' // Above the overlay
                }}
            >
                
                {/* Display Value */} 
                <h2
                    className="field-display"
                    style={{
                        marginLeft: 25,
                        display: !isEditing ? 'block' : 'none'
                    }}
                >
                    {String(value)}
                </h2>

                {/* Edit Input */}
                <input
                    ref={actualInputRef}
                    type="text"
                    defaultValue={currentValue}
                    onKeyPress={handleKeyPress}
                    onChange={handleChange}
                    //onBlur={handleBlur}
                    className="title-todo-card"
                    placeholder={placeholder}
                    style={{
                        height: "20px",
                        fontSize: "var(--font-3xl)",
                        transform: "translateY(-2px) translateX(-40px)",
                        display: isEditing ? 'block' : 'none',
                        marginLeft: 15,
                        zIndex: 999,
                    }}
                    data-todo-info-origin="title"
                    name="title"
                    required
                    minLength={5}
                />
            </div>
        </>
    );
})

// Add display name for debugging purposes
ToDoFieldText.displayName = 'ToDoFieldText'




import * as React from 'react';

interface ToDoFieldTextProps {
    value: string;
    isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>; 
    onSave: (value: string) => void;
    onCancel: () => void;
    placeholder?: string;
    inputRef?: React.RefObject<HTMLInputElement>;
}

export const ToDoFieldText = React.forwardRef<
    { handleSave: () => void }, ToDoFieldTextProps>
(({
    value,
    isEditing,
    setIsEditing,
    onSave,
    onCancel,
    placeholder, 
    inputRef
},ref ) => {
    
    const defaultInputRef = React.useRef<HTMLInputElement>(null);
    const actualInputRef = inputRef || defaultInputRef;
    const [hasInputChanged, setHasInputChanged] = React.useState(false);
    const [previousValue, setPreviousValue] = React.useState(value);

    const handleSave = async() => {
        try {
            const currentValue = actualInputRef.current?.value.trim();
            if (currentValue && currentValue !== value ) {
                setPreviousValue(currentValue)
                await onSave(currentValue)
                setHasInputChanged(false)
                
            }
            setIsEditing(false)
            
        } catch (error) {
            console.error('Error saving text field:', error)
            if (actualInputRef.current) {
                actualInputRef.current.value = previousValue;
            }
        }
    }

    // Expose handleSave through ref for parent component
    React.useImperativeHandle(ref, () => ({
        handleSave
    }))

    // Focus management and value sync
    React.useEffect(() => {
        if (actualInputRef?.current) {
            if (isEditing) {
                actualInputRef.current.focus()
            }
            // Set initial value when entering edit mode
            actualInputRef.current.value = value
        }
    }, [isEditing, value])


    const handleCancel = () => {
        if (actualInputRef.current) {
            actualInputRef.current.value = value
        }
        setHasInputChanged(false)
        setIsEditing(false)
        onCancel?.()
    }


    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleSave()
        } else if (e.key === 'Escape') {
            handleCancel()
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHasInputChanged(true)
    }


    const handleBlur = (e: React.FocusEvent) => {
        // Only reset value on blur, don't trigger save
        if (actualInputRef.current && !hasInputChanged) {
            actualInputRef.current.value = value
        }
        setIsEditing(false)
    }


    return (
        <div className="todo-field-text">
            {/* Display Value */}
            <h2
                className="field-display"
                style={{
                    marginLeft: 25,
                    display: !isEditing ? 'block' : 'none'
                }}
            >
                {value}
            </h2>

            {/* Edit Input */}
            <input
                ref={actualInputRef}
                type="text"
                defaultValue={value}
                onKeyPress={handleKeyPress}
                onChange={handleChange}
                onBlur={handleBlur}
                className="title-todo-card"
                placeholder={placeholder}
                style={{
                    height: "20px",
                    fontSize: "var(--font-3xl)",
                    transform: "translateY(-2px) translateX(40px)",
                    display: isEditing ? 'block' : 'none',
                    marginLeft: 15,
                }}
                data-todo-info-origin="title"
                name="title"
                required
                minLength={5}
            />
        </div>
    );
})

// Add display name for debugging purposes
ToDoFieldText.displayName = 'ToDoFieldText'




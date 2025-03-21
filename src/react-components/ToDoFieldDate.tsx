import * as React from 'react';

interface ToDoFieldDateProps {
    fieldName: string;
    value: Date;
    isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
    onSave: (value: Date) => void;
    onCancel?: () => void;
}

export const ToDoFieldDate = React.forwardRef <
    { handleSave: () => void },
    ToDoFieldDateProps
>(({
    fieldName,
    value,
    isEditing,
    setIsEditing,
    onSave,
    onCancel
}, ref) => {
    const [selectedDate, setSelectedDate] = React.useState<Date>(value);
    const [hasChanged, setHasChanged] = React.useState(false);
    const dateInputRef = React.useRef<HTMLInputElement>(null);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isOverdue = value < today;


    const handleSave = () => {
        try {
            const currentValue = dateInputRef.current?.value;
            if (currentValue && hasChanged) {
                const newDate = new Date(currentValue);
                if (!isNaN(newDate.getTime()) && newDate.toISOString() !== value?.toISOString()) {
                    onSave(newDate);
                    setHasChanged(false);
                }
            }
            setIsEditing(false);
            onSave?.(selectedDate);
        } catch (error) {
            console.error('Error saving date field:', error);
        }
    }

    // Expose handleSave through ref
    React.useImperativeHandle(ref, () => ({
        handleSave
    }));



    React.useEffect(() => {
        if (dateInputRef.current) {
            if (isEditing) {
                dateInputRef.current.focus();
            }
            if (value) {
                dateInputRef.current.value = value.toISOString().split('T')[0];
            }
        }
    }, [isEditing, value])


    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = new Date(e.target.value);
        setSelectedDate(newDate);
        setHasChanged(true)
    };



    const handleCancel = () => {
        if (dateInputRef.current && value) {
            dateInputRef.current.value = value.toISOString().split('T')[0];
        }
        setSelectedDate(value);
        setIsEditing(false);
        onCancel?.();
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };



    const handleBlur = () => {
        if (!hasChanged) {
            handleCancel();
        }
        setIsEditing(false);
    }

    return (
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
                    position: 'relative'
                }}>
                <input
                    ref={dateInputRef}
                    data-todo-info-origin="dueDate"
                    id="todo-dueDate-details-input"
                    name="dueDate"
                    type="date"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={handleDateChange}
                    onBlur={handleBlur}
                    onKeyPress={handleKeyPress}
                    min={new Date().toISOString().split('T')[0]}
                    style={{
                        height: 20,
                        fontSize: "var(--font-lg)",
                        transform: "translateY(0px) translateX(-10px)",
                        minWidth: "75%",
                        width: "fit-content",
                        cursor: "pointer",

                        //padding: '4px 8px',
                        borderRadius: 'var(--br-sm)'
                    }}
                />
            </div>

        </div>
    )
})

// Add display name for debugging
ToDoFieldDate.displayName = 'ToDoFieldDate';
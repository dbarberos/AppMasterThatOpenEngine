import * as React from 'react'
import { ToDoIssue } from '../classes/ToDoIssue'
import { TODO_STATUSCOLUMN } from '../const'
import { StatusColumnKey } from '../Types'

interface ToDoFieldSelectProps {
    value: StatusColumnKey;
    isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
    onChange: (value: StatusColumnKey) => void;
    onSave?: () => void;
    onCancel?: () => void;
    options: Array<ToDoIssue['statusColumn']>;
    selectRef?: React.RefObject<HTMLSelectElement>;
}

export const ToDoFieldSelect = React.forwardRef <
    { handleSave: () => void },
    ToDoFieldSelectProps
>(({
        
    value,
    isEditing,
    setIsEditing,
    onChange,
    onSave,
    onCancel,
    options,
    selectRef
}, ref) => {
    //const [selectedValue, setSelectedValue] = React.useState<StatusColumnKey>(value);
    const defaultSelectRef = React.useRef<HTMLSelectElement>(null);
    const actualSelectRef = selectRef || defaultSelectRef;
    const [hasChanged, setHasChanged] = React.useState(false)

    const handleSave = () => {
        try {
            const currentValue = actualSelectRef.current?.value as StatusColumnKey;
            if (currentValue && currentValue !== value) {
                onChange(currentValue);
                setHasChanged(false);
            }
            setIsEditing(false);
            onSave?.();
        } catch (error) {
            console.error('Error saving select field:', error);
        }
    }
    // Expose handleSave through ref
    React.useImperativeHandle(ref, () => ({
        handleSave
    }))
    

    // Focus management
    React.useEffect(() => {
        if (isEditing && actualSelectRef?.current) {
            actualSelectRef.current.focus();
            actualSelectRef.current.value = value;
        }
    }, [isEditing, value])




    const handleCancel = () => {
        if (actualSelectRef.current) {
            actualSelectRef.current.value = value;
        }
        setHasChanged(false);
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

    const handleChange = () => {
        setHasChanged(true);
    };
    

    const handleBlur = (e: React.FocusEvent) => {
        // Only reset value on blur, don't trigger save
        if (actualSelectRef.current && !hasChanged) {
            actualSelectRef.current.value = value;
        }
        setIsEditing(false);
    }

    return (
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
                    position: 'relative'
                }}
            >
                <select
                    ref={actualSelectRef}
                    defaultValue={value}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    onBlur={handleBlur}
                    className="todo-status-select"
                    data-todo-info-origin="statusColumn"
                    name="statusColumn"
                    id="todo-stagecolumn-detail-select"
                    style={{
                        fontSize: "var(--font-base)",
                        transform: "translateY(0px) translateX(-10px)",
                        padding: "8px 12px",
                        borderRadius: "var(--br-sm)",
                        border: "1px solid var(--color-border)",
                        background: "var(--color-bg1)",
                        color: "var(--color-fontbase)",
                        cursor: "pointer",
                        minWidth: "150px",
                        opacity: 0.5
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
    );
})

// Add display name for debugging
ToDoFieldSelect.displayName = 'ToDoFieldSelect';
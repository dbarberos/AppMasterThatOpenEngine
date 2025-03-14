import * as React from 'react'
import { ToDoIssue } from '../classes/ToDoIssue'
import { TODO_STATUSCOLUMN } from '../const'
import { StatusColumnKey } from '../Types'

interface ToDoFieldSelectProps {
    value: StatusColumnKey;
    isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
    onChange: (value: StatusColumnKey) => void;
    options: Array<ToDoIssue['statusColumn']>;
    selectRef?: React.RefObject<HTMLSelectElement>;
}

export function ToDoFieldSelect({
    value,
    isEditing,
    setIsEditing,
    onChange,
    options,
    selectRef
}: ToDoFieldSelectProps) {
    const [selectedValue, setSelectedValue] = React.useState<StatusColumnKey>(value);

    // Update local state when prop changes
    React.useEffect(() => {
        setSelectedValue(value);
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedValue(e.target.value as StatusColumnKey)
    }

    React.useEffect(() => {
        if (isEditing && selectRef?.current) {
            selectRef.current.focus();
        }
    }, [isEditing, selectRef])
    

    const handleBlur = () => {
        if (selectedValue !== value) {
            onChange(selectedValue);
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
                    ref={selectRef}
                    value={selectedValue}
                    onChange={handleChange}
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
}
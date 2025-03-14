import * as React from 'react';

interface ToDoFieldTextProps {
    value: string;
    isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>; 
    onChange: (value: string) => void;
    placeholder?: string;
    inputRef?: React.RefObject<HTMLInputElement>;
}

export function ToDoFieldText({
    value,
    isEditing,
    setIsEditing,
    onChange,
    placeholder,
    inputRef
}: ToDoFieldTextProps) {

    const [inputValue, setInputValue] = React.useState(value)

    // Reset input value when editing mode changes
    React.useEffect(() => {
        setInputValue(value);
    }, [isEditing, value]);

    const handleBlur = () => {
        // Reset to original value if not saved
        setInputValue(value);
        setIsEditing(false);
        onChange(value);

    };


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
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
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
}

// style = {{
//     transform: !isEditing ? "translatex(15px)" : "translatex(35px)"
// }}>
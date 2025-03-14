import * as React from 'react';

interface ToDoFieldTextAreaProps {
    value: string;
    isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
    onChange: (value: string) => void;
    placeholder?: string;
    textAreaRef?: React.RefObject<HTMLTextAreaElement>;
}

export function ToDoFieldTextArea({
    value,
    isEditing,
    setIsEditing,
    onChange,
    placeholder,
    textAreaRef
}: ToDoFieldTextAreaProps) {

    const [inputValue, setInputValue] = React.useState(value);

    const [rowsHeight, setRowsHeight] = React.useState(28)


    React.useEffect(() => {
        setInputValue(value);
    }, [isEditing,value])


    React.useEffect(() => {
        const updateTextAreaSize = () => {
            const parentElement = document.querySelector('.father-todoissue-textarea')
            if (parentElement) {
                const parentHeight = parentElement.getBoundingClientRect().height;
                setRowsHeight(parentHeight)
            }
        }
        if (isEditing) {
            setTimeout(updateTextAreaSize, 0);
            window.addEventListener('resize', updateTextAreaSize);
        }
        return () => {
            window.removeEventListener('resize', updateTextAreaSize);
        };
    }, [isEditing, textAreaRef, inputValue]);


    React.useEffect(() => {
        if (isEditing && textAreaRef?.current) {
            textAreaRef.current.focus();
        }
    }, [isEditing]);



    const handleBlur = () => {
        onChange(value)
        setIsEditing(false)
        setInputValue(value)
    }


    return (
        <div
            className="todo-field-textarea"
            style={{
                width: "100%",
                position: !isEditing ? "relative" : "absolute",
                height: !isEditing ? "fit-content" : "calc(100vh - 900px)",
                display: "flex",
                flexDirection: "column"
            }}
        >
            <fieldset
                className="todo-fieldset father-todoissue-textarea-fielset"
                style={{ width: "94%", marginLeft: 30, display: "flex", flexDirection: "column" }}
            >
                <legend style={{
                    transform: !isEditing ? "translatex(15px)" : "translatex(40px)"
                }}>
                    <h3>Issue Description: </h3>
                </legend>

                {/* Display Value */}
                <div style={{ width: "90%", maxHeight: "calc(100% - 900px)", display: !isEditing ? 'block' : 'none' }}>
                    <p
                        data-todo-info="description"
                        style={{
                            height: "fit-content",
                            color: "var(--color-fontbase)"

                        }}
                    >
                        {value}
                    </p>
                </div>

                {/* Edit Textarea */}
                <div
                    style={{
                        height: "auto",
                        flexDirection: "column",
                        flexGrow: 1,
                        transition: "min-height 0.3s ease",
                        display: isEditing ? 'block' : 'none'
                    }}
                    className="father-todoissue-textarea"
                >
                    <textarea
                        ref={textAreaRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onBlur={handleBlur}
                        data-todo-info-origin="description"
                        name="description"
                        id=""
                        style={{
                            resize: "vertical",
                            scrollbarWidth: "none",
                            fontSize: "var(--font-base)",
                            transform: "translateY(-15px) translateX(13px)",
                            maxHeight: "1000px",
                            minHeight: "200px",
                            height: rowsHeight,
                            overflow: "visible",
                            whiteSpace: "pre-wrap",
                            borderRadius: "var(--br-sm)",
                            marginLeft: 5,

                        }}
                        cols={66}
                        placeholder={placeholder}
                    />
                </div>
            </fieldset>
        </div>
    );
}
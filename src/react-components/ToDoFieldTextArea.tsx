import * as React from 'react';

interface ToDoFieldTextAreaProps {
    value: string;
    isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
    onSave?: (value: string) => void;
    onCancel?: () => void;
    placeholder?: string;
    textAreaRef?: React.RefObject<HTMLTextAreaElement>;
}

export const ToDoFieldTextArea = React.forwardRef <
    { handleSave: () => void }, ToDoFieldTextAreaProps>
(({
    value,
    isEditing,
    setIsEditing,
    onSave,
    onCancel,
    placeholder,
    textAreaRef
},ref) => {

    //const [inputValue, setInputValue] = React.useState(value);
    const defaultTextAreaRef = React.useRef<HTMLTextAreaElement>(null)
    const actualTextAreaRef = textAreaRef || defaultTextAreaRef
    const [rowsHeight, setRowsHeight] = React.useState(28)

    const handleSave = () => {
        try {
            const currentValue = actualTextAreaRef.current?.value.trim();
            if (currentValue && currentValue !== value) {
                onSave?.(currentValue);
            }
            setIsEditing(false);
        } catch (error) {
            console.error('Error saving text area:', error);
        }
    }

    // Expose handleSave through ref
    React.useImperativeHandle(ref, () => ({
        handleSave
    }))


    // React.useEffect(() => {
    //     setInputValue(value);
    // }, [isEditing,value])


    // Handle text area size updates
    React.useEffect(() => {
        const updateTextAreaSize = () => {
            const parentElement = document.querySelector('.father-todoissue-textarea')
            if (parentElement) {
                const parentHeight = parentElement.getBoundingClientRect().height;
                setRowsHeight(parentHeight)
            }
        }
        if (isEditing) {
            setTimeout(updateTextAreaSize, 5)
            window.addEventListener('resize', updateTextAreaSize)
        }
        return () => {
            window.removeEventListener('resize', updateTextAreaSize)
        }
    }, [isEditing, textAreaRef])


    React.useEffect(() => {
        if (actualTextAreaRef?.current) {
            if (isEditing) {
                actualTextAreaRef.current.focus()
            }
            // Set initial value when entering edit mode
            actualTextAreaRef.current.value = value;
        }
    }, [isEditing, value])




    const handleCancel = () => {
        if (actualTextAreaRef.current) {
            actualTextAreaRef.current.value = value;
        }
        setIsEditing(false);
        onCancel?.();
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Escape') {
            handleCancel();
        }
    }


    const handleBlur = () => {
        // Only reset value on blur, don't trigger save
        if (actualTextAreaRef.current) {
            actualTextAreaRef.current.value = value;
        }
        setIsEditing(false);
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
                        ref={actualTextAreaRef}
                        defaultValue={value}
                        onKeyPress={handleKeyPress}
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
})


// Add display name for debugging
ToDoFieldTextArea.displayName = 'ToDoFieldTextArea';
import * as React from 'react';

interface ToDoFieldTextAreaProps {
    value: string;
    isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
    onSave?: (value: string) => void;
    onCancel?: () => void;
    placeholder?: string;
    textAreaRef?: React.RefObject<HTMLTextAreaElement>;
    onInvalid?: () => void;
    setIsValid: React.Dispatch<React.SetStateAction<boolean>>;
    isValid: boolean;
}

export const ToDoFieldTextArea = React.forwardRef <
    {
        handleSave: () => void 
        setIsValid: React.Dispatch<React.SetStateAction<boolean>>;
    },
    ToDoFieldTextAreaProps>
(({
    value,
    isEditing,
    setIsEditing,
    onSave,
    onCancel,
    placeholder,
    textAreaRef,
    onInvalid,
    setIsValid,
    isValid,
},ref) => {

    const defaultTextAreaRef = React.useRef<HTMLTextAreaElement>(null)
    const actualTextAreaRef = textAreaRef || defaultTextAreaRef
    const [rowsHeight, setRowsHeight] = React.useState(28)

    //const [currentValue, setCurrentValue] = React.useState(value);
    const originalValueRef = React.useRef(value);
    //const containerRef = React.useRef<HTMLDivElement>(null);
    const [isSaving, setIsSaving] = React.useState(false);





    // Sync local state with props when not editing
    React.useEffect(() => {
                if (!isEditing) {
            //setCurrentValue(value);
            setIsValid(false);
            originalValueRef.current = value;
        }
    }, [value, isEditing])




    // // Validation check function
    // const checkValidity = (newValue: string): boolean => {
    //     const trimmedValue = newValue.trim();
    //     return trimmedValue !== value && trimmedValue !== "";
    // };


    const handleSave = () => {
        if (!actualTextAreaRef.current) return;

        // if (!isValid) {
        //     console.warn("ToDoFieldTextArea: handleSave - Cannot save invalid value");
        //     return;
        // }

        try {
            setIsSaving(true)
            const valueToSave = actualTextAreaRef.current.value.trim();
            // const isValueValid = checkValidity(valueToSave);
            // setIsValid(isValueValid);
            
            // const valueToSave = typeof currentValue === 'string' ? currentValue.trim() : '';
            // if (!isValueValid) {
            //     console.warn("ToDoFieldTextArea: handleSave - Invalid value");
            //     return;
            // }

            if (!valueToSave) {
                console.warn("ToDoFieldTextArea: handleSave - Cannot save empty value");
                setIsValid(false);
                return;
            }

            if (valueToSave === value) {
                console.warn("ToDoFieldTextArea: handleSave - Value unchanged");
                setIsValid(false);
                return;
            }

            console.log("ToDoFieldText: handleSave - calling onSave", { valueToSave })
            onSave?.(valueToSave)
            originalValueRef.current = valueToSave;
            setIsEditing(false);
        } catch (error) {
            console.error('Error saving text area:', error)
            if (actualTextAreaRef.current) {
                actualTextAreaRef.current.value = value;
            }
            setIsValid(false);
        } finally {
            setIsSaving(false);        
        }
    }

    // Expose handleSave through ref
    React.useImperativeHandle(ref, () => ({
        handleSave,
        setIsValid
    }))

    // Update textarea content when value prop changes
    React.useEffect(() => {
        if (!isEditing && actualTextAreaRef.current) {
            actualTextAreaRef.current.value = value;
            originalValueRef.current = value;
            setIsValid(false);
        }
    }, [value, isEditing]);



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




    // Focus management and value sync
    React.useEffect(() => {
        console.log("ToDoFieldTextArea: useEffect - isEditing changed", { isEditing, value })

        if (actualTextAreaRef?.current) {
            if (isEditing) {
                actualTextAreaRef.current.focus()
            
                // Set initial value when entering edit mode
                actualTextAreaRef.current.value = value // Set local state value
                setIsValid(true)
            } else {
                actualTextAreaRef.current.value = value;
                setIsValid(false);
            }
            originalValueRef.current = value;

        }
    }, [isEditing, value])




    const handleCancel = () => {        
        if (actualTextAreaRef.current) {
            actualTextAreaRef.current.value = originalValueRef.current // Reset to original value
        }
        setIsValid(false)
        setIsEditing(false)
        onCancel?.();
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Escape') {
            handleCancel();
        }
    }


    // const handleBlur = () => {
    //     // Only reset value on blur, don't trigger save
    //     if (actualTextAreaRef.current) {
    //         actualTextAreaRef.current.value = value;
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
                        background: 'var(--color-tododetails-bg-dark)',
                        backdropFilter: 'blur(5px)',
                        zIndex: 997,
                        cursor: 'not-allowed',
                        animation: 'slideInBackdrop 0.3s ease-out',
                    }}
                />
            )}

            <div
            className="todo-field-textarea"
            style={{                
                position: !isEditing ? "relative" : "fixed",
                zIndex: isEditing ? 998 : 'auto',
                width: !isEditing ? "100%" : "585px",
                //height: !isEditing ? "fit-content" : "calc(100vh - 1200px)",
                height: !isEditing ? "fit-content" : "calc(100vh - 100px)", 
                //maxHeight: "calc(100% - 1400px)",
                maxHeight: !isEditing ? "fit-content" : "calc(100vh - 400px)",
                
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                transform: isEditing ? "translateX(-0px)" : "translateX(0px)",
                transition: "all 0.4s ease-in -out",

            }}
            >
                <fieldset
                    className="todo-fieldset father-todoissue-textarea-fielset"
                    style={{
                        width: isEditing ? "94%": "94%",
                        marginLeft: 30,
                        display: "flex",
                        flexDirection: "column",
                        position: 'relative',
                        transition: "all 0.2s ease-in -out",
                    }}
                >
                    <legend style={{
                        transform: !isEditing ? "translatex(15px)" : "translatex(40px)",
                        transition: "all 0.4s ease-in -out",
                    }}>
                        <h3>Issue Description: </h3>
                    </legend>

                    {/* Display Value */}
                    <div
                        style={{
                            display: !isEditing ? 'block' : 'none',
                            width: "90%",
                            maxHeight: "calc(100% - 1400px)",
                        }}>
                        <p
                            data-todo-info="description"
                            style={{
                                height: "fit-content",
                                color: "var(--color-fontbase)",

                                whiteSpace: "pre-wrap", 
                                wordWrap: "break-word", 
                                overflow: "auto", 
                                lineHeight: "1.5",
                                padding: "10px",
                                transition: "all 0.4s ease-in -out",
                            }}
                        >
                            {String(value)}
                        </p>
                    </div>

                    {/* Edit Textarea */}
                    <div
                        style={{
                            height: "auto",
                            flexDirection: "column",
                            flexGrow: 1,
                            transition: "min-height 0.3s ease",
                            display: isEditing ? 'block' : 'none',
                            zIndex: 997,
                            
                        }}
                        className="father-todoissue-textarea"
                    >
                        <textarea
                            ref={actualTextAreaRef}
                            //value={currentValue}
                            defaultValue={value}
                            onKeyPress={handleKeyPress}
                            //onBlur={handleBlur}
                            data-todo-info-origin="description"
                            name="description"
                            id=""
                            placeholder={placeholder}
                            style={{
                                
                                height: rowsHeight,
                                minHeight: "200px",
                                maxHeight: "1000px",
                                resize: "vertical",
                                scrollbarWidth: "none",
                                fontSize: "var(--font-base)",
                                transform: "translateY(-15px) translateX(13px)",
                                overflow: "visible",
                                whiteSpace: "pre-wrap",
                                borderRadius: "var(--br-sm)",
                                marginLeft: 5,
                                transition: "all 0.4s ease-in -out",
                            }}
                            cols={61}
                            
                        />
                    </div>
                </fieldset>
            </div>
        </>
    );
})


// Add display name for debugging
ToDoFieldTextArea.displayName = 'ToDoFieldTextArea';
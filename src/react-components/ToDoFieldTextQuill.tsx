import * as React from 'react';
//import DOMPurify from 'dompurify'; // Necesario si usas dangerouslySetInnerHTML para mostrar

import { QuillEditor, QuillEditorRef } from './QuillEditor'; // Importa tu QuillEditor


interface ToDoFieldQuillProps {
    value: string; // Contenido HTML inicial
    isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
    onSave: (value: string) => Promise<void> | void; // Función para guardar el HTML
    onCancel: () => void;
    placeholder?: string;
    textAreaRef?: React.RefObject<HTMLTextAreaElement>;
    setIsValid: React.Dispatch<React.SetStateAction<boolean>>;
    isValid: boolean;
    onInvalid?: () => void; // Opcional: si necesitas una acción específica en caso inválido
}


export const ToDoFieldTextQuill = React.forwardRef<
    {
        handleSave: () => Promise<void>
        setIsValid: React.Dispatch<React.SetStateAction<boolean>>;
    },
    ToDoFieldQuillProps>
    (({
        value,
        isEditing,
        setIsEditing,
        onSave,
        onCancel,
        placeholder,
        textAreaRef,
        setIsValid,
        isValid,
        onInvalid,
    }, ref) => {
        console.log("ToDoFieldTextQuill: Rendered with isEditing:", isEditing)

        const [quillContent, setQuillContent] = React.useState(value)
        const quillEditorRef = React.useRef<QuillEditorRef>(null)
        const actualTextAreaRef = textAreaRef || quillContent
        const originalValueRef = React.useRef(value);
        const [isSaving, setIsSaving] = React.useState(false)
        

        // Sincronizar estado interno y validez cuando cambia el modo de edición o el valor inicial
        React.useEffect(() => {
            if (isEditing) {
                setQuillContent(value)
                setIsValid(false);
                originalValueRef.current = value;
            } else {
                //setQuillContent(value);
                setIsValid(true);
            }
        }, [value, isEditing, setIsValid])


        // useEffect para forzar validación inicial
        React.useEffect(() => {
            if (isEditing) {
                const plainText = quillContent.replace(/<[^>]*>/g, '').trim();
                const isValid = plainText.length > 0 && quillContent !== originalValueRef.current;
                setIsValid(isValid);
            }
        }, [isEditing, quillContent]);


        // Callback para QuillEditor cuando el contenido cambia (SOLO EN MODO EDICIÓN)
        const handleQuillChange = React.useCallback((content: { html: string; delta: any }) => {
            if (!isEditing) return; // No hacer nada si no estamos editando

            setQuillContent(content.html); // Actualiza el estado interno

            // Validación:
            const changed = content.html !== originalValueRef.current;
            // Comprobación simple de que no esté vacío (solo espacios o tags vacíos)
            const plainText = content.html.replace(/<[^>]*>/g, '').trim();
            const notEmpty = plainText.length > 0;

            const currentlyValid = changed && notEmpty;
            setIsValid(currentlyValid); // Actualiza la validez en el padre (ToDoEditableField)

            if (!currentlyValid) {
                onInvalid?.(); // Llama a onInvalid si se proporciona
            }
        }, [isEditing, setIsValid, onInvalid, originalValueRef])


        // Función interna para guardar, llamada por el ref
        const handleSave = async () => {
            if (isSaving) return; // Evitar doble guardado

            // Validar ANTES de guardar (aunque isValid ya debería estar actualizado)
            const changed = quillContent !== originalValueRef.current;
            const plainText = quillContent.replace(/<[^>]*>/g, '').trim();
            const notEmpty = plainText.length > 0;

            if (!isValid || !changed || !notEmpty) {
                console.warn("ToDoFieldQuill: Save prevented. No changes or content is empty.");
                setIsValid(false); // Asegura que la validez sea falsa
                onInvalid?.();
                // Podrías mostrar un mensaje al usuario aquí si lo deseas
                return; // No guardar
            }

            // Si la validación pasa (implícito por llegar aquí si isValid es true desde handleQuillChange)
            console.log("ToDoFieldQuill: handleSave - calling onSave prop", { quillContent });
            setIsSaving(true);
            try {
                await onSave(quillContent); // Llama a la función onSave del padre (ToDoEditableField)
                originalValueRef.current = quillContent; // Actualiza el valor original tras guardar
                setIsEditing(false); // Salir del modo edición
                // setIsValid(true); // Opcional: resetear validez para el modo display
            } catch (error) {
                console.error('Error saving Quill content:', error);
                // Podrías manejar el error aquí (mostrar mensaje, etc.)
                // No salimos de edición para que el usuario pueda reintentar o cancelar
                setIsValid(false); // Marcar como inválido si el guardado falló
            } finally {
                setIsSaving(false);
            }
        };



        // Función interna para cancelar
        const handleCancel = () => {
            console.log("ToDoFieldQuill: handleCancel called");
            setQuillContent(originalValueRef.current); // Restaura al valor original guardado
            setIsEditing(false); // Salir del modo edición
            setIsValid(true); // Resetear validez
            onCancel(); // Llama a la función onCancel del padre
        }


            const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === 'Escape') {
                    handleCancel();
                }
            }


        // Exponer handleSave a través del ref para ToDoEditableField
        React.useImperativeHandle(ref, () => ({
            handleSave: handleSave,
            setIsValid
            // handleCancel: handleCancelInternal // Podrías exponer cancel si fuera necesario
        }), [handleSave, setIsValid])

        // // Update textarea content when value prop changes
        // React.useEffect(() => {
        //     if (!isEditing && quillRef.current) {
        //         quillRef.current.getContent = value;
        //         originalValueRef.current = value;
        //         setIsValid(false);
        //     }
        // }, [value, isEditing])
    
        // // Focus management and value sync
        // React.useEffect(() => {
        //     console.log("ToDoFieldTextArea: useEffect - isEditing changed", { isEditing, value })
    
        //     if (quillRef?.current) {
        //         if (isEditing) {
        //             quillRef.current.focus()
                
        //             // Set initial value when entering edit mode
        //             quillRef.current.value = value // Set local state value
        //             setIsValid(true)
        //         } else {
        //             quillRef.current.value = value;
        //             setIsValid(false);
        //         }
        //         originalValueRef.current = value;
    
        //     }
        // }, [isEditing, value])


        const noOp = React.useCallback(() => { }, []);


        return (
            <>
                {/* Overlay semi-transparente cuando se edita */}
                {isEditing && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'var(--color-tododetails-bg-dark)', 
                            backdropFilter: 'blur(1px)', 
                            zIndex: 997, 
                            cursor: 'not-allowed', 
                            animation: 'slideInBackdrop 0.3s ease-out', 
                        }}
                    // Podrías añadir un onClick={handleCancelInternal} si quieres que clickar fuera cancele
                    />
                )}

                
                <div
                    className="todo-field-textarea todo-field-quill-container" 
                    style={{
                        position: !isEditing ? 'relative' : 'fixed', 
                        zIndex: isEditing ? 998 : 'auto', 
                        width: !isEditing ? "100%" : "585px",
                        height: !isEditing ? "fit-content" : "calc(100vh - 100px)",
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
                            width: isEditing ? "94%" : "94%",
                            marginLeft: 30,
                            display: "flex",
                            flexDirection: "column",
                            position: 'relative',
                            transition: "all 0.2s ease-in -out",
                            zIndex: isEditing ? 998 : 'auto',
                            
                            
                        }}
                    >
                        <legend style={{
                            transform: !isEditing ? "translatex(15px)" : "translatex(40px)",
                            transition: "all 0.4s ease-in -out",
                        }}>
                            <h3>Issue Description: </h3>
                        </legend>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: !isEditing ? "fit-content" : "calc(100vh - 400px)", // Altura del contenedor
                                maxHeight: !isEditing ? "fit-content" : "calc(100vh - 400px)",
                                overflow: 'auto'// Altura MÁXIMA del contenedor
                                


                            }}>
                            {/* Renderiza QuillEditor, pasando las props adecuadas */}
                            <QuillEditor
                                ref={quillEditorRef} // Pasa la ref si necesitas llamar métodos de QuillEditor directamente
                                initialValue={isEditing ? quillContent : value} // Usa estado interno si edita, prop si muestra
                                onContentChange={isEditing ? handleQuillChange : noOp} // Solo escucha cambios si edita
                                readOnly={!isEditing} // Controla el modo lectura/escritura
                                placeholder={placeholder || 'Enter description...'} // Placeholder
                            />
                        </div>

                        {/* Podrías añadir botones de Guardar/Cancelar aquí DENTRO si no los maneja ToDoEditableField */}
                        {/* {isEditing && (
                            <div style={{ marginTop: '10px', display: 'flex', gap: '10px', zIndex: 999 }}>
                                <button onClick={handleSaveInternal} disabled={!isValid || isSaving}>
                                    {isSaving ? 'Saving...' : 'Save'}
                                </button>
                                <button onClick={handleCancelInternal} disabled={isSaving}>
                                    Cancel
                                </button>
                            </div>
                        )} */}
                    </fieldset>
                </div>
            </>
        );
    }
    );

// Añadir displayName para debugging
ToDoFieldTextQuill.displayName = 'ToDoFieldQuill';



        
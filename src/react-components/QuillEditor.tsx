import * as React from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import Delta from 'quill-delta'

const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    // ['blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ script: 'sub' }, { script: 'super' }],
    // [{ indent: '-1' }, { indent: '+1' }],
    [{ color: [] }, { background: [] }],
    // [{ font: [] }],
    [{ align: [] }],
    ['link'],
    // ['link', 'image'],
    // ['clean']
];

// Interfaz para las props que QuillEditor acepta
interface QuillEditorProps {
    initialValue?: string;
    onContentChange: (content: { html: string; delta: Delta }) => void;
    readOnly?: boolean; // <--- Añadir prop readOnly
    placeholder?: string; // <--- Añadir placeholder como prop opcional
    // Puedes añadir más props según necesites (placeholder, readOnly, etc.)
}

// Interfaz para lo que se expone a través de la ref (si es necesario)
export interface QuillEditorRef {
    getContent: () => string | undefined;
    setContent: (content: string) => void;
    // focus: () => void; // Descomenta si necesitas y expones focus
    // Podrías añadir métodos aquí si los necesitas, ej:
    focus: () => void;
    // clear: () => void;
    // getInstance: () => Quill | null; // Ejemplo para obtener la instancia
}


export const QuillEditor = React.forwardRef<QuillEditorRef, QuillEditorProps>(
    ({ initialValue = '', onContentChange, readOnly = false, placeholder = 'Leave a comment...' }, ref) => {
        const quillRef = React.useRef<Quill | null>(null) // Ref para la instancia de Quill
        const editorRef = React.useRef<HTMLDivElement>(null) // Ref para el div donde se monta Quill
    //const [isMounted, setIsMounted] = useState(false);

        
        React.useEffect(() => {
            const editorDiv = editorRef.current;
            if (!editorDiv) {
                console.log("QuillEditor: Main useEffect - editorRef.current is null, exiting.")
                return;
            }
        console.log("QuillEditor: useEffect [readOnly, placeholder] running. readOnly:", readOnly)

            const containerDiv = editorDiv.parentElement

            if (!containerDiv) {
                console.log("QuillEditor: Main useEffect - containerDiv is null, exiting.")
                return;
            }
        // --- Limpieza de la instancia anterior (si existe) ---
        // Esto se ejecutará ANTES de la siguiente ejecución del efecto
        // o cuando el componente se desmonte.
        const cleanup = () => {
            console.log("QuillEditor: Cleanup effect running");
            const quillInstance = quillRef.current

            // 1. Limpiar instancia Quill y listeners
            if (quillInstance) {
                console.log("QuillEditor: Cleaning up previous Quill instance.");
                try {
                    quillInstance.off('text-change'); // Desregistrar listeners
                } catch (e) { console.error("QuillEditor: Error detaching listener:", e); }
                quillRef.current = null;
                
            } else {
                console.log("QuillEditor: No Quill instance found in quillRef during cleanup.")
            }

            // 2. Limpiar el DOM del contenedor principal
            //    Verificamos que containerDiv todavía existe en el momento de la limpieza
            if (containerDiv) {
                // Log ANTES de limpiar
                console.log("QuillEditor: Attempting to clear innerHTML of the main container (.quill-container).");
                const toolbarExistsBefore = containerDiv.querySelector('.ql-toolbar');
                console.log("QuillEditor: Toolbar exists in container before clearing?", !!toolbarExistsBefore);

                // *** LA LIMPIEZA AGRESIVA ***
                containerDiv.innerHTML = '';

                // Log DESPUÉS de limpiar
                console.log("QuillEditor: Cleared innerHTML of the main container. New innerHTML length:", containerDiv.innerHTML.length); // Debería ser 0
            } else {
                // Si containerDiv es null aquí, algo raro pasó con el DOM
                console.log("QuillEditor: containerDiv was null during cleanup DOM phase.");
            }



            // 3. Re-adjuntar el div del editor (editorDiv) al contenedor vacío
            //    Es crucial para que la *nueva* instancia de Quill tenga dónde montarse.
            if (containerDiv && editorDiv instanceof HTMLDivElement && !containerDiv.contains(editorDiv)) {
                console.log("QuillEditor: Re-appending editorRef div to the container.");
                containerDiv.appendChild(editorDiv);
            } else if (containerDiv && !(editorDiv instanceof HTMLDivElement)) {
                // Si editorDiv ya no es un elemento válido
                console.error("QuillEditor: editorDiv is not a valid HTMLDivElement after cleanup!");
            }
            console.log("QuillEditor: Cleanup function END");


            // // quillRef.current.destroy(); // Quill no tiene un método destroy() oficial fácil.
            // // En lugar de destroy, limpiamos el contenedor y la ref.
            // // Limpiar el DOM asociado a la instancia anterior

            // // Buscar TODAS las toolbars dentro del contenedor padre
            // const parentContainer = editorRef.current?.parentElement;
            // if (parentContainer) {
            //     const toolbars = parentContainer.querySelectorAll('.ql-toolbar');
            //     console.log(`QuillEditor: Removing ${toolbars.length} toolbar elements.`);
            //     toolbars.forEach(toolbar => toolbar.remove());
            // } 

            // // Eliminar el toolbar desde cualquier nivel del DOM
            // // const toolbars = document.querySelectorAll('.ql-toolbar');
            // // toolbars.forEach(toolbar => {
            // //     if (editorRef.current?.parentElement?.contains(toolbar)) {
            // //         toolbar.remove();
            // //     }
            // // });
            // if (editorRef.current) {
            //     const container = editorRef.current.parentElement; // El div .quill-container
            //     if (container) {
            //         // Buscar y eliminar la barra de herramientas anterior DENTRO del contenedor
            //         const oldToolbar = container.querySelector('.ql-toolbar');
            //         if (oldToolbar) {
            //             console.log("QuillEditor: Removing previous toolbar element.");
            //             oldToolbar.remove(); // Eliminar la barra de herramientas
            //         }
            //     }
            //     // Vaciar el div del editor
            //     editorRef.current.innerHTML = ''; // Vaciar el div
            // }
            // quillRef.current = null; // Limpiar la referencia
        
        };

        // Ejecutar limpieza ANTES de crear la nueva instancia
        cleanup()


        // --- Crear Nueva Instancia ---
        if (!editorRef.current) { // Verificar que editorRef.current (el div) sigue ahí después de la limpieza
            console.error("QuillEditor: editorRef.current is NULL after cleanup! Cannot initialize Quill.");
            return;
        }
        console.log("QuillEditor: Initializing new Quill instance with readOnly:", readOnly);
        let quill: Quill | null = null;
        try {
            quill = new Quill(editorRef.current, { // Usar la ref actualizada
                theme: 'snow',
                modules: { toolbar: readOnly ? false : TOOLBAR_OPTIONS },
                placeholder: readOnly ? '' : placeholder,
                readOnly: readOnly
            });
            quillRef.current = quill;
        } catch (error) {
            console.error("QuillEditor: Error initializing Quill:", error);
            return;
        }
            
            
            
            
            
        // // --- Crear la NUEVA instancia de Quill ---
        // console.log("QuillEditor: Initializing new Quill instance with readOnly:", readOnly)

        // const quill = new Quill(editorRef.current, {
        //     theme: 'snow',
        //     modules: { toolbar: readOnly ? null : TOOLBAR_OPTIONS },
        //     placeholder: readOnly ? '' : placeholder,
        //     readOnly: readOnly
        // });

        // quillRef.current = quill;
        // //setIsMounted(true);
  
        // Handler para cambios (solo si no es readOnly y onContentChange existe)
        if (!readOnly && onContentChange) {
            console.log("QuillEditor: Attaching text-change listener.");
            quill.on('text-change', (delta, oldDelta, source) => {
                if (source === 'user') {
                    const htmlContent = quill.root.innerHTML;
                    const deltaContent = quill.getContents();
                    onContentChange({ html: htmlContent, delta: deltaContent });
                }
            });
        }

        // Cargar contenido inicial
        if (initialValue) {
            console.log("QuillEditor: Setting initial value (HTML):", initialValue.substring(0, 50) + "...");
            //quill.clipboard.dangerouslyPasteHTML(initialValue);
            
            try {
                const delta = quill.clipboard.convert({ html: initialValue });
                quill.setContents(delta, 'silent');
            } catch (error) {
                console.error("Error converting initial HTML to Delta:", error, initialValue);
                // Fallback a dangerouslyPasteHTML si la conversión falla
                quill.clipboard.dangerouslyPasteHTML(initialValue, 'silent');
            }
        }


        // Cleanup
        return () => {
            if (quillRef.current) {
                quillRef.current.off('text-change');
                quillRef.current = null;
            }
            cleanup


        };

    }, [readOnly, placeholder]);
        
        // --- useEffect para Sincronizar initialValue ---
        React.useEffect(() => {
            // Ejecutar solo si Quill está instanciado y el valor externo es diferente
            if (quillRef.current && initialValue !== quillRef.current.root.innerHTML) {
                console.log("QuillEditor: External initialValue changed, updating content.");
                try {
                    const delta = quillRef.current.clipboard.convert({ html: initialValue });
                    // Guardar selección actual si existe
                    const selection = quillRef.current.getSelection();
                    quillRef.current.setContents(delta, 'silent');
                    // Intentar restaurar selección
                    if (selection) {
                        quillRef.current.setSelection(selection.index, selection.length, 'silent');
                    }
                } catch (error) {
                    console.error("Error converting updated initialValue to Delta:", error, initialValue);
                    quillRef.current.clipboard.dangerouslyPasteHTML(initialValue);
                }
            }
            // Dependencia: Solo reacciona a cambios en initialValue
        }, [initialValue]);

        

    // Exponer métodos al componente padre
        React.useImperativeHandle(ref, () => ({
            // Aquí defines lo que el padre puede llamar/acceder
            // Ejemplo:
            // focus: () => {
            //   quillInstanceRef.current?.focus();
            // },
            // clear: () => {
            //    quillInstanceRef.current?.setText('');
            // },
            // getInstance: () => quillInstanceRef.current
            getContent: () => {
                if (quillRef.current) {
                    return quillRef.current.root.innerHTML;
                }
            },
            setContent: (content: string) => {
                // if (quillRef.current) {
                //     quillRef.current.clipboard.dangerouslyPasteHTML(content);
                // }
                if (quillRef.current) {
                    try {
                        const delta = quillRef.current.clipboard.convert({ html: content });
                        quillRef.current.setContents(delta, 'silent');
                    } catch (error) {
                        console.error("Error in setContent via ref:", error, content);
                        quillRef.current.clipboard.dangerouslyPasteHTML(content);
                    }
                }


            },
            focus: () => {
                if (quillRef.current) {
                    quillRef.current.focus();
                }
                },
        }), []); // Dependencias si los métodos dependen de props/state


    // // Sincronización con cambios externos
    // useEffect(() => {
    //     if (quillRef.current && initialValue !== quillRef.current.root.innerHTML) {
    //         quillRef.current.clipboard.dangerouslyPasteHTML(initialValue);
    //     }
    // }, [initialValue]);

        return (
            <div className="quill-editor-root">        
                <div
                    className={`quill-container ${readOnly ? 'ql-read-only' : ''}`}
                    data-readonly={readOnly} 
                >
                    <div
                        ref={editorRef}
                        style={{
                            minHeight: readOnly ? '20px' : '300px',
                            border: 'none',
                            //maxHeight: '30vh',
                            overflowY: 'auto',
                            flexGrow: 1
                        }}
                    />
                </div>
            </div>
    );
})

// Add display name for debugging
QuillEditor.displayName = 'QuillEditor'
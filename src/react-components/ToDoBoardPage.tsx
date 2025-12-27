import * as React from 'react';
import * as Router from 'react-router-dom';
import { deleteToDoWithSubcollections, getSortedTodosForColumn, updateDocument, type UpdateDocumentOptions } from '../services/firebase'


import { ToDoBoardColumn, ToDoCard, ToDoBoardSwitchDnD, ToDoBoardDeleteArea, MessagePopUp, type MessagePopUpProps, ToDoBoardCursor, SearchToDoBox, CounterBox, SearchIcon, ProjectSelector, LoadingIcon, AddIcon, NewToDoIssueForm, ToDoDetailsWindow, ArrowLeftIcon } from '../react-components'
import {KanbanIcon} from './icons'
import { useStickyState } from '../hooks'


import { ProjectsManager } from '../classes/ProjectsManager';
import { Project } from '../classes/Project';
import { ToDoIssue } from '../classes/ToDoIssue';
import { debounce } from '../utils'
import { TODO_STATUSCOLUMN,  TODO_STATUS_MAP_TEXT } from '../const';
import { IToDoIssue, StatusColumnKey, StatusColumnValue } from '../types';


import {
  DndContext,
  DragOverlay,  
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners, // O considera rectIntersection alternativa para collision detection
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  MeasuringStrategy, // Asegúrate que esta importación sea correcta o necesaria
  useDroppable,  
  DropAnimation,
  defaultDropAnimationSideEffects,
  closestCenter,
  rectIntersection,
  DragMoveEvent,
} from '@dnd-kit/core'
import {
  sortableKeyboardCoordinates, // Para accesibilidad con teclado
  arrayMove, // Necesario para reordenar arrays
  SortableContext, // Necesario por columna
  verticalListSortingStrategy // Estrategia para SortableContext
} from '@dnd-kit/sortable'
import {
  //restrictToParentElement,
  //restrictToVerticalAxis,
  restrictToWindowEdges // Modificador útil
} from '@dnd-kit/modifiers';

import { toast } from 'sonner';

import { useAuth } from '../Auth/react-components/AuthContext'; 

// Configuración de la animación de drop
const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5'
      }
    }
  })
};



interface Props {
  projectsManager: ProjectsManager
  onProjectCreate: (updatedProject: Project) => void
  onProjectUpdate: (updatedProject: Project) => void
  onToDoIssueCreated: (createdToDoIssue: ToDoIssue) => void
  //onToDoIssueUpdated: (updatedToDoIssue: ToDoIssue) => void
  onToDoIssueUpdated: (projectId: string, todoId: string, updates: Partial<IToDoIssue>) => Promise<void>
  onToDoIssueDeleted: (projectId: string, todoId: string) => Promise<void>
}

// Definir BOARD_COLUMNS fuera del componente para una referencia estable
const BOARD_COLUMNS = Object.keys(TODO_STATUS_MAP_TEXT) as StatusColumnKey[];


export function ToDoBoardPage({ projectsManager, onProjectCreate, onProjectUpdate, onToDoIssueCreated, onToDoIssueUpdated, onToDoIssueDeleted }: Props) {
  const { currentUser, loading: authLoading } = useAuth();

  console.log('DEBUG: Contenido del array columns:', BOARD_COLUMNS);

  const [isLoading, setIsLoading] = React.useState(true);
  //const [projectId, setProjectId] = React.useState<string | null>(null); // Necesitarás el ID del proyecto actual
  //const [currentProject, setCurrentProject] = React.useState<Project | null>(null);

  const routeParams = Router.useParams<{ id: string }>();
  const currentUrlProjectId = routeParams.id;
  // ELIMINAMOS el estado local para currentProject. Lo derivaremos directamente.
  const currentProject = currentUrlProjectId ? projectsManager.getProject(currentUrlProjectId) : null;

  const navigateTo = Router.useNavigate(); // Añadido para el caso de proyecto no encontrado

  // Estado para almacenar los ToDos, organizados por columna. Un objeto donde las claves son los IDs de las columnas y los valores son arrays de IToDoIssue:
  const [todosByColumn, setTodosByColumn] = React.useState<Record<StatusColumnKey, ToDoIssue[]>>(
    () => Object.fromEntries(BOARD_COLUMNS.map(columnId => [columnId, [] ]))  as Record<StatusColumnKey, ToDoIssue[]>
  );

  const [activeTodo, setActiveTodo] = React.useState<ToDoIssue | null>(null);//Estado para el ToDo activo durante el drag (para el Overlay
  const [isDndEnabled, setIsDndEnabled] = React.useState(false); // Estado para habilitar o deshabilitar el DnD

  // Estado para el término de búsqueda global
  const [searchTerm, setSearchTerm] = React.useState('');

  const [showMessagePopUp, setShowMessagePopUp] = React.useState(false)
  const [messagePopUpContent, setMessagePopUpContent] = React.useState<MessagePopUpProps | null>(null)


  //const [hoveredTodo, setHoveredTodo] = React.useState<ToDoIssue | null>(null); // Comentado si no se usa ToDoBoardCursor
  const [showCursor, setShowCursor] = React.useState(false);
  const [cursorType, setCursorType] = React.useState<'hover' | 'follow'>('hover');
  const [isDragging, setIsDragging] = React.useState(false);

  // Clave para useStickyState: específica del usuario o genérica si no hay usuario.
  const selectedProjectIdKey = currentUser ? `selectedProjectId_${currentUser.uid}` : 'selectedProjectId_guest';
  const [initialProjectIdFromStorage, setInitialProjectIdFromStorage] = useStickyState<string | null>(null, selectedProjectIdKey);
  //const [initialProjectIdFromStorage, setInitialProjectIdFromStorage] = useStickyState<string | null>(null, 'selectedProjectId')

  const [isNewToDoIssueFormOpen, setIsNewToDoIssueFormOpen] = React.useState(false)
  const [isTodoDetailsWindowOpen, setIsTodoDetailsWindowOpen] = React.useState(false)
  const [selectedToDo, setSelectedToDo] = React.useState<ToDoIssue | null>(null)


  // Sensores para dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay:  isDndEnabled ? 400 : 0, // Menor delay si está habilitado, mayor si no para evitar activación accidental,
        tolerance: 5
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })    
  );

  // // Manejadores de eventos para el cursor
  // const handleTodoHover = (todo: ToDoIssue) => {
  //   setHoveredTodo(todo);
  //   setShowCursor(true);
  //   setCursorType('follow');
  // };

  // const handleTodoLeave = () => {
  //   setShowCursor(false);
  //   setHoveredTodo(null);
  // };

// --- Handlers de Drag and Drop ---
  const handleDragStart = React.useCallback((event: DragStartEvent) => {
    console.log('TodoBoardPage: onDragStart triggered', event);
    if (!isDndEnabled || !currentProject) return;

    const { active } = event;

    const activeData = active.data.current;

    if (activeData?.type === 'ToDoItem' && activeData?.todo) {
        const todoInstance = activeData.todo instanceof ToDoIssue 
            ? activeData.todo 
            : new ToDoIssue(activeData.todo);
        setActiveTodo(todoInstance);
        setIsDragging(true); // Para el cursor
        console.log('TodoBoardPage: Active Todo set from event.active.data.current', todoInstance);

    } else {
      // Fallback: Buscar en la lista completa del proyecto actual si active.data.current no está como se espera
        console.warn('TodoBoardPage: event.active.data.current not found or not in expected format. Falling back to manual search.', { activeId: active.id, activeData });
        const todo = currentProject?.todoList.find((t) => t.id === active.id);
        if (todo) {
            const todoInstance = todo instanceof ToDoIssue ? todo : new ToDoIssue(todo);
            setActiveTodo(todoInstance);
            setIsDragging(true); // Para el cursor
            console.log('TodoBoardPage: Active Todo set via manual find (fallback)', todoInstance);
        } else {
            console.error('TodoBoardPage: Active Todo not found even with manual search onDragStart', active.id);
        }
    }
  }, [isDndEnabled, currentProject]);





  const handleDragOver = React.useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !isDndEnabled) return;
    console.log(`TodoBoardPage: onDragOver - Active: ${active.id}, Over: ${over.id}`);
  }, [isDndEnabled]);




  const handleDragEnd = React.useCallback((event: DragEndEvent) => {
    console.log('TodoBoardPage: DragEnd event:', {
      active: { id: event.active.id, data: event.active.data.current },
      over: event.over ? { id: event.over.id, data: event.over.data.current } : null,
    });

    const { active, over } = event;
    const activeId = String(active.id);
    const activeData = active.data.current as { todo?: ToDoIssue, type?: string, columnId?: StatusColumnKey };


    // Guardar estado previo para posible rollback ANTES de cualquier modificación
    // Es importante clonar profundamente si los ToDoIssues son objetos complejos o si se modifican directamente.
    const previousTodosByColumnState = JSON.parse(JSON.stringify(todosByColumn))

    setIsDragging(false); // Para el cursor    

    
    if (!isDndEnabled || !currentProject) {
      console.log('TodoBoardPage: DragEnd - DnD not enabled or no current project. Cleaning activeTodo.')
      setActiveTodo(null); // Limpiar overlay si retornamos temprano
      return
    }


    // --- Obtener el ToDo arrastrado ---
    // Priorizar obtenerlo de active.data.current.todo, que se setea en onDragStart
    const draggedTodo = activeData?.todo instanceof ToDoIssue ? activeData.todo : currentProject.todoList.find(todo => todo.id === activeId);

    if (!draggedTodo) {
      console.error('TodoBoardPage: DragEnd - Dragged todo item not found in active.data.current or currentProject.todoList. Cleaning activeTodo.');
      setActiveTodo(null); // Limpiar overlay
      // No hay ToDo para procesar, salir
      return;
    }
    // Asegurarse de que tenemos una instancia de ToDoIssue
    //const draggedTodo = activeTodoItemInstance instanceof ToDoIssue ? activeTodoItemInstance : new ToDoIssue(activeTodoItemInstance);
    const sourceColumnId = draggedTodo.statusColumn;

    // Limpiar el overlay AHORA que tenemos el draggedTodo
    setActiveTodo(null);


    if (!over) {
      // Si no hay un destino, no hay que hacer nada
      console.log('TodoBoardPage: DragEnd - No over. Cleaning activeTodo.');
      //setActiveTodo(null); // Limpiar overlay
      return;
      
    }




    // --- Escenario 1: Soltar en la Zona de Eliminación ---
    // Se comprueba primero si 'over' existe y si su id es 'delete-zone'
    if (over && over.id === 'delete-zone') {

      console.log(`Attempting to delete ToDo: ${draggedTodo.title}`);
      setMessagePopUpContent({
        type: "warning",
        title: "Confirm TO-DO Deletion",
        message: `Are you sure you want to delete the TO-DO Issue: "${draggedTodo.title}"? All its contents will be deleted too. This action cannot be undone.`,
        actions: ["Delete", "Cancel"],
        onActionClick: {
          "Delete": async () => {
            try {
              
              setShowMessagePopUp(false);
              // Propagar el evento de borrado hacia arriba
              await onToDoIssueDeleted(currentProject.id, draggedTodo.id!);
              toast.success(`ToDo "${draggedTodo.title}" deleted.`)

            } catch (error) {
              // console.error("Error deleting ToDo in Firebase:", error);
              // setTodosByColumn(previousTodosByColumnState); // Rollback en caso de error

              console.error("Error propagating ToDo deletion:", error);
              setMessagePopUpContent({
                type: "error",
                // title: "Error Deleting TO-DO",
                // message: "Failed to delete the TO-DO.",
                title: "Deletion Failed",
                message: "Could not delete the ToDo issue. Please try again.",
                actions: ["Ok"],
                onActionClick: {
                  "Ok": () => setShowMessagePopUp(false)
                },
                onClose: () => setShowMessagePopUp(false)
              });
              setShowMessagePopUp(true);
            }
          },
          "Cancel": () => setShowMessagePopUp(false),
        },
        onClose: () => setShowMessagePopUp(false),
      });
      setShowMessagePopUp(true);
      return;
    }
    

    // Si llegamos aquí, no se soltó en la zona de borrado y 'over' no es null.
    // Ahora es seguro limpiar activeTodo para el overlay, ya que la información del ítem arrastrado (draggedTodo) ya se obtuvo.
    setActiveTodo(null);

    const overId = String(over.id);
    const overData = over.data.current as { type?: string, columnId?: string, isEmpty?: boolean };

    console.log('TodoBoardPage: DragEnd analysis (not delete-zone):', {
        activeId,
        overId,
        overType: overData?.type,
        overColumnIdFromData: overData?.columnId, // Específicamente de over.data.current
        sourceColumnId, // Columna original del 'active'
    });
  

    // --- Determinar Columna de Destino ---
    const overIsAColumn = BOARD_COLUMNS.includes(overId as StatusColumnKey);
    let destinationColumnId: StatusColumnKey | undefined;

    if (overIsAColumn) {
      destinationColumnId = overId as StatusColumnKey;
    } else if (over?.data?.current?.type === 'ToDoItem' && over.data.current.columnId) {      
      destinationColumnId = over.data.current.columnId as StatusColumnKey;
    } else if (over?.data?.current?.type === 'column' && over.data.current.columnId) { // Caso para el droppable de la columna misma
      destinationColumnId = over.data.current.columnId as StatusColumnKey;
    } else {

      console.warn("TodoBoardPage: Could not determine destination column from over.id or over.data.current.columnId. Reverting.");
      return;
    }



    // --- Escenario 2: Mover dentro de la misma columna (Reordenar) ---
    if (sourceColumnId === destinationColumnId) {
      console.log(`TodoBoardPage: Reordering in column ${sourceColumnId}`)
      if (activeId === overId && !overIsAColumn) { // Soltado sobre sí mismo (no sobre la columna)
        console.log("TodoBoardPage: Dropped onto self in same column, no reorder needed.");
        return;
      }
      const currentList = [...(todosByColumn[sourceColumnId] || [])]; // Usar una copia para calcular índices
      const oldIndex = currentList.findIndex(t => t.id === activeId);
       // Si 'over' es la columna, mover al final. Si es un item, encontrar su índice.
      let newIndex = overIsAColumn
        ? currentList.length - 1
        : currentList.findIndex(t => t.id === overId);

      if (oldIndex === -1 || newIndex === -1) {
        console.error("TodoBoardPage: Reorder: Invalid indices", { oldIndex, newIndex, currentList, activeId, overId });
        return
      }
      // Si se suelta sobre la columna y el elemento ya es el último, no hacer nada
      if (overIsAColumn && oldIndex === currentList.length - 1) {
        console.log("TodoBoardPage: Dragged item is already last in the column, no reorder needed.");
        return;
      }
      // Si se suelta sobre un item y es el mismo índice, no hacer nada
      if (!overIsAColumn && oldIndex === newIndex) {
        console.log("TodoBoardPage: Dragged item to the same position, no reorder needed.");
        return;
      }

      const newSortOrder = calculateNewSortOrder(currentList, oldIndex, newIndex);

      if (newSortOrder === null) {
        console.warn("TodoBoardPage: Reorder: Sort order calculation resulted in no change.");
        return;
      }

      setTodosByColumn((prev: Record<StatusColumnKey, ToDoIssue[]>) => {
        const list = [...(prev[sourceColumnId] || [])]; // Clonar la lista de la columna
        const reorderedArray = arrayMove(list, oldIndex, newIndex);
        const updatedList = reorderedArray.map(todo =>
          todo.id === activeId ? new ToDoIssue({ ...todo, sortOrder: newSortOrder }) : todo
        );
        return { ...prev, [sourceColumnId]: updatedList };
      });


      // Persistir el cambio en la fuente de la verdad
      onToDoIssueUpdated(
        currentProject.id!,
        //draggedTodo.id!,
        activeId,
        { sortOrder: newSortOrder }
      )
    }


    // --- Escenario 3: Mover a una columna diferente ---
    else {
      console.log(`TodoBoardPage: Moving from ${sourceColumnId} to ${destinationColumnId}`);
      //const sourceList = todosByColumn[sourceColumnId] || []; // No se usa directamente aquí
      const destinationList = [...(todosByColumn[destinationColumnId] || [])]; // Usar una copia

      // Determinar índice de destino. Si 'over' es la columna, añadir al final. Si es un item, añadir *antes* de ese item.
      let targetIndex = overIsAColumn
        ? destinationList.length // Índice para insertar al final
        : destinationList.findIndex(t => t.id === overId);

      if (targetIndex === -1 && !overIsAColumn) { // Si overId era un item pero no se encontró
        console.warn(`TodoBoardPage: Target item ${overId} not found in destination column ${destinationColumnId}. Moving to end of column.`);
        targetIndex = destinationList.length; // Por defecto, mover al final de la columna de destino
      }

      const newSortOrder = calculateNewSortOrderForColumnMove(destinationList, targetIndex);
      const updatedTodoInstance = new ToDoIssue({ ...draggedTodo, statusColumn: destinationColumnId, sortOrder: newSortOrder });

      setTodosByColumn((prev: Record<StatusColumnKey, ToDoIssue[]>) => {
        const newSourceList = (prev[sourceColumnId!] || []).filter(t => t.id !== activeId);
        const newDestinationList = [...(prev[destinationColumnId] || [])];
        newDestinationList.splice(targetIndex, 0, updatedTodoInstance); // Insertar en la posición correcta
        return { ...prev, [sourceColumnId!]: newSourceList, [destinationColumnId]: newDestinationList };
      });


      // Persistir el cambio en la fuente de la verdad
      onToDoIssueUpdated(
        currentProject.id!,
        //draggedTodo.id!,
        activeId,
        { statusColumn: destinationColumnId, sortOrder: newSortOrder }
      )
      
    }
  //}, [isDndEnabled, currentProject, todosByColumn, onProjectUpdate,  onToDoIssueUpdated, onToDoIssueDeleted, BOARD_COLUMNS, setTodosByColumn, setCurrentProject])
  }, [isDndEnabled, currentProject, todosByColumn, onToDoIssueUpdated, onToDoIssueDeleted])







  // React.useEffect(() => {
  //   if (!currentProject) return;
  //   // Busca el proyecto actualizado en la lista global
  //   const updatedProject = projectsManager.list.find(p => p.id === currentProject.id);
  //   if (updatedProject && updatedProject !== currentProject) {
  //     console.log("ToDoBoardPage: Syncing currentProject with projectsManager.list");
  //     setCurrentProject(updatedProject);
  //   }
  // }, [projectsManager.list, currentProject]);



const handleProjectSelectionInBoard = (newProjectId: string | null) => {
    if (newProjectId !== initialProjectIdFromStorage) {
      setInitialProjectIdFromStorage(newProjectId);
      // El useEffect que depende de initialProjectIdFromStorage se encargará de recargar los datos.
    } // Faltaba el selectedProjectIdKey en las dependencias del useEffect que usa este estado. Se añade abajo.
  };

  // Efecto para NAVEGAR cuando el sticky state (cambiado por el ProjectSelector) no coincide con la URL.
  // Su única responsabilidad es mantener la URL sincronizada con la selección del usuario.
  React.useEffect(() => {
    if (authLoading || !currentUser) return;

    if (initialProjectIdFromStorage && initialProjectIdFromStorage !== currentUrlProjectId) {

      console.log(`ToDoBoardPage: Navigating due to sticky state change. New ID: ${initialProjectIdFromStorage}`);
      navigateTo(`/project/todoBoard/${initialProjectIdFromStorage}`, { replace: true });
    }
  }, [initialProjectIdFromStorage, currentUrlProjectId, navigateTo, authLoading, currentUser]);


  // Efecto para CARGAR DATOS. Se activa cuando la URL cambia o cuando la lista de proyectos del manager se actualiza.
  // Su única responsabilidad es sincronizar el estado local (currentProject, todosByColumn) con los datos de la URL y el manager.
  React.useEffect(() => {
    setIsLoading(true);
    //if (authLoading || !currentUser) {
    if (authLoading) {  
      setIsLoading(false);
      return;
    }

    
    // if (currentUrlProjectId) {
    //   const project = projectsManager.getProject(currentUrlProjectId);
    //   if (project) {
    //     setCurrentProject(project);
    //     const newTodosByColumn = BOARD_COLUMNS.reduce((acc, status) => {
    //       acc[status] = project.todoList
    //         .filter(todo => todo.statusColumn === status)
    //         .sort((a, b) => a.sortOrder - b.sortOrder);
    //       return acc;
    //     }, {} as Record<StatusColumnKey, ToDoIssue[]>);
    //     setTodosByColumn(newTodosByColumn);
    //   } else if (projectsManager.list.length > 0) {
    //     console.warn(`ToDoBoardPage: Project with ID "${currentUrlProjectId}" from URL not found. Redirecting.`);
    //     navigateTo('/');
    //   }



    // Ahora usamos la variable `currentProject` derivada.
    if (currentProject) {
      const newTodosByColumn = BOARD_COLUMNS.reduce((acc, status) => {
        acc[status] = currentProject.todoList
          .filter(todo => todo.statusColumn === status)
          .sort((a, b) => a.sortOrder - b.sortOrder);
        return acc;
      }, {} as Record<StatusColumnKey, ToDoIssue[]>);
      setTodosByColumn(newTodosByColumn);
    } else if (currentUrlProjectId && projectsManager.isReady) {
      // Si hay un ID en la URL pero no se encontró el proyecto Y el manager ya cargó, redirigir.
      console.warn(`ToDoBoardPage: Project with ID "${currentUrlProjectId}" from URL not found. Redirecting.`);
      navigateTo('/');



    } else {


      // // No hay ID en la URL, limpiar el tablero
      // setCurrentProject(null);
      // const newTodosByColumn = BOARD_COLUMNS.reduce((acc, status) => {
      //   acc[status] = [];
      //   return acc;
      // }, {} as Record<StatusColumnKey, ToDoIssue[]>);
      // setTodosByColumn(newTodosByColumn);


      // No hay proyecto seleccionado o no se ha encontrado aún, limpiar el tablero.
      setTodosByColumn(Object.fromEntries(BOARD_COLUMNS.map(columnId => [columnId, []])) as Record<StatusColumnKey, ToDoIssue[]>);
    }
    setIsLoading(false);

  //}, [currentUrlProjectId, projectsManager, authLoading, currentUser, navigateTo])
  }, [currentProject, currentUrlProjectId, projectsManager.isReady, authLoading, navigateTo]);


  // --- Lógica de Búsqueda y Filtrado ---

  // Handler debounced para la búsqueda
  const debouncedSearch = React.useMemo(
    () => debounce((value: string) => {
      console.log('TodoBoardPage: Setting search term:', value);
      setSearchTerm(value);
    }, 250), // 250ms debounce
    [] // El debounce en sí no cambia
  );

  const handleSearchChange = React.useCallback((value: string) => {
    debouncedSearch(value);
  }, [debouncedSearch]);

  // Calcular la lista filtrada usando useMemo
  const filteredTodosByColumn = React.useMemo(() => {
    if (!searchTerm.trim()) {
      console.log('TodoBoardPage: Search term empty, returning original todosByColumn');
      return todosByColumn; // Devuelve el original si no hay búsqueda
    }

    console.log('TodoBoardPage: Filtering with:', searchTerm);
    const searchLower = searchTerm.toLowerCase();
    const filteredResult: Record<StatusColumnKey, ToDoIssue[]> = {} as Record<StatusColumnKey, ToDoIssue[]>;

    for (const columnId of BOARD_COLUMNS) {
      const originalTodos = todosByColumn[columnId] || [];
      filteredResult[columnId] = originalTodos.filter(todoIssue => {
        // Lógica de filtrado (igual que en ProjectDetailsToDoList)
        const tags = Array.isArray(todoIssue.tags) ? todoIssue.tags : [];
        const users = Array.isArray(todoIssue.assignedUsers) ? todoIssue.assignedUsers : [];
        return (
          todoIssue.title.toLowerCase().includes(searchLower) ||
          (todoIssue.description && todoIssue.description.toLowerCase().includes(searchLower)) || // Añadir chequeo por si description es null/undefined
          tags.some(tag => tag?.title?.toLowerCase().includes(searchLower)) || // Añadir chequeo opcional
          users.some(user => user?.name?.toLowerCase().includes(searchLower)) || // Añadir chequeo opcional
          ToDoIssue.getStatusColumnText(todoIssue.statusColumn).toLowerCase().includes(searchLower)
        );
      });
    }
    console.log('TodoBoardPage: Filtered result:', filteredResult);
    return filteredResult;
  }, [todosByColumn, searchTerm]); // Dependencias


  // --- Contadores para CounterBox ---
  const totalTodosCount = React.useMemo(() =>
    BOARD_COLUMNS.reduce((count, colId) => count + (todosByColumn[colId]?.length || 0), 0),
    [todosByColumn ]
  );
  const filteredTodosCount = React.useMemo(() =>
    BOARD_COLUMNS.reduce((count, colId) => count + (filteredTodosByColumn[colId]?.length || 0), 0),
    [filteredTodosByColumn, BOARD_COLUMNS]
  );

  const isSearching = !!searchTerm.trim(); // Flag para saber si se está buscando

  


  // --- Helpers para calcular sortOrder ---
  // (Adaptados de ProjectDetailsToDoList y fases anteriores)

  // --- DEBUGGING ---
  console.log('ToDoBoardPage State:', {
    isDndEnabled,
    searchTerm,
    isSearching: !!searchTerm.trim(),
    dndContextSensorsActive: isDndEnabled && !searchTerm.trim()
  });

  // --- Helper para calcular sortOrder al REORDENAR en la MISMA columna ---
  function calculateNewSortOrder(
    list: ToDoIssue[],
    oldIndex: number,
    newIndex: number
  ): number | null {

    if (oldIndex === newIndex) return null;
    console.log(`calculateNewSortOrder: list length=${list.length}, oldIndex=${oldIndex}, newIndex=${newIndex}`);
    const currentList = [...list]; // Copia para trabajar

    let beforeSortOrder: number | null = null;
    let afterSortOrder: number | null = null;

    const itemBeingMovedId = currentList[oldIndex].id;

    // Determinar los vecinos en la POSICIÓN FINAL
    if (newIndex === 0) {
      // Mover al principio
        // El item que estará después del movido es el que actualmente está en la posición 0 (si no es el mismo que se mueve)
        // o el que está en la posición 1 (si el que se mueve estaba en la 0)
      afterSortOrder = currentList[0]?.id === itemBeingMovedId ? (currentList[1]?.sortOrder ?? null) : (currentList[0]?.sortOrder ?? null)
    } else if (newIndex >= currentList.length - 1) {
      // Mover al final
        // El item que estará antes del movido es el que actualmente está en la última posición (si no es el mismo)
        // o el penúltimo (si el que se mueve estaba al final)
      const actualLastItemIndex = currentList.length -1;
      beforeSortOrder = currentList[actualLastItemIndex]?.id === itemBeingMovedId ? (currentList[actualLastItemIndex - 1]?.sortOrder ?? null) : (currentList[actualLastItemIndex]?.sortOrder ?? null);
    } else {
      // Mover entre dos items
      // El item antes del nuevo lugar del elemento movido
      beforeSortOrder = currentList[newIndex -1]?.id === itemBeingMovedId ? (currentList[newIndex -2]?.sortOrder ?? null) : (currentList[newIndex -1]?.sortOrder ?? null);
      // El item después del nuevo lugar del elemento movido
      afterSortOrder = currentList[newIndex]?.id === itemBeingMovedId ? (currentList[newIndex + 1]?.sortOrder ?? null) : (currentList[newIndex]?.sortOrder ?? null);
    }

    // Cálculo del nuevo sortOrder
    if (beforeSortOrder !== null && afterSortOrder !== null) return (beforeSortOrder + afterSortOrder) / 2;
    if (beforeSortOrder !== null) return beforeSortOrder + 1.0;
    if (afterSortOrder !== null) return afterSortOrder / 2;
    console.log("calculateNewSortOrder: Fallback to 1.0");
    return 1.0; // Lista vacía o se mueve el único elemento (no debería pasar en reordenamiento real)
  }

  // --- Helper para calcular sortOrder al MOVER a OTRA columna ---
  function calculateNewSortOrderForColumnMove(
    destinationList: ToDoIssue[],
    newIndex: number // Índice donde se insertará en la lista de destino
  ): number {
    let beforeSortOrder: number | null = null;
    let afterSortOrder: number | null = null;

    if (newIndex <= 0) { // Insertar al principio
      afterSortOrder = destinationList[0]?.sortOrder ?? null;
    } else if (newIndex >= destinationList.length) {
      // Insertar al final
      beforeSortOrder = destinationList[destinationList.length - 1]?.sortOrder ?? null;
    } else {
      // Insertar en medio
      beforeSortOrder = destinationList[newIndex - 1]?.sortOrder ?? null;
      afterSortOrder = destinationList[newIndex]?.sortOrder ?? null;
    }

    // Cálculo del nuevo sortOrder
    if (beforeSortOrder !== null && afterSortOrder !== null) return (beforeSortOrder + afterSortOrder) / 2;
    if (beforeSortOrder !== null) return beforeSortOrder + 1.0;
    if (afterSortOrder !== null) return afterSortOrder / 2;
    console.log("calculateNewSortOrderForColumnMove: Fallback to 1.0 (empty destination or single item)");
    return 1.0; // Columna de destino estaba vacía
  }


  const handleDragMove = React.useCallback((event: DragMoveEvent) => {
    const { active, over } = event;
      
    console.group('TodoBoardPage: DragMove');
    console.log('DragMove:', {      
      activeId: active.id,
      overType: over?.data.current?.type,
      overColumnId: over?.data.current?.columnId,
      isEmpty: over?.data.current?.isEmpty
    });
      
      if (over) {
          console.log('Over:', {
              id: over.id,
              data: over.data.current,
              rect: over.rect // Información sobre dimensiones/posición
          });
      } else {
          console.log('Not over any droppable');
      }
      console.groupEnd();
  }, []);


  const handleCloseNewToDoForm = () => {
    // Cierra el formulario
    setIsNewToDoIssueFormOpen(false)
  }

  const onNewToDoIssueClick = () => {
      setIsNewToDoIssueFormOpen(true)
  }

  const handleCreatedToDoIssue = (createdNewToDoIssue: ToDoIssue) => {
    console.log('ToDoBoardPage: New ToDo created, updating local status and notifying parent.', createdNewToDoIssue);


    if (!currentProject) {
      toast.error("The To-Do cannot be added because no project is selected.");
      return;
    }


    // // Optimistically add the new todo to the correct column, maintaining sort order
    // //    Añade el nuevo "ToDo" a la columna correcta en el estado local del tablero.
    // setTodosByColumn(prevTodos => {
    //   const newTodos = { ...prevTodos };
    //   const targetColumn = createdNewToDoIssue.statusColumn;

    //   // Ensure the target column exists and is an array
    //   if (!newTodos[targetColumn]) {
    //       newTodos[targetColumn] = [];
    //   }

    //   //const columnTodos = [...newTodos[targetColumn]]; // Clonar el array
    //   // Añade el nuevo ToDo y reordena la columna por su `sortOrder`.
    //   const updatedColumn = [...newTodos[targetColumn], createdNewToDoIssue]
    //       .sort((a, b) => a.sortOrder - b.sortOrder);
      
    //     return { ...newTodos, [targetColumn]: updatedColumn };
    // });


  
    // Notificar al componente raíz (App en index.tsx) sobre el NUEVO ToDo.
    //    Esta es la llamada CORRECTA. NO se debe llamar a onProjectUpdate aquí.
    onToDoIssueCreated(createdNewToDoIssue)
  
    // Cerrar el formulario.
    setIsNewToDoIssueFormOpen(false);
  }


  const handleClickOpenToDo = (toDoIssue: ToDoIssue) => {
    try {
      console.log('ToDoBoardPage: handleClickOpenToDo called with:', toDoIssue);
      if (!toDoIssue || !toDoIssue.id) {
        console.error('ToDoBoardPage: Invalid todo object passed to handleClickOpenToDo:', toDoIssue);
        return;
      }
      // Buscar la referencia real en la lista del proyecto actual
     const realToDo = currentProject?.todoList.find(t => t.id === toDoIssue.id) || toDoIssue;
      setSelectedToDo(realToDo);
      setIsTodoDetailsWindowOpen(true);
    } catch (error) {
      console.error('ToDoBoardPage: Error in handleClickOpenToDo:', error);
    }
  };




  // Memorized handleClose for avoiding unnecessary re rendering
  const handleCloseToDoDetailsWindow = React.useCallback(() => {
    console.log('ToDoBoardPage: Closing ToDoDetailsWindow');
    setIsTodoDetailsWindowOpen(false);
    setSelectedToDo(null);
  }, []);



  
  // Este efecto sincroniza el ToDo seleccionado con la lista de ToDos del proyecto
  // que viene de las props. Cuando `projectsManager` actualiza la lista, `currentProject`
  // cambia, y este efecto se dispara.
  React.useEffect(() => {
    if (isTodoDetailsWindowOpen && selectedToDo && currentProject) {
        const updatedToDoInList = currentProject.todoList.find(t => t.id === selectedToDo.id);

        // Si se encontró una nueva versión del ToDo y su referencia es distinta, actualizamos el estado.
        if (updatedToDoInList && updatedToDoInList !== selectedToDo) {
            console.log("ToDoBoardPage: Sincronizando selectedToDo con datos actualizados desde props.");
            setSelectedToDo(updatedToDoInList);
        } else if (!updatedToDoInList) {
            // El ToDo fue borrado, cerramos la ventana.
            console.log("ToDoBoardPage: El ToDo seleccionado ya no existe, cerrando ventana.");
            handleCloseToDoDetailsWindow();
        }
    }
  }, [currentProject, selectedToDo, isTodoDetailsWindowOpen, handleCloseToDoDetailsWindow]);







  //const handleUpdateToDoIssue = async (updatedTodo: ToDoIssue) => {
    //console.log('ToDoBoardPage: handleUpdateToDoIssue called with:', updatedTodo);
  const handleUpdateToDoIssue = (projectId: string, todoId: string, updates: Partial<IToDoIssue>) => {
    console.log('ToDoBoardPage: Propagando evento onUpdatedToDoIssue...', { projectId, todoId, updates });   
    

    if (!currentProject) {
      console.error("ToDoBoardPage: currentProject is null in handleUpdateToDoIssue");
      return;
    }

    
    // SIMPLIFICACIÓN: La lógica de actualización ahora es mucho más simple.
    // Simplemente propagamos el evento hacia arriba. La actualización de la UI
    // (tanto en el tablero como en la ventana de detalles) se manejará
    // automáticamente por los listeners de `projectsManager` y los `useEffect`
    // que hemos implementado.
    // La lógica de actualización del estado local se elimina.
    // La actualización de la UI se manejará automáticamente por los listeners de `projectsManager`
    // y los `useEffect` que reaccionan a los cambios en `currentProject`.
    onToDoIssueUpdated(projectId, todoId, updates);
  }





  const handleDeleteToDoIssue = async (projectIdFromEvent: string, todoId: string) => {
    console.log(`ToDoBoardPage: Propagando evento onDeleteToDoIssue...`, { projectIdFromEvent, todoId });
    if (!currentProject || currentProject.id !== projectIdFromEvent) {
      console.error("Project ID mismatch. Cannot delete ToDo.");
      toast.error("Cannot delete: Project mismatch.");
      return;
    }
  
    
    try {
    
      // Propagar el evento hacia arriba. El padre se encargará de la lógica de borrado.
      await onToDoIssueDeleted(projectIdFromEvent, todoId);
      // La ventana de detalles se cerrará automáticamente gracias al useEffect que
      // detecta que el 'selectedToDo' ya no existe en 'currentProject.todoList'.

    } catch (error) {
      console.error("ToDoBoardPage: Error updating state or notifying parent after deletion notification.", error);
      setMessagePopUpContent({
        type: "error",
        title: "UI Sync Error",
        message: "There was a problem updating the display after deletion.",
        actions: ["Ok"],
        onActionClick: {
          "Ok": () => setShowMessagePopUp(false)
        },
        onClose: () => setShowMessagePopUp(false)
      });
      setShowMessagePopUp(true);
    }
  }
  


  if (authLoading || isLoading) return <LoadingIcon />; // Mostrar loading si auth está cargando O si la carga de ToDos está en curso



  
  //Open the form for a new todo issue
  const newToDoIssueForm = isNewToDoIssueFormOpen ? (
    <NewToDoIssueForm
      onClose={handleCloseNewToDoForm}
      project={currentProject!}
      onCreatedNewToDo={handleCreatedToDoIssue}
    />
  ) : null;
  
  //Open the detail page of an existing todo issue 
  const updateToDoDetailsWindow = isTodoDetailsWindowOpen && selectedToDo
    ? (
      currentProject && <ToDoDetailsWindow
        project={currentProject}
        toDoIssue={selectedToDo}
        onClose={handleCloseToDoDetailsWindow}
        onUpdatedToDoIssue={handleUpdateToDoIssue}
        onDeleteToDoIssueButtonClick={handleDeleteToDoIssue}
      />
    )
    : null



  return (
    <section
      className="page todo-page"
      id="todo-page"
      data-page=""
      style={{ height: "100vh", display: "" }}
    >
      <DndContext
        sensors={isDndEnabled && !isSearching ? sensors : undefined} // Deshabilitar sensores si no está habilitado o si se está buscando
        collisionDetection={rectIntersection} // Prueba con closestCenter o rectIntersection
        modifiers={[restrictToWindowEdges]}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always
          }
        }} //ayuda con contenedores scrollables
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragMove={handleDragMove}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            // alignContent: "space-between",
            justifyContent: "space-between",
            // flexWrap: "wrap",
            gap: 20,
            userSelect: "none",
            position: "relative", // Importante para el posicionamiento
          }}
        >

          {/* Primera sección: Título y selector de proyecto ********************************/}
          <div style={{ display: "flex", columnGap: 20,  }}>
            <h2 style={{ display: "flex",  columnGap: 20, alignItems: "center", whiteSpace: "nowrap" }}>
              To-Do Board
              {currentProject && (
                <>
                  <span style={{ margin: "0 2px" }}>:</span>
                  <span style={{ color: 'var(--color-accent)', fontWeight: 'normal' }}>
                    {currentProject.name}
                  </span>
                </>
              )}
               
              <KanbanIcon size={24}
                className="todo-icon-edit"
                color="var(--color-fontbase)"
              />              
            </h2>
            <div style={{ display: "flex", alignItems: "center", columnGap: 10 }}>
              {/* Reemplazar el select con ProjectSelector */}

              <ProjectSelector
                currentProject={currentProject}  // This can be null
                projectsList={projectsManager.list}
                onProjectSelect={handleProjectSelectionInBoard} // Asegúrar que esta función actualice initialProjectIdFromStorage
              />
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
                
              <ToDoBoardSwitchDnD
                checked={isDndEnabled}
                onChange={setIsDndEnabled}
                disabled={isSearching} // Añadir esta prop
                title={isSearching ? "DnD is disabled while searching" : "Toggle Drag and Drop"} // Tooltip explicativo 
              />
            </div>
          </div>




          {/* Segunda sección: Controles centrales *****************************************/}

        <div style={{ display: "flex", columnGap: 20, alignItems: "center", justifyContent: "center", height: "100%", width: "500px", minWidth: "200px" }}>
            {!isSearching ? ( // Solo mostrar algo si no se está buscando
              isDndEnabled ? (
                // Área de borrado cuando DnD está habilitado
                <ToDoBoardDeleteArea
                  isVisible={true} // isVisible ya está implícito por la condición externa
                  style={{
                    position: 'relative',
                    transform: 'none',
                    margin: '0 20px',
                    alignSelf: 'center',
                    width: '100%',
                  }}
                />
              ) : (
                // Mensaje cuando DnD está deshabilitado
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-fontbase-dark)', textAlign: 'center', padding: '10px', whiteSpace: 'nowrap',fontSize: 'var(--font-lg)', }}>
                  
                  <span >
                    Drag & Drop is disabled. Activate it using the switch.
                  </span>
                </div>
              )
            ) : (
              // No mostrar nada en esta sección si se está buscando,
              // ya que el switch de DnD también está deshabilitado.
              null
            )}
          </div>          




          {/* Tercera sección: Controles centrales *****************************************/}
          <div style={{ display: "flex", alignItems: "flex-start", columnGap: 50 }}>
          
            <div
              style={{
                display: "flex",
                alignItems: "center",
                columnGap: 20,
                justifyContent: "flex-end"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", columnGap: 15 }}>
                <SearchIcon size={24} className="todo-icon-plain" color="var(--color-fontbase)" />
                <SearchToDoBox onChange={handleSearchChange} />
              </div>
              {/* Componente Contador */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  columnGap: 5
                }}
              >
                <CounterBox
                  filteredItemsNum={filteredTodosCount}
                  totalItemsNum={totalTodosCount}
                />
                {/* <div id="todolist-search-counter-ToDoPage">Counter</div> */}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                columnGap: 10,
                alignItems: "center"
              }}
            >
              <button onClick={onNewToDoIssueClick}
                id="new-todo-issue-btn2"
                style={{
                  borderRadius: "var(--br-circle)",
                  aspectRatio: 1,
                  padding: 0,
                  display: "flex",
                  justifyContent: "center"
                }}
              >
                <AddIcon size={24} className="todo-icon-plain" color="var(--color-fontbase)" />
              </button>
            </div>
          </div>
        </header>

        {/* {isLoading && <LoadingIcon />} */} {/* El loading se maneja ahora al inicio del componente */}
      


        {!isLoading && !currentProject && (

          <div style={{ textAlign: 'center', marginTop: '50px', width: '100%' }}>
            <h3>Select a project to activate the dashboard.</h3>
            {/* ProjectSelector is already in the header, no need to repeat unless desired */}
          </div>
        )}

        {!isLoading && currentProject && (

          <div
            id="todo-content"
            className="board-container"
            style={{
              overflowX: 'auto',
              height: "calc(100vh - 130px)",
              position: 'relative',
            }}
          >
            {BOARD_COLUMNS.map((columnId) => (
              <SortableContext
                key={columnId}
                items={filteredTodosByColumn[columnId]?.map(t => t.id!) ?? []} // Usar IDs de la lista FILTRADA
                // items={todosByColumn[columnId].map(t => t.id)}
                // items={(todosByColumn[columnId] || []).map(t => t.id!)}
                strategy={verticalListSortingStrategy}
                disabled={!isDndEnabled || isSearching} // Deshabilitar si DnD no está activo o si se está buscando
              >
                <ToDoBoardColumn
                  key={columnId}
                  columnId={columnId}
                  todos={filteredTodosByColumn[columnId] || []} // Pasar lista FILTRADA
                  // todos={todosByColumn[columnId] || []}}
                  project={currentProject}
                  onUpdatedProject={onProjectUpdate}
                  isDndEnabled={isDndEnabled && !isSearching}                  
                  onCreatedToDoIssue={onToDoIssueCreated}
                  onUpdatedToDoIssue={onToDoIssueUpdated}
                  onClickOpenToDoDetailsWindow={handleClickOpenToDo}
                  isDetailsWindowOpen={isTodoDetailsWindowOpen}
                />
              </SortableContext>
            ))}
          </div>
        )}

        <DragOverlay >
        {/*<DragOverlay dropAnimation={dropAnimation}> //null ,evita una animación de retorno al soltar*/}
          {activeTodo ? (
            <ToDoCard
              toDoIssue={activeTodo} // El overlay muestra el ToDo activo
              isDndEnabled={true}
              isSortable={false} // El overlay nunca es sortable              
              onClickOpenToDoDetailsWindow={() => { }} // No-op
              isDragged={isDragging}
              
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Cursor personalizado */}
      {/* <ToDoBoardCursor
        todo={hoveredTodo}
        isVisible={showCursor && !isDragging}
        type={cursorType}
      /> */}

      {/* MessagePopUp existente */}
      {showMessagePopUp && messagePopUpContent && (
        <MessagePopUp {...messagePopUpContent} />
      )}

      {newToDoIssueForm}
      {updateToDoDetailsWindow}

    </section>

  )
}


// Add display name for debugging purposes
ToDoBoardPage.displayName = 'ToDoBoardPage'

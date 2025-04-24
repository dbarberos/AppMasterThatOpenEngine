import * as React from 'react';
import * as Router from 'react-router-dom';

import { ProjectsManager } from '../classes/ProjectsManager';
import { Project } from '../classes/Project';
import { ToDoIssue } from '../classes/ToDoIssue';
import { TODO_STATUSCOLUMN } from '../const';
import { StatusColumnKey, StatusColumnValue } from '../types';


import {
  DndContext,
  closestCorners, // O considera rectIntersection según tu layout
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates, arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';



interface Props {
    projectsManager: ProjectsManager
    onProjectCreate: (updatedProject: Project) => void
    onProjectUpdate: (updatedProject: Project) => void
    onToDoIssueCreated: (createdToDoIssue: ToDoIssue) => void
    onToDoIssueUpdated: (updatedToDoIssue: ToDoIssue) => void
}


export function ToDoBoardPage({ projectsManager, onProjectCreate, onProjectUpdate, onToDoIssueCreated, onToDoIssueUpdated }: Props) {

  const [activeTodo, setActiveTodo] = React.useState<ToDoIssue | null>(null);
  const columns = Object.keys(TODO_STATUSCOLUMN) as StatusColumnKey[];
    
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5
      }
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.todo) {
      setActiveTodo(event.active.data.current.todo);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    // Lógica para actualizar estado y base de datos
  };


    // const routeParams = Router.useParams<{ id: string }>();
    // console.log("I am the ID of the proyect selected", routeParams.id);
    // const navigateTo = Router.useNavigate();

    // const projectId = routeParams.id;

    // // Retrieve project based on projectId as soon as possible.
    // const initialProject = projectId ? projectsManager.getProject(projectId) : null;

    // const [currentProject, setCurrentProject] = React.useState<Project | null>(initialProject!);

    // console.log("I am the ID of the proyect selected", routeParams.id);
    // console.log('ProjectDetailsPage rendering with project:', currentProject)




    // Memorizar lista de ToDoCards
    // const projectCardsList = React.useMemo(() =>
    //     filteredProjects.map((project) => (
    //         <Router.Link to={`/project/${project.id}`} key={project.id}>
    //             <ProjectCard project={project} />
    //         </Router.Link>
    //     )),
    //     [filteredProjects]
    // )



    // const projectCardsList = projects.map((project) => {
    //     return (
    //         <Router.Link to={`/project/${project.id}`} key={project.id}>
    //             <ProjectCard
    //                 project={project}
    //             />
    //         </Router.Link>

    //     );
    // });







  
  return (
    <section
      className="page todo-page"
      id="todo-page"
      data-page=""
      style={{ height: "100vh", display: "" }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          alignContent: "space-between",
          flexWrap: "wrap",
          gap: 20,
          userSelect: "none"
        }}
      >
        <div style={{ display: "flex", columnGap: 20 }}>
          <h2 style={{ display: "flex", alignItems: "center", columnGap: 20 }}>
            To-Do Board
            <span className="todo-task-move">
              <svg
                className="todo-task-move"
                role="img"
                aria-label="edit"
                width={32}
                height={40}
              >
                <use href="#kanban" />
              </svg>
            </span>
          </h2>
          <div style={{ display: "flex", alignItems: "center", columnGap: 10 }}>
            <p>Project: </p>
            <select
              id="projectSelectedToDoBoard"
              style={{
                padding: 10,
                borderRadius: 5,
                fontSize: "var(--font-lg)",
                lineHeight: 1,
                letterSpacing: "normal",
                textTransform: "none",
                display: "inline-block",
                whiteSpace: "nowrap",
                wordWrap: "normal"
              }}
            ></select>
          </div>
        </div>
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
              <span className="material-icons-round">search</span>
              <input
                id="todo-search-in-Todo-Page"
                type="search"
                placeholder="Search inside To-Do"
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                columnGap: 5
              }}
            >
              <div id="todolist-search-counter-ToDoPage">Counter</div>
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
            <button
              id="new-todo-issue-btn2"
              style={{
                borderRadius: "var(--br-circle)",
                aspectRatio: 1,
                padding: 0,
                display: "flex",
                justifyContent: "center"
              }}
            >
              <span className="material-icons-round">add</span>
            </button>
            <picture>
              <source media="(min-width: )" srcSet="" />
              <img src="" alt="" />
            </picture>
            <button
              title="Delete To-Do"
              className="trash-drop-btn"
              id="trash-drop-btn"
            >
              <svg
                className="todo-task-move"
                role="img"
                aria-label="edit"
                width={32}
                height={40}
              >
                <use href="#trash" />
              </svg>
              For delete drop here
            </button>
          </div>
        </div>
      </header>


      
      <DndContext
        sensors={sensors}
        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >

        <div id="todo-content" style={{ height: "90%" }}>
          <div
            id="details-page-todo-maincontainer"
            className="todo-column"
            data-column-id="backlog"
          >
            <div id="details-page-todo-secondcontainer">
              <div className="todo-column-head">
                <h4>Task Ready</h4>
              </div>
              <div
                id="todo-column-backlog"
                className="todo-column-list details-page-todo-list"
                style={{
                  padding: 25,
                  display: "flex",
                  flexDirection: "column",
                  rowGap: 15,
                  alignContent: "center"
                }}
              >
                <div className="todo-item">
                  <div className="todo-color-column" />
                  <div
                    className="todo-card"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      border: "5px solid inherit"
                    }}
                  >
                    <div className="todo-taks">
                      <div className="todo-tags-list">
                        <span className="todo-tags">leg</span>
                        <span className="todo-tags">head</span>
                        <span className="todo-tags">arm</span>
                        <span className="todo-tags">leg</span>
                        <span className="todo-tags">head</span>
                        <span className="todo-tags">arm</span>
                      </div>
                      <button className="todo-task-move">
                        <svg
                          className="todo-icon"
                          role="img"
                          aria-label="edit"
                          width={24}
                          height={24}
                        >
                          <use href="#drag-indicator" />
                        </svg>
                      </button>
                    </div>
                    <div className="todo-title">
                      <h5 style={{ overflowWrap: "break-word", marginLeft: 15 }}>
                        Make anything here as you want, even something longer it is up
                        to you
                      </h5>
                    </div>
                    <div className="todo-stats">
                      <span
                        style={{ textWrap: "nowrap", marginLeft: 10 }}
                        className="todo-task-move"
                      >
                        <svg
                          className="todo-icon"
                          role="img"
                          aria-label="edit"
                          width={24}
                          height={24}
                        >
                          <use href="#flag" />
                        </svg>
                        ${"{"}this.dueDate{"}"}
                      </span>
                      <span
                        style={{ textWrap: "nowrap", marginLeft: 10 }}
                        className="todo-task-move"
                      >
                        <svg
                          className="todo-icon"
                          role="img"
                          aria-label="edit"
                          width={24}
                          height={24}
                        >
                          <use href="#chat-bubble" />
                        </svg>
                        ${"{"}this.assignedUsers{"}"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            id="details-page-todo-maincontainer"
            className="todo-column"
            data-column-id="wip"
          >
            <div id="details-page-todo-secondcontainer">
              <div className="todo-column-head">
                <h4>In Progress</h4>
              </div>
              <div
                id="todo-column-wip"
                className="todo-column-list details-page-todo-list"
                style={{
                  padding: 25,
                  display: "flex",
                  flexDirection: "column",
                  rowGap: 15,
                  alignContent: "center"
                }}
              >
                <div className="todo-item">
                  <div className="todo-color-column" />
                  <div
                    className="todo-card"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      border: "5px solid inherit"
                    }}
                  >
                    <div className="todo-taks">
                      <div className="todo-tags-list">
                        <span className="todo-tags">leg</span>
                        <span className="todo-tags">head</span>
                        <span className="todo-tags">arm</span>
                        <span className="todo-tags">leg</span>
                        <span className="todo-tags">head</span>
                        <span className="todo-tags">arm</span>
                      </div>
                      <button className="todo-task-move">
                        <svg
                          className="todo-icon"
                          role="img"
                          aria-label="edit"
                          width={24}
                          height={24}
                        >
                          <use href="#drag-indicator" />
                        </svg>
                      </button>
                    </div>
                    <div className="todo-title">
                      <h5 style={{ overflowWrap: "break-word", marginLeft: 15 }}>
                        Make anything here as you want, even something longer it is up
                        to you
                      </h5>
                    </div>
                    <div className="todo-stats">
                      <span
                        style={{ textWrap: "nowrap", marginLeft: 10 }}
                        className="todo-task-move"
                      >
                        <svg
                          className="todo-icon"
                          role="img"
                          aria-label="edit"
                          width={24}
                          height={24}
                        >
                          <use href="#flag" />
                        </svg>
                        ${"{"}this.dueDate{"}"}
                      </span>
                      <span
                        style={{ textWrap: "nowrap", marginLeft: 10 }}
                        className="todo-task-move"
                      >
                        <svg
                          className="todo-icon"
                          role="img"
                          aria-label="edit"
                          width={24}
                          height={24}
                        >
                          <use href="#chat-bubble" />
                        </svg>
                        ${"{"}this.assignedUsers{"}"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            id="details-page-todo-maincontainer"
            className="todo-column"
            data-column-id="qa"
          >
            <div id="details-page-todo-secondcontainer">
              <div className="todo-column-head">
                <h4>In review</h4>
              </div>
              <div
                id="todo-column-qa"
                className="todo-column-list details-page-todo-list"
                style={{
                  padding: 25,
                  display: "flex",
                  flexDirection: "column",
                  rowGap: 15,
                  alignContent: "center"
                }}
              >
                <div className="todo-item">
                  <div className="todo-color-column" />
                  <div
                    className="todo-card"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      border: "5px solid inherit"
                    }}
                  >
                    <div className="todo-taks">
                      <div className="todo-tags-list">
                        <span className="todo-tags">leg</span>
                        <span className="todo-tags">head</span>
                        <span className="todo-tags">arm</span>
                        <span className="todo-tags">leg</span>
                        <span className="todo-tags">head</span>
                        <span className="todo-tags">arm</span>
                      </div>
                      <button className="todo-task-move">
                        <svg
                          className="todo-icon"
                          role="img"
                          aria-label="edit"
                          width={24}
                          height={24}
                        >
                          <use href="#drag-indicator" />
                        </svg>
                      </button>
                    </div>
                    <div className="todo-title">
                      <h5 style={{ overflowWrap: "break-word", marginLeft: 15 }}>
                        Make anything here as you want, even something longer it is up
                        to you
                      </h5>
                    </div>
                    <div className="todo-stats">
                      <span
                        style={{ textWrap: "nowrap", marginLeft: 10 }}
                        className="todo-task-move"
                      >
                        <svg
                          className="todo-icon"
                          role="img"
                          aria-label="edit"
                          width={24}
                          height={24}
                        >
                          <use href="#flag" />
                        </svg>
                        ${"{"}this.dueDate{"}"}
                      </span>
                      <span
                        style={{ textWrap: "nowrap", marginLeft: 10 }}
                        className="todo-task-move"
                      >
                        <svg
                          className="todo-icon"
                          role="img"
                          aria-label="edit"
                          width={24}
                          height={24}
                        >
                          <use href="#chat-bubble" />
                        </svg>
                        ${"{"}this.assignedUsers{"}"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            id="details-page-todo-maincontainer"
            className="todo-column"
            data-column-id="completed"
          >
            <div id="details-page-todo-secondcontainer">
              <div className="todo-column-head">
                <h4>Done</h4>
              </div>
              <div
                id="todo-column-completed"
                className="todo-column-list details-page-todo-list"
                style={{
                  padding: 25,
                  display: "flex",
                  flexDirection: "column",
                  rowGap: 15,
                  alignContent: "center"
                }}
              >
                <div className="todo-item">
                  <div className="todo-color-column" />
                  <div
                    className="todo-card"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      border: "5px solid inherit"
                    }}
                  >
                    <div className="todo-taks">
                      <div className="todo-tags-list">
                        <span className="todo-tags">leg</span>
                        <span className="todo-tags">head</span>
                        <span className="todo-tags">arm</span>
                        <span className="todo-tags">leg</span>
                        <span className="todo-tags">head</span>
                        <span className="todo-tags">arm</span>
                      </div>
                      <button className="todo-task-move">
                        <svg
                          className="todo-icon"
                          role="img"
                          aria-label="edit"
                          width={24}
                          height={24}
                        >
                          <use href="#drag-indicator" />
                        </svg>
                      </button>
                    </div>
                    <div className="todo-title">
                      <h5 style={{ overflowWrap: "break-word", marginLeft: 15 }}>
                        Make anything here as you want, even something longer it is up
                        to you
                      </h5>
                    </div>
                    <div className="todo-stats">
                      <span
                        style={{ textWrap: "nowrap", marginLeft: 10 }}
                        className="todo-task-move"
                      >
                        <svg
                          className="todo-icon"
                          role="img"
                          aria-label="edit"
                          width={24}
                          height={24}
                        >
                          <use href="#flag" />
                        </svg>
                        ${"{"}this.dueDate{"}"}
                      </span>
                      <span
                        style={{ textWrap: "nowrap", marginLeft: 10 }}
                        className="todo-task-move"
                      >
                        <svg
                          className="todo-icon"
                          role="img"
                          aria-label="edit"
                          width={24}
                          height={24}
                        >
                          <use href="#chat-bubble" />
                        </svg>
                        ${"{"}this.assignedUsers{"}"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            id="details-page-todo-maincontainer"
            className="todo-column"
            data-column-id="notassigned"
          >
            <div id="details-page-todo-secondcontainer">
              <div className="todo-column-head">
                <h4>Not Assigned</h4>
              </div>
              <div
                id="todo-column-notassigned"
                className="todo-column-list details-page-todo-list"
                style={{
                  padding: 25,
                  display: "flex",
                  flexDirection: "column",
                  rowGap: 15,
                  alignContent: "center"
                }}
              >
                <div className="todo-item">
                  <div className="todo-color-column" />
                  <div
                    className="todo-card"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      border: "5px solid inherit"
                    }}
                  >
                    <div className="todo-taks">
                      <div className="todo-tags-list">
                        <span className="todo-tags">leg</span>
                        <span className="todo-tags">head</span>
                        <span className="todo-tags">arm</span>
                        <span className="todo-tags">leg</span>
                        <span className="todo-tags">head</span>
                        <span className="todo-tags">arm</span>
                      </div>
                      <button className="todo-task-move">
                        <svg
                          className="todo-icon"
                          role="img"
                          aria-label="edit"
                          width={24}
                          height={24}
                        >
                          <use href="#drag-indicator" />
                        </svg>
                      </button>
                    </div>
                    <div className="todo-title">
                      <h5 style={{ overflowWrap: "break-word", marginLeft: 15 }}>
                        Make anything here as you want, even something longer it is up
                        to you
                      </h5>
                    </div>
                    <div className="todo-stats">
                      <span
                        style={{ textWrap: "nowrap", marginLeft: 10 }}
                        className="todo-task-move"
                      >
                        <svg
                          className="todo-icon"
                          role="img"
                          aria-label="edit"
                          width={24}
                          height={24}
                        >
                          <use href="#flag" />
                        </svg>
                        ${"{"}this.dueDate{"}"}
                      </span>
                      <span
                        style={{ textWrap: "nowrap", marginLeft: 10 }}
                        className="todo-task-move"
                      >
                        <svg
                          className="todo-icon"
                          role="img"
                          aria-label="edit"
                          width={24}
                          height={24}
                        >
                          <use href="#chat-bubble" />
                        </svg>
                        ${"{"}this.assignedUsers{"}"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <DragOverlay>
          {activeTodo ? <TodoCardOverlay todo={activeTodo} /> : null}
        </DragOverlay>
      </DndContext>


    </section>

  )
}

export default ToDoBoardPage
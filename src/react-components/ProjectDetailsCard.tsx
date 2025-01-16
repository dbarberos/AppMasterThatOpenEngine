import * as React from 'react';
import * as Router from 'react-router-dom';

import { ProjectsManager } from '../classes/ProjectsManager';
import { Project } from '../classes/Project';

interface Props {   
    project: Project
}

export function ProjectDetailsCard(props: Props) {


    return (
        <div
            id="form-project-details"
            className="dashboard-card"
            style={{ padding: 17, rowGap: "20px 15px" }}
        >
            <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 30
            }}
            >
            <abbr
                title="Acronym of the project"
                style={{
                fontSize: 20,
                backgroundColor: "#f08080",
                padding: 15,
                borderRadius: "100%",
                aspectRatio: 1,
                color: "#343537",
                display: "flex",
                alignItems: "center"
                }}
                data-project-info="acronym"
            >
                {props.project.acronym}
            </abbr>
            <button id="edit-project-details" className="">
                Edit
            </button>
            </div>
            <div
            style={{
                padding: "0 30px",
                wordWrap: "break-word",
                overflowWrap: "break-word",
                wordBreak: "break-all",
                maxWidth: "95%",
                marginRight: 15,
                overflow: "auto",
                scrollbarWidth: "none",
                height: "100%"
            }}
            >
            <h5 data-project-info="name">{props.project.name}</h5>
            <p data-project-info="description">{props.project.description}</p>
            </div>
            <div
            style={{
                display: "flex",
                columnGap: 15,
                padding: "15px 0px",
                justifyContent: "space-around"
            }}
            >
            <div>
                <p
                style={{
                    color: "var(--color-grey)",
                    fontSize: "var(--font-base)",
                    flexBasis: "auto"
                }}
                >
                Business Unit
                </p>
                <p data-project-info="businessUnit">{props.project.businessUnit}</p>
            </div>
            <div>
                <p
                style={{
                    color: "var(--color-grey)",
                    fontSize: "var(--font-base)",
                    flexBasis: "auto"
                }}
                >
                Status
                </p>
                <p data-project-info="status">{props.project.status}</p>
            </div>
            <div>
                <p
                style={{
                    color: "var(--color-grey)",
                    fontSize: "var(--font-base)",
                    flexBasis: "auto"
                }}
                >
                Cost
                </p>
                <p data-project-info="cost">$ {props.project.cost}</p>
            </div>
            <div>
                <p
                style={{
                    color: "var(--color-grey)",
                    fontSize: "var(--font-base)",
                    flexBasis: "auto"
                }}
                >
                Role
                </p>
                <p data-project-info="userRole">{props.project.userRole}</p>
            </div>
            <div>
                <p
                style={{
                    color: "var(--color-grey)",
                    fontSize: "var(--font-base)",
                    flexBasis: "auto"
                }}
                >
                Finish Date
                </p>
                <p data-project-info="finishDate">{props.project.finishDate.toISOString().split('T')[0]}</p>
            </div>
            </div>
            <div>
            <p
                data-project-info="progress="
                style={{
                color: "var(--color-grey)",
                fontSize: "var(--font-base)",
                flexBasis: "auto"
                }}
            >
                Progress
            </p>
            <progress value={Math.max(0, Math.min(props.project.progress || 0, 100))} max={100} />
            </div>
        </div> 
)
}

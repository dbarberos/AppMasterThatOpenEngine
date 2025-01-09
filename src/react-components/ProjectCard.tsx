import * as React from 'react';
import { useState } from 'react';
import { ProjectsManager } from '../classes/ProjectsManager';
import { Project, BusinessUnit } from '../classes/Project';


import { showModal,closeModal, toggleModal, } from "../classes/UiManager.ts"

interface Props {
    project: Project
}

export function ProjectCard(props: Props) {



    return (
        <div className="project-card" data-projectid="00000">
            <div className="card-header">
                <p
                style={{
                    backgroundColor: props.project.backgroundColorAcronym,
                    padding: 10,
                    borderRadius: 8,
                    aspectRatio: 1,
                    display: "flex",
                    alignItems: "center",
                    color: "#43464e"
                }}
                >{props.project.acronym}</p>
                <div
                style={{
                    width: "95%",
                    wordBreak: "break-all",
                    overflow: "auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    scrollbarWidth: "none",
                    height: "100%"
                }}
                >
                    <h5>{props.project.name}</h5>
                    <p style={{ color: "var(--color-fontbase-dark)" }}>Project Description</p>
                </div>
            </div>
            <div className="card-content">
                <div className="card-property">
                <p style={{ color: "#969696" }}>Business Unit</p>
                <p>{props.project.businessUnit}</p>
                </div>
                <div className="card-property">
                <p style={{ color: "#969696" }}>Status</p>
                <p>{props.project.status}</p>
                </div>
                <div className="card-property">
                <p style={{ color: "#969696" }}>User Role</p>
                <p>{props.project.userRole}</p>
                </div>
                <div className="card-property">
                <p style={{ color: "#969696" }}>Cost</p>
                <p>{props.project.cost}</p>
                </div>
                <div className="card-property">
                <p style={{ color: "#969696" }}>Progress</p>
                <p>{props.project.progress * 100 } %</p>
                </div>
            </div>
        </div>
    )
}
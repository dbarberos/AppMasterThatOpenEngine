import * as React from 'react';

import { ProjectsManager } from '../classes/ProjectsManager';
import { Project, BusinessUnit } from '../classes/Project';
import { appIcons } from '../global.ts';

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
                    <bim-label style={{ color: "var(--color-fontbase-dark)" }}>Project Description</bim-label>
                    <bim-label>{props.project.description}</bim-label>
                </div>
            </div>
            <div className="card-content">
                <div className="card-property">
                <bim-label icon={appIcons.BUSINESS} style={{ color: "#969696" }}>Business Unit</bim-label>
                <bim-label>{props.project.businessUnit}</bim-label>
                </div>
                <div className="card-property">
                <bim-label icon={appIcons.STATUS} style={{ color: "#969696" }}>Status</bim-label>
                <bim-label>{props.project.status}</bim-label>
                </div>
                <div className="card-property">
                <bim-label icon={appIcons.USERROLE} style={{ color: "#969696" }}>User Role</bim-label>
                <bim-label>{props.project.userRole}</bim-label>
                </div>
                <div className="card-property">
                <bim-label icon={appIcons.COST} style={{ color: "#969696" }}>Cost</bim-label>
                <bim-label>{props.project.cost}</bim-label>
                </div>
                <div className="card-property">
                <bim-label icon= {appIcons.PROGRESS} style={{ color: "#969696" }}>Progress</bim-label>
                <bim-label>{props.project.progress * 100 } %</bim-label>
                </div>
            </div>
        </div>
    )
}

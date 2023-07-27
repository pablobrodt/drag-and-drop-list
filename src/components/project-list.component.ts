import { Component } from './base.component';
import { Project, ProjectStatus } from '../models/project.model';
import { ProjectState } from '../state/project.state';
import { Autobind } from '../decorators/autobind.decorator';
import { ProjectItem } from './project-item.component';

import type { DragTarget } from '../models/drag-and-drop.interface';

export enum ProjectListType {
    ACTIVE = 'active',
    FINISHED = 'finished',
};

export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
    private projects: Project[] = [];
    private listElement?: HTMLUListElement;
    private readonly droppableClass: string = 'droppable';

    constructor(private type: ProjectListType) {
        super({ hostId: 'app', templateId: 'project-list', elementId: `${type}-projects` });

        const projectState = ProjectState.getInstance();

        projectState.addListener((projects) => {
            this.projects = projects.filter((project) => {
                if(this.type === ProjectListType.ACTIVE) {
                    return project.status === ProjectStatus.ACTIVE;
                }

                return project.status === ProjectStatus.FINISHED;
            });

            this.renderProjects();
        })

        this.configure();
        this.attach('beforeend');
        this.renderContent();
    }

    @Autobind
    dragOverHandler(event: DragEvent): void {
        event.preventDefault();

        if (event.dataTransfer) {
            const [firstType] = event.dataTransfer.types;

            if (firstType === 'text/plain') {
                this.listElement?.classList.add(this.droppableClass);
            }
        }
    }

    @Autobind
    dropHandler(event: DragEvent): void {
        if (event.dataTransfer) {
            const projectId = event.dataTransfer.getData('text/plain');
            let newStatus: ProjectStatus;

            switch (this.type) {
                case ProjectListType.ACTIVE: newStatus = ProjectStatus.ACTIVE;
                    break;
                case ProjectListType.FINISHED: newStatus = ProjectStatus.FINISHED;
                    break;
            }

            const projectState = ProjectState.getInstance();

            projectState.moveProject(projectId, newStatus);
        }
    }

    @Autobind
    dragLeaveHandler(_event: DragEvent): void {
        this.listElement?.classList.remove(this.droppableClass);
    }

    private configure() {
        const listId = `${this.type}-projects-list`;

        this.listElement = this.querySelector('ul');
        this.listElement.id = listId;

        this.listElement.addEventListener('dragover', this.dragOverHandler);
        this.listElement.addEventListener('dragleave', this.dragLeaveHandler);
        this.listElement.addEventListener('drop', this.dropHandler);
    }

    private renderProjects() {
        if(this.listElement) {
            this.listElement.innerHTML = '';

            for (const project of this.projects) {
                const listElementId = this.listElement.id;

                new ProjectItem({ hostId: listElementId, project })
            }
        }
    }
    
    renderContent() {
        const titleElement = this.querySelector('h2');

        titleElement.textContent = `${this.type.toUpperCase()} PROJECTS`
    }
}
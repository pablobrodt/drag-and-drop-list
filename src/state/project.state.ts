import { State } from './base.state.js';
import { Project } from '../models/project.model.js';
import type { ProjectStatus } from '../models/project.model.js';

export class ProjectState extends State<Project[]> {
    private static instance: ProjectState;

    private constructor() {
        super();

        this.state = [];
    } 

    public static getInstance() {
        if (this.instance) {
            return this.instance;
        }

        this.instance = new ProjectState();

        return this.instance;
    }

    public addProject(title: string, description: string, people: number) {
        const project = new Project(
            Math.random().toString(),
            title,
            description,
            people
        );

        const oldProjects = this.state ?? [];
        const newState = [...oldProjects, project];

        this.setState(newState);
    }

    public moveProject(id: string, newStatus: ProjectStatus) {
        if (this.state) {
            const shouldUpdateProject = this.state.some((project) => {
                return project.id === id && project.status !== newStatus
            });
    
            if (!shouldUpdateProject) {
                return;
            }
    
            const updatedProjects = this.state.map((project) => {
                if (project.id !== id) {
                    return project;
                }
                
                return new Project(
                    project.id,
                    project.title,
                    project.description,
                    project.people,
                    newStatus,
                );
            });
    
            this.setState(updatedProjects);
        }
    }
}
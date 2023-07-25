/// <reference path='base.component.ts' />
/// <reference path='../models/drag-and-drop.interface.ts' />

namespace App {
    type ProjectItemParams = 
        | Pick<ComponentParams, 'hostId'>
        & { project: Project }

    export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
        private project: Project;

        get persons() {
            const { people } = this.project

            if (people === 1) {
                return '1 Pessoa atribuída';
            }


            return `${people} Pessoas atribuídas`;
        }

        constructor({ hostId, project }: ProjectItemParams) {
            super({ hostId, elementId: project.id, templateId: 'single-project' });

            this.project = project;

            this.configure();
            this.attach('beforeend');
            this.renderContent();
        }

        @Autobind
        dragStartHandler(event: DragEvent): void {
            event.dataTransfer?.setData('text/plain', this.project.id);
        }

        @Autobind
        dragEndHandler(_event: DragEvent): void {}

        configure() {
            this.element.addEventListener('dragstart', this.dragStartHandler);
            this.element.addEventListener('dragend', this.dragEndHandler);
        }

        renderContent(): void {
            this.querySelector('h2').textContent = this.project.title;
            this.querySelector('h3').textContent = this.persons;
            this.querySelector('p').textContent = this.project.description;
        }
    }
}
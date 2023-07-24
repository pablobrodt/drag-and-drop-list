// Drag and Drop interfaces
interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
    dragOverHandler(event: DragEvent): void;
    dropHandler(event: DragEvent): void;
    dragLeaveHandler(event: DragEvent): void;
}

// Component class
type ComponentParams = {
    hostId: string,
    templateId: string,
    elementId: string,
}

abstract class Component<HostElementType extends HTMLElement, ElementType extends HTMLElement> {
    protected templateElement: HTMLTemplateElement;
    protected element: ElementType;
    protected hostElement: HostElementType;

    constructor({ hostId, templateId, elementId }: ComponentParams) {
        this.templateElement = this.getElementById(templateId);
        this.hostElement = this.getElementById(hostId);

        const deepClone = true;
        const importedNode = document.importNode(this.templateElement.content, deepClone);

        this.element = importedNode.firstElementChild as ElementType;

        this.element.id = elementId;
    }

    protected getElementById<T extends HTMLElement>(id: string): T {
        return document.getElementById(id) as T;
    }

    protected querySelector<T extends HTMLElement>(selector: string): T {
        return this.element.querySelector(selector) as T;
    }

    protected attach(where: InsertPosition) {
        this.hostElement.insertAdjacentElement(where, this.element);
    }

    abstract renderContent(): void;
}

// Autobind decorator
function Autobind(_target: any, _methodName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const newDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            return originalMethod.bind(this);
        }
    }

    return newDescriptor;
}

// Validation
interface Validation {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

interface Validatable extends Validation {
    value: string | number;
}

function validate(validatable: Validatable) {
    const { value, required, minLength, maxLength, min, max } = validatable;
    
    const isString = typeof value === 'string';
    const isNumber = typeof value === 'number';

    let isValid = true;

    if (required) {
        const valueString = value.toString().trim();

        isValid = isValid && valueString.length > 0;
    }

    if (isString) {
        if (minLength !== undefined) {
            isValid = isValid && value.length >= minLength;
        }
    
        if (maxLength !== undefined) {
            isValid = isValid && value.length <= maxLength;
        }
    }


    if (isNumber) {
        if (min !== undefined) {
            isValid = isValid && value >= min;
        }
    
        if (max !== undefined) {
            isValid = isValid && value <= max;
        }
    }

    return isValid;
}

const titleValidation: Validation = {
    required: true,
}

const descriptionValidation: Validation = {
    required: true,
    minLength: 10,
    maxLength: 200,
}

const peopleValidation: Validation = {
    required: true,
    min: 1,
    max: 5,
}

// State management
type StateListener<T> = (state: T) => void;

abstract class State<T> {
    protected state?: T;
    private listeners: StateListener<T>[] = [];

    protected setState(value: T) {
        this.state = value

        for (const listener of this.listeners) {
            listener(this.state);
        }
    }

    public addListener(newListener: StateListener<T>) {
        this.listeners = [...this.listeners, newListener];
    }
}

class ProjectState extends State<Project[]> {
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
}

enum ProjectStatus {
    ACTIVE,
    FINISHED,
}

class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus = ProjectStatus.ACTIVE,
    ) {}
}

// ProjectInput class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        super({ hostId: 'app', templateId: 'project-input', elementId: 'user-input' });

        this.titleInputElement = this.querySelector('#title');
        this.descriptionInputElement = this.querySelector('#description');
        this.peopleInputElement = this.querySelector('#people');

        this.configure();
        this.attach('afterbegin');
    }

    private gatherUserInput(): [string, string, number] {
        const enteredTitle = this.titleInputElement.value.trim();
        const enteredDescription = this.descriptionInputElement.value.trim();
        const enteredPeople = Number(this.peopleInputElement.value.trim());

        return [enteredTitle, enteredDescription, enteredPeople];
    }

    private clearInputs() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }

    @Autobind
    private submitHandler(event: Event): void {
        event.preventDefault();

        const [title, description, people] = this.gatherUserInput();

        const titleValidatable: Validatable = {
            value: title,
            ...titleValidation,
        }

        const descriptionValidatable: Validatable = {
            value: description,
            ...descriptionValidation,
        }

        const peopleValidatable: Validatable = {
            value: people,
            ...peopleValidation,
        }

        if (validate(titleValidatable) && validate(descriptionValidatable) && validate(peopleValidatable)) {
            const projectState = ProjectState.getInstance();

            projectState.addProject(title, description, people);

            this.clearInputs();
        } else {
            alert('Formulário inválido!')
        }
    }

    private configure() {
        this.element.addEventListener('submit', this.submitHandler);
    }

    renderContent(): void {}
}

// ProjectItem class
type ProjectItemParams = 
    | Pick<ComponentParams, 'hostId'>
    & { project: Project }

class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
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
    dragEndHandler(event: DragEvent): void {
        console.log('@@@ drag end', event);
    }

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

// ProjectList class
enum ProjectListType {
    ACTIVE = 'active',
    FINISHED = 'finished',
};

class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
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
        console.log('@@@ drop event', event.dataTransfer?.getData('text/plain'));
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

const projectInput = new ProjectInput();
const activeProjectsList = new ProjectList(ProjectListType.ACTIVE);
const finishedProjectsList = new ProjectList(ProjectListType.FINISHED);
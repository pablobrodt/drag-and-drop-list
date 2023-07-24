"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class Component {
    constructor({ hostId, templateId, elementId }) {
        this.templateElement = this.getElementById(templateId);
        this.hostElement = this.getElementById(hostId);
        const deepClone = true;
        const importedNode = document.importNode(this.templateElement.content, deepClone);
        this.element = importedNode.firstElementChild;
        this.element.id = elementId;
    }
    getElementById(id) {
        return document.getElementById(id);
    }
    querySelector(selector) {
        return this.element.querySelector(selector);
    }
    attach(where) {
        this.hostElement.insertAdjacentElement(where, this.element);
    }
}
// Autobind decorator
function Autobind(_target, _methodName, descriptor) {
    const originalMethod = descriptor.value;
    const newDescriptor = {
        configurable: true,
        get() {
            return originalMethod.bind(this);
        }
    };
    return newDescriptor;
}
function validate(validatable) {
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
const titleValidation = {
    required: true,
};
const descriptionValidation = {
    required: true,
    minLength: 10,
    maxLength: 200,
};
const peopleValidation = {
    required: true,
    min: 1,
    max: 5,
};
class State {
    constructor() {
        this.listeners = [];
    }
    notifyListeners() {
        for (const listener of this.listeners) {
            listener(this.state);
        }
    }
    setState(value) {
        this.state = value;
        this.notifyListeners();
    }
    addListener(newListener) {
        this.listeners = [...this.listeners, newListener];
    }
}
class ProjectState extends State {
    constructor() {
        super();
        this.state = [];
    }
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }
    addProject(title, description, people) {
        var _a;
        const project = new Project(Math.random().toString(), title, description, people);
        const oldProjects = (_a = this.state) !== null && _a !== void 0 ? _a : [];
        const newState = [...oldProjects, project];
        this.setState(newState);
    }
    moveProject(id, newStatus) {
        if (this.state) {
            const shouldUpdateProject = this.state.some((project) => {
                return project.id === id && project.status !== newStatus;
            });
            if (!shouldUpdateProject) {
                return;
            }
            const updatedProjects = this.state.map((project) => {
                if (project.id !== id) {
                    return project;
                }
                return new Project(project.id, project.title, project.description, project.people, newStatus);
            });
            this.setState(updatedProjects);
        }
    }
}
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["ACTIVE"] = 0] = "ACTIVE";
    ProjectStatus[ProjectStatus["FINISHED"] = 1] = "FINISHED";
})(ProjectStatus || (ProjectStatus = {}));
class Project {
    constructor(id, title, description, people, status = ProjectStatus.ACTIVE) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.people = people;
        this.status = status;
    }
}
// ProjectInput class
class ProjectInput extends Component {
    constructor() {
        super({ hostId: 'app', templateId: 'project-input', elementId: 'user-input' });
        this.titleInputElement = this.querySelector('#title');
        this.descriptionInputElement = this.querySelector('#description');
        this.peopleInputElement = this.querySelector('#people');
        this.configure();
        this.attach('afterbegin');
    }
    gatherUserInput() {
        const enteredTitle = this.titleInputElement.value.trim();
        const enteredDescription = this.descriptionInputElement.value.trim();
        const enteredPeople = Number(this.peopleInputElement.value.trim());
        return [enteredTitle, enteredDescription, enteredPeople];
    }
    clearInputs() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }
    submitHandler(event) {
        event.preventDefault();
        const [title, description, people] = this.gatherUserInput();
        const titleValidatable = Object.assign({ value: title }, titleValidation);
        const descriptionValidatable = Object.assign({ value: description }, descriptionValidation);
        const peopleValidatable = Object.assign({ value: people }, peopleValidation);
        if (validate(titleValidatable) && validate(descriptionValidatable) && validate(peopleValidatable)) {
            const projectState = ProjectState.getInstance();
            projectState.addProject(title, description, people);
            this.clearInputs();
        }
        else {
            alert('Formulário inválido!');
        }
    }
    configure() {
        this.element.addEventListener('submit', this.submitHandler);
    }
    renderContent() { }
}
__decorate([
    Autobind
], ProjectInput.prototype, "submitHandler", null);
class ProjectItem extends Component {
    get persons() {
        const { people } = this.project;
        if (people === 1) {
            return '1 Pessoa atribuída';
        }
        return `${people} Pessoas atribuídas`;
    }
    constructor({ hostId, project }) {
        super({ hostId, elementId: project.id, templateId: 'single-project' });
        this.project = project;
        this.configure();
        this.attach('beforeend');
        this.renderContent();
    }
    dragStartHandler(event) {
        var _a;
        (_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.setData('text/plain', this.project.id);
    }
    dragEndHandler(event) {
        console.log('@@@ drag end', event);
    }
    configure() {
        this.element.addEventListener('dragstart', this.dragStartHandler);
        this.element.addEventListener('dragend', this.dragEndHandler);
    }
    renderContent() {
        this.querySelector('h2').textContent = this.project.title;
        this.querySelector('h3').textContent = this.persons;
        this.querySelector('p').textContent = this.project.description;
    }
}
__decorate([
    Autobind
], ProjectItem.prototype, "dragStartHandler", null);
__decorate([
    Autobind
], ProjectItem.prototype, "dragEndHandler", null);
// ProjectList class
var ProjectListType;
(function (ProjectListType) {
    ProjectListType["ACTIVE"] = "active";
    ProjectListType["FINISHED"] = "finished";
})(ProjectListType || (ProjectListType = {}));
;
class ProjectList extends Component {
    constructor(type) {
        super({ hostId: 'app', templateId: 'project-list', elementId: `${type}-projects` });
        this.type = type;
        this.projects = [];
        this.droppableClass = 'droppable';
        const projectState = ProjectState.getInstance();
        projectState.addListener((projects) => {
            this.projects = projects.filter((project) => {
                if (this.type === ProjectListType.ACTIVE) {
                    return project.status === ProjectStatus.ACTIVE;
                }
                return project.status === ProjectStatus.FINISHED;
            });
            this.renderProjects();
        });
        this.configure();
        this.attach('beforeend');
        this.renderContent();
    }
    dragOverHandler(event) {
        var _a;
        event.preventDefault();
        if (event.dataTransfer) {
            const [firstType] = event.dataTransfer.types;
            if (firstType === 'text/plain') {
                (_a = this.listElement) === null || _a === void 0 ? void 0 : _a.classList.add(this.droppableClass);
            }
        }
    }
    dropHandler(event) {
        if (event.dataTransfer) {
            const projectId = event.dataTransfer.getData('text/plain');
            let newStatus;
            switch (this.type) {
                case ProjectListType.ACTIVE:
                    newStatus = ProjectStatus.ACTIVE;
                    break;
                case ProjectListType.FINISHED:
                    newStatus = ProjectStatus.FINISHED;
                    break;
            }
            const projectState = ProjectState.getInstance();
            projectState.moveProject(projectId, newStatus);
        }
    }
    dragLeaveHandler(_event) {
        var _a;
        (_a = this.listElement) === null || _a === void 0 ? void 0 : _a.classList.remove(this.droppableClass);
    }
    configure() {
        const listId = `${this.type}-projects-list`;
        this.listElement = this.querySelector('ul');
        this.listElement.id = listId;
        this.listElement.addEventListener('dragover', this.dragOverHandler);
        this.listElement.addEventListener('dragleave', this.dragLeaveHandler);
        this.listElement.addEventListener('drop', this.dropHandler);
    }
    renderProjects() {
        if (this.listElement) {
            this.listElement.innerHTML = '';
            for (const project of this.projects) {
                const listElementId = this.listElement.id;
                new ProjectItem({ hostId: listElementId, project });
            }
        }
    }
    renderContent() {
        const titleElement = this.querySelector('h2');
        titleElement.textContent = `${this.type.toUpperCase()} PROJECTS`;
    }
}
__decorate([
    Autobind
], ProjectList.prototype, "dragOverHandler", null);
__decorate([
    Autobind
], ProjectList.prototype, "dropHandler", null);
__decorate([
    Autobind
], ProjectList.prototype, "dragLeaveHandler", null);
const projectInput = new ProjectInput();
const activeProjectsList = new ProjectList(ProjectListType.ACTIVE);
const finishedProjectsList = new ProjectList(ProjectListType.FINISHED);
//# sourceMappingURL=app.js.map
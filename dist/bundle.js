"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var App;
(function (App) {
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
    App.Component = Component;
})(App || (App = {}));
var App;
(function (App) {
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
    App.Autobind = Autobind;
})(App || (App = {}));
var App;
(function (App) {
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
    App.validate = validate;
})(App || (App = {}));
var App;
(function (App) {
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
    App.State = State;
})(App || (App = {}));
var App;
(function (App) {
    let ProjectStatus;
    (function (ProjectStatus) {
        ProjectStatus[ProjectStatus["ACTIVE"] = 0] = "ACTIVE";
        ProjectStatus[ProjectStatus["FINISHED"] = 1] = "FINISHED";
    })(ProjectStatus = App.ProjectStatus || (App.ProjectStatus = {}));
    class Project {
        constructor(id, title, description, people, status = ProjectStatus.ACTIVE) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.people = people;
            this.status = status;
        }
    }
    App.Project = Project;
})(App || (App = {}));
/// <reference path='base.state.ts' />
/// <reference path='../models/project.model.ts' />
var App;
(function (App) {
    class ProjectState extends App.State {
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
            const project = new App.Project(Math.random().toString(), title, description, people);
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
                    return new App.Project(project.id, project.title, project.description, project.people, newStatus);
                });
                this.setState(updatedProjects);
            }
        }
    }
    App.ProjectState = ProjectState;
})(App || (App = {}));
/// <reference path='base.component.ts' />
/// <reference path='../decorators/autobind.decorator.ts' />
/// <reference path='../util/validation.util.ts' />
/// <reference path='../state/project.state.ts' />
var App;
(function (App) {
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
    class ProjectInput extends App.Component {
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
            if (App.validate(titleValidatable) && App.validate(descriptionValidatable) && App.validate(peopleValidatable)) {
                const projectState = App.ProjectState.getInstance();
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
        App.Autobind
    ], ProjectInput.prototype, "submitHandler", null);
    App.ProjectInput = ProjectInput;
})(App || (App = {}));
/// <reference path='base.component.ts' />
/// <reference path='../models/drag-and-drop.interface.ts' />
/// <reference path='../models/project.model.ts' />
/// <reference path='../state/project.state.ts' />
var App;
(function (App) {
    let ProjectListType;
    (function (ProjectListType) {
        ProjectListType["ACTIVE"] = "active";
        ProjectListType["FINISHED"] = "finished";
    })(ProjectListType = App.ProjectListType || (App.ProjectListType = {}));
    ;
    class ProjectList extends App.Component {
        constructor(type) {
            super({ hostId: 'app', templateId: 'project-list', elementId: `${type}-projects` });
            this.type = type;
            this.projects = [];
            this.droppableClass = 'droppable';
            const projectState = App.ProjectState.getInstance();
            projectState.addListener((projects) => {
                this.projects = projects.filter((project) => {
                    if (this.type === ProjectListType.ACTIVE) {
                        return project.status === App.ProjectStatus.ACTIVE;
                    }
                    return project.status === App.ProjectStatus.FINISHED;
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
                        newStatus = App.ProjectStatus.ACTIVE;
                        break;
                    case ProjectListType.FINISHED:
                        newStatus = App.ProjectStatus.FINISHED;
                        break;
                }
                const projectState = App.ProjectState.getInstance();
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
                    new App.ProjectItem({ hostId: listElementId, project });
                }
            }
        }
        renderContent() {
            const titleElement = this.querySelector('h2');
            titleElement.textContent = `${this.type.toUpperCase()} PROJECTS`;
        }
    }
    __decorate([
        App.Autobind
    ], ProjectList.prototype, "dragOverHandler", null);
    __decorate([
        App.Autobind
    ], ProjectList.prototype, "dropHandler", null);
    __decorate([
        App.Autobind
    ], ProjectList.prototype, "dragLeaveHandler", null);
    App.ProjectList = ProjectList;
})(App || (App = {}));
/// <reference path='./components/project-input.component.ts' />
/// <reference path='./components/project-list.component.ts' />
var App;
(function (App) {
    new App.ProjectInput();
    new App.ProjectList(App.ProjectListType.ACTIVE);
    new App.ProjectList(App.ProjectListType.FINISHED);
})(App || (App = {}));
/// <reference path='base.component.ts' />
/// <reference path='../models/drag-and-drop.interface.ts' />
var App;
(function (App) {
    class ProjectItem extends App.Component {
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
        dragEndHandler(_event) { }
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
        App.Autobind
    ], ProjectItem.prototype, "dragStartHandler", null);
    __decorate([
        App.Autobind
    ], ProjectItem.prototype, "dragEndHandler", null);
    App.ProjectItem = ProjectItem;
})(App || (App = {}));
//# sourceMappingURL=bundle.js.map
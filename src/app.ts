// Render class
abstract class Render<T extends HTMLElement = HTMLElement> {
    protected templateElement: HTMLTemplateElement;
    protected templateFirstChild: T;
    protected hostElement: HTMLDivElement;

    constructor(templateId: string) {
        this.templateElement = this.getElementById(templateId);
        this.hostElement = this.getElementById('app');

        const deepClone = true;
        const importedNode = document.importNode(this.templateElement.content, deepClone);

        this.templateFirstChild = importedNode.firstElementChild as T;
    }

    protected getElementById<T extends HTMLElement = HTMLElement>(id: string): T {
        return document.getElementById(id) as T;
    }

    protected querySelector<T extends HTMLElement = HTMLElement>(selector: string): T {
        return this.templateFirstChild.querySelector(selector) as T;
    }

    protected attach(where: InsertPosition) {
        this.hostElement.insertAdjacentElement(where, this.templateFirstChild);
    }
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

// ProjectInput class
class ProjectInput extends Render<HTMLFormElement> {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        super('project-input');

        this.templateFirstChild.id = 'user-input';

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

            console.log('@@@', title, description, people);

            this.clearInputs();
        } else {
            alert('Formulário inválido!')
        }
    }

    private configure() {
        this.templateFirstChild.addEventListener('submit', this.submitHandler);
    }
}

// ProjectList class
enum ProjectListType {
    ACTIVE = 'active',
    FINISHED = 'finished',
};

class ProjectList extends Render {
    constructor(private type: ProjectListType) {
        super('project-list');

        this.templateFirstChild.id = `${this.type}-projects`;

        this.attach('beforeend');
        this.renderContent();
    }
    
    private renderContent() {
        const listId = `${this.type}-projects-list`;

        const listElement = this.querySelector('ul');
        const titleElement = this.querySelector('h2');

        listElement.id = listId;
        titleElement.textContent = `${this.type.toUpperCase()} PROJECTS`
    }
}

const projectInput = new ProjectInput();
const activeProjectsList = new ProjectList(ProjectListType.ACTIVE);
const finishedProjectsList = new ProjectList(ProjectListType.FINISHED);
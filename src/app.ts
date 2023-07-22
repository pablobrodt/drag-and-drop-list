// CustomDocument class
class CustomDocument {
    protected templateElement: HTMLTemplateElement;
    protected templateFirstChild: HTMLElement;
    protected hostElement: HTMLDivElement;

    constructor(templateId: string) {
        this.templateElement = this.getElementById(templateId);
        this.hostElement = this.getElementById('app');

        const deepClone = true;
        const importedNode = document.importNode(this.templateElement.content, deepClone);

        this.templateFirstChild = importedNode.firstElementChild as HTMLElement;
    }

    protected getTemplateFirstChild<T>() {
        return this.templateFirstChild as T;
    }

    protected getElementById<T>(id: string): T {
        return document.getElementById(id) as T;
    }

    protected querySelector<T>(selector: string): T {
        return this.templateFirstChild.querySelector(selector) as T;
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
class ProjectInput extends CustomDocument {
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
        this.attatch();
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
        const element = this.getTemplateFirstChild<HTMLFormElement>();
        
        element.addEventListener('submit', this.submitHandler);
    }

    private attatch() {
        this.hostElement.insertAdjacentElement('afterbegin', this.templateFirstChild);
    }
}

const projectInput = new ProjectInput();
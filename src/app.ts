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

// Validation function
function validateInputLength(...inputs: HTMLInputElement[]): boolean {
    return inputs.every((input) => {
        const trimmedValue = input.value.trim();

        return trimmedValue.length > 0;
    })
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

    private gatherUserInput(): [string, string, number] | void {
        const areInputsValid = validateInputLength(this.titleInputElement, this.descriptionInputElement, this.peopleInputElement)

        if (areInputsValid === false) {
            alert('Formulario invalido');
            return;
        }

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

        const userInputs = this.gatherUserInput();

        if (Array.isArray(userInputs)) {
            const [title, description, people] = userInputs;

            console.log('@@@', title, description, people);

            this.clearInputs();
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
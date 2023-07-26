export type ComponentParams = {
    hostId: string,
    templateId: string,
    elementId: string,
}

export abstract class Component<HostElementType extends HTMLElement, ElementType extends HTMLElement> {
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
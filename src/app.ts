/// <reference path='./components/project-input.component.ts' />
/// <reference path='./components/project-list.component.ts' />

namespace App {
    new ProjectInput();
    new ProjectList(ProjectListType.ACTIVE);
    new ProjectList(ProjectListType.FINISHED);
}
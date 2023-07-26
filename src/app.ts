import { ProjectInput } from './components/project-input.component.js';
import { ProjectList, ProjectListType } from './components/project-list.component.js';

new ProjectInput();
new ProjectList(ProjectListType.ACTIVE);
new ProjectList(ProjectListType.FINISHED);
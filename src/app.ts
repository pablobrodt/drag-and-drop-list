import { ProjectInput } from './components/project-input.component';
import { ProjectList, ProjectListType } from './components/project-list.component';

new ProjectInput();
new ProjectList(ProjectListType.ACTIVE);
new ProjectList(ProjectListType.FINISHED);
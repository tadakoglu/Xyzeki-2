import { PrivacyModes } from 'src/infrastructure/project-privacy-modes';

export class Project {
    constructor(
        public ProjectName: string,
        public Privacy:number= PrivacyModes.onlyOwner,
        public Owner?: string,
        public ProjectId?: number,
        public Order?: number,
        public Color?: string,
        public ProjectManager?: string
    ) { }
}


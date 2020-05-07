import { Injectable } from '@angular/core';
import { CloudContainer } from '../azure-models/cloud-container.model';

@Injectable()
export abstract class IContainerRepository {

    abstract getContainers(): CloudContainer[]
    abstract saveContainer(container: CloudContainer)
    abstract deleteContainer(containerName:string)
}

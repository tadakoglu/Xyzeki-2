import { Injectable, EventEmitter } from '@angular/core';
import { IContainerRepository } from '../abstract/i-container-repository';
import { CloudContainer } from '../azure-models/cloud-container.model';
import { FilesService } from '../services/files.service';
import { DataService } from '../services/shared/data.service';
import { XyzekiSignalrService } from '../signalr-services/xyzeki-signalr.service';
import { TimeService } from '../services/time.service';
import { concatMap } from 'rxjs/operators';
import { CloudContainers } from '../azure-models/cloud-containers.model';

@Injectable()
export class ContainerRepository implements IContainerRepository {
    constructor(private service: FilesService, private signalService: XyzekiSignalrService,
        private dataService: DataService, private timeService: TimeService) {

        this.loadBlobContainers();

        this.signalService.newContainerAvailable.subscribe(container => {
            this.saveContainerViaSignalR(container);
        })
        this.signalService.deletedContainerAvailable.subscribe(containerDeleted => {
            this.deleteContainerViaSignalR(containerDeleted);
        })
        this.dataService.reloadAllOnTeamDestroyEvent.subscribe(() => {
            this.loadBlobContainers(false)
        })
    }
    public loadBlobContainers(containerToOpen = true) { // ### reload this when team component destroyed.
        this.service.showContainers().subscribe(containersEnc => {
            this.containers.splice(0, this.containers.length);
            this.containers.push(...containersEnc.Containers)
            //this.containers = containersEnc.Containers

            if (containersEnc[0] && containerToOpen)
                this.containerToOpen.next(containersEnc[0])

            this.loaded = true;
        }
        );
    }
    
    loadContainersViaResolver(containers: CloudContainers) {
        this.containers.splice(0, this.containers.length);
        this.containers.push(...containers.Containers)
    }
    public loaded = false;

    public containerToOpen = new EventEmitter<CloudContainer>();
    private containers: CloudContainer[] = []


    getContainers(): CloudContainer[] {
        return this.containers
    }

    saveContainer(container: CloudContainer) {
        this.timeService.getNow().pipe(concatMap((now) => {
            container.CreatedAt = now;
            return this.service.createContainer(container.ContainerName);
        })).subscribe(result => {
            if (result != null) {
                this.containers.unshift(result);
                // send container with signalr to receivers
                this.signalService.notifyNewContainer(container);

                this.containerToOpen.next(result)
            }

        })


    }
    deleteContainer(containerName: string) {
        var del = confirm(containerName + ' isimli dosya konteynırını silmek istediğinize emin misiniz? Bu işlem içerisindeki tüm dosyaları silecektir.');
        if (!del)
            return;

        let container: CloudContainer = this.containers.find(cc => cc.ContainerName == containerName);
        if (container != undefined)
            this.signalService.notifyDeletedContainer(container);

        this.service.deleteContainer(containerName).subscribe(result => {
            if (result) {
                let index: number = this.containers.findIndex(val => val.ContainerName == containerName);
                this.containers.splice(index, 1);
                // delete container with signalr from receivers
            }

        })
    }
    saveContainerViaSignalR(container: CloudContainer) {
        let index: number = this.containers.findIndex(value => value.ContainerName == container.ContainerName)
        if (-1 == index) {
            this.containers.unshift(container);
        }
        else {
            this.containers.splice(index, 1, container);
        }

        //Run sorting again & change detection required if needed.


    }
    deleteContainerViaSignalR(containerDeleted: CloudContainer) {
        let index: number = this.containers.findIndex(value => value.ContainerName == containerDeleted.ContainerName)
        if (-1 != index) //if exists.
            this.containers.splice(index, 1);
    }





}


// private containers: CloudContainer[] = [
    //     new CloudContainer("tayfun tayfun tayfun tayfun 1", "URI", "tadakoglu", "1993-07-07"),
    //     new CloudContainer("osman 2", "URI", "tayada10", "1993-07-07"),
    //     new CloudContainer("semra semra  3", "URI", "tayada10", "1993-07-07"),
    //     new CloudContainer("ramazan semra ffdfd 4", "URI", "tadakoglu", "1993-07-07"),
    //     new CloudContainer("semra semra fdfdfdfd 5 ", "URI", "tayada10", "1993-07-07"),
    //     new CloudContainer("ramazan semra 6", "URI", "tadakoglu", "1993-07-07"),
    //     new CloudContainer("semra semra dfdfd 7 ", "URI", "tayada10", "1993-07-07"),
    //     new CloudContainer("ramazan sefddfmra 8", "URI", "tadakoglu", "1993-07-07"),
    //     new CloudContainer("ramazan semra 9", "URI", "tadakoglu", "1993-07-07"),
    //     new CloudContainer("semra semra dfdfd 10 ", "URI", "tayada10", "1993-07-07"),
    //     new CloudContainer("ramazan sefddfmra 11", "URI", "tadakoglu", "1993-07-07"),
    //     new CloudContainer("ramazan semra 12", "URI", "tadakoglu", "1993-07-07"),
    //     new CloudContainer("semra semra dfdfd 13", "URI", "tayada10", "1993-07-07"),
    //     new CloudContainer("ramazan sefddfmra 14", "URI", "tadakoglu", "1993-07-07"),
    //     new CloudContainer("ramazan semra 15", "URI", "tadakoglu", "1993-07-07"),
    //     new CloudContainer("semra semra dfdfd 16", "URI", "tayada10", "1993-07-07"),
    //     new CloudContainer("ramazan sefddfmra 17", "URI", "tadakoglu", "1993-07-07"),
    //     new CloudContainer("ramazan semra 18", "URI", "tadakoglu", "1993-07-07"),
    //     new CloudContainer("semra semra dfdfd 19 ", "URI", "tayada10", "1993-07-07"),
    //     new CloudContainer("ramazan sefddfmra 20", "URI", "tadakoglu", "1993-07-07"),

    // ]
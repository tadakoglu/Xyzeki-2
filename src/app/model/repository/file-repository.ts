import { FilesService } from '../services/files.service';
import { IFileRepository } from '../abstract/i-file-repository';
import { saveAs } from 'file-saver';
import { CloudFile } from '../azure-models/cloud-file.model';
import { XyzekiSignalrService } from '../signalr-services/xyzeki-signalr.service';
import { Injectable } from '@angular/core';
import { CloudFiles } from '../azure-models/cloud-files.model';

@Injectable()
export class FileRepository implements IFileRepository {

    constructor(private service: FilesService, private signalService: XyzekiSignalrService) {
        this.signalService.newContainerBlobAvailable.subscribe(containerBlob => {
            this.saveContainerBlobViaSignalR(containerBlob);
        })
        this.signalService.deletedContainerBlobAvailable.subscribe(containerBlobDeleted => {
            this.deleteContainerBlobViaSignalR(containerBlobDeleted);
        })
    }
    private containerName: string

    loadContainerFilesViaResolver(files: CloudFiles, containerName: string){
        this.containerName = containerName;
        this.files.splice(0, this.files.length);
        this.files.push(...files.Files);
    }
    
    loadAll(containerName: string) {       
        this.containerName = containerName; 
        this.service.showBlobs(containerName).subscribe(files => {
            this.files.splice(0, this.files.length);
            this.files.push(...files.Files);

            //this.files = files.Files; 
            this.loaded = true;
        }, error => console.error(error));
    }
    private files: CloudFile[] = [];

    public loaded = false;
    getFiles(): CloudFile[] {
        // return this.files
        return this.files.sort((cf1, cf2) => new Date(cf2.CreatedAt).getTime() - new Date(cf1.CreatedAt).getTime())

    }

    private uploadHandler: any;
    getUploadHandler(): any {
        return this.uploadHandler;
    }
    setUploadHandler(val) {
        this.uploadHandler = val;
    }

    fileDownloadInitiated: boolean;
    fileUploadInitiated: boolean;

    downloadFile(fileName: string) {
        this.fileDownloadInitiated = true;
        this.service.downloadFile(this.containerName, fileName).subscribe((result: any) => {
            if (result.type != 'text/plain') { //text/plain >> Content("File does not exist") results. If it's blob.
                var blob = new Blob([result]);
                //let saveAs = require('file-saver');
                let fName = fileName;
                saveAs(blob, fName);
            }
            else {
                alert('Dosya bulunamadı.');
            }
            this.fileDownloadInitiated = false;
        }
        );
    }

    insertFile(fileToUpload: FormData) {
        if (this.fileUploadInitiated)
            return;

        this.fileUploadInitiated = true;

        if (fileToUpload == undefined) {
            this.fileUploadInitiated = false;
            return;
        }


        this.service.insertFile(this.containerName, fileToUpload).subscribe((cf: CloudFile) => {
            if (cf != null) {
                let index: number = this.files.findIndex(val => val.FileName == cf.FileName);
                if (-1 != index)
                    this.files.splice(index, 1, cf)
                else {
                    this.files.unshift(cf);
                }
                this.signalService.notifyNewContainerBlob(cf);
            }
            else {
                alert('Üzgünüz bir sorun oluştu.');
            }
            this.fileUploadInitiated = false;
            this.uploadHandler = '';
        },
            err => console.log(err),
        );
    }

    deleteFile(fileName: string) {
        var del = confirm(fileName + ' isimli dosyayı silmek istediğinize emin misiniz?');
        if (!del)
            return;
        let blob: CloudFile = this.files.find(val => val.FileName == fileName);
        if (blob)
            this.signalService.notifyDeletedContainerBlob(blob)

        this.service.deleteFile(this.containerName, fileName).subscribe((response: boolean) => {
            if (response == true) {
                let index: number = this.files.findIndex(val => val.FileName == fileName);
                if (-1 != index)
                    this.files.splice(index, 1)
            }
        })
    }

    deleteContainerBlobViaSignalR(containerBlobDeleted: CloudFile) {
        let index: number = this.files.findIndex(value => value.FileName == containerBlobDeleted.FileName)
        if (-1 != index) //if exists.
            this.files.splice(index, 1);
    }
    saveContainerBlobViaSignalR(containerBlob: CloudFile) {
        if (this.containerName != containerBlob.ContainerName)
            return;

        let index: number = this.files.findIndex(value => value.FileName == containerBlob.FileName)
        if (-1 == index) {
            this.files.unshift(containerBlob);
        }
        else {
            this.files.splice(index, 1, containerBlob);
        }


    }



}


// private files: CloudFile[] = [] = [
    //     new CloudFile("dosya bir", "test", 1, "mp3", "tadakoglu", "2019-07-07"),
    //     new CloudFile("dosya iki", "test", 1, "jpg", "tayada10", "2019-07-07"),
    //     new CloudFile("dosya iki", "test", 1, "jpg", "tayada10", "2019-07-07"),
    //     new CloudFile("dosya iki", "test", 1, "jpg", "tayada10", "2019-07-07"),
    //     new CloudFile("dosya iki", "test", 1, "jpg", "tayada10", "2019-07-07"),
    //     new CloudFile("dosya iki", "test", 1, "jpg", "tayada10", "2019-07-07"),
    //     new CloudFile("dosya iki", "test", 1, "jpg", "tayada10", "2019-07-07"),
    //     new CloudFile("dosya iki", "test", 1, "jpg", "tayada10", "2019-07-07"),
    //     new CloudFile("dosya iki", "test", 1, "jpg", "tayada10", "2019-07-07"),
    //     new CloudFile("dosya iki", "test", 1, "jpg", "tayada10", "2019-07-07"),
    //     new CloudFile("dosya iki", "test", 1, "jpg", "tayada10", "2019-07-07"),
    //     new CloudFile("dosya iki", "test", 1, "jpg", "tayada10", "2019-07-07"),

    //     new CloudFile("dosya iki", "test", 1, "jpg", "tayada10", "2019-07-07"),


    //     new CloudFile("dosya iki", "test", 1, "jpg", "tayada10", "2019-07-07"),

    //     new CloudFile("dosya iki", "test", 1, "jpg", "tayada10", "2019-07-07"),
    //     new CloudFile("dosya iki", "test", 1, "jpg", "tayada10", "2019-07-07"),

    //     new CloudFile("dosya iki", "test", 1, "jpg", "tayada10", "2019-07-07"),
    //     new CloudFile("dosya iki", "test", 1, "jpg", "tayada10", "2019-07-07"),

    // ]
import { Injectable } from '@angular/core';
import { CloudFile } from '../azure-models/cloud-file.model';

@Injectable()
export abstract class IFileRepository {

    abstract getFiles(): CloudFile[]
    abstract downloadFile(fileName: string)
    abstract insertFile(fileToUpload: FormData)
    abstract deleteFile(fileName: string)
}

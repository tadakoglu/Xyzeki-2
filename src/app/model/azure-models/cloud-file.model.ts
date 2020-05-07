export class CloudFile {
    constructor(
        public FileName: string,
        public URL: string,
        public Size: number,
        public ContentType: string,
        public UploadedBy: string,
        public CreatedAt: string,
        public ContainerName:string,
    ) { }
}

export class PrivateTalk {
    constructor(
        public Owner:string,
        public Sender: string,
        public Thread:string,
        public DateTimeCreated: string = new Date().toISOString(), // that could be changed with a better option
        public PrivateTalkId: number = 0,

    ) { }

}
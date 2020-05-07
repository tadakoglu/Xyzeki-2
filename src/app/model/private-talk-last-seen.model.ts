export class PrivateTalkLastSeen {
    constructor(
        public PrivateTalkId: number,
        public Visitor: string,
        public LastSeen: string = new Date().toISOString(),
        public PrivateTalkLastSeenId?
    ) { }
} 

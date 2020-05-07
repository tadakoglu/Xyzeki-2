export class MemberSetting {
    constructor(
        public Username:string=null,
        public Theme: string='KlasikMavi',      
        public OwnerReporting:boolean=true,
        public AssignedToReporting:boolean=true, 
        public SwitchMode:number=0 // 0: Outgoing and Incoming, 1:Outgoing, 2: Incoming
    ) { }
}

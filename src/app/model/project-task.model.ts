export class ProjectTask
{
   constructor( // 7 property required
      public ProjectId:number,
      public TaskTitle:string,
      public AssignedTo:string=null,
      public TaskDescription:string=null,
      public Start:string = null,
      public Finish:string=null,
      public Deadline:string=null,
      public IsCompleted=false,
      public TaskId?:number, // resolved in db 
      public Order?:number,
      public Archived?:boolean,
      public Zindex:number=0,
      public ShowSubTasks:boolean=true,
      public Status:string=null
      ) {}         
        
}

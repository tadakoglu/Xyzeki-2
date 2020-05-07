export class QuickTask
{
   constructor( // 7 property required
      public TaskTitle:string,
      public Owner:string,
      public Completedby:string= null,
      public Start:string= null,
      public Date:string= null,   
      public Finish:string=null,
      public AssignedTo:string=null,
      public TaskId?:number, // resolved in db 
      public Order?:number,
      public Archived?:boolean,
      public ArchivedDate?:string,
      public Status:string=null
      ) {}         
        
}
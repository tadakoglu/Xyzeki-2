export class QuickTaskComment
{
   constructor(
      public TaskId:number,
      public Message:string,      
      public Sender:string,
      public DateTimeSent: string = new Date().toISOString(), // that could be changed with a better option
      public MessageId?:number,
      public Color?:string,
      ) {}         
        
}


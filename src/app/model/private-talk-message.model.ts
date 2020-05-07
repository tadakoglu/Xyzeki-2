import { MemberShared } from './member-shared.model';

export class PrivateTalkMessage
{
   constructor(
      public PrivateTalkId:number,
      public Message:string,      
      public Sender:string,
      public DateTimeSent: string, // that could be changed with a better option
      public MessageId?:number
      ) {}         
        
}


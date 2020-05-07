export class TeamMember 
{  
   constructor(
      public Username: string,
      public TeamId:number,
      public Status: boolean=null,
      public TeamMemberId:number=0,
      ){}
}

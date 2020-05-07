import { Injectable, Optional } from '@angular/core';

Injectable()
export class Team
{
   constructor(
    /*@Optional() public obj?: Object,*/
     public TeamName:string,
     @Optional() public Owner?:string, //resolved in api
     @Optional() public TeamId?:number, //resolved in database
     
     
     ) {
        //For manuel model binding
      //Object.assign(this, obj); 
     }  
              
}


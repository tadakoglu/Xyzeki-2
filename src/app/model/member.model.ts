import { Injectable } from '@angular/core';

Injectable()
export class Member {

        constructor(
                public Username: string,
                public Email: string,
                public Name: string,
                public Surname: string,
                public Avatar: string,
                public CryptoPassword: string,
                public CryptoSalt: string,

                public CellCountry?: number,
                public Cell?: number,              
                
                ) { }

}

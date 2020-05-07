import { Injectable } from '@angular/core';

Injectable()
export class RegisterModel {
    constructor() { }

    public Name: string
    public Surname: string
    public Username: string
    public Email: string
    public Password: string
    public Avatar: string
    public CellCountry?: number=90; //Turkey by default
    public Cell?: number
}

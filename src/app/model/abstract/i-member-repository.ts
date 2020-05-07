import { Injectable } from '@angular/core';
import { Member } from '../member.model';
import { Observable } from 'rxjs';

@Injectable()
export abstract class IMemberRepository {

    abstract getMember(username:string):Observable<Member>

}

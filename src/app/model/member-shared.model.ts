import { Injectable, Optional } from '@angular/core';
import { BehaviorSubject, Subject, ReplaySubject } from 'rxjs';
import { Member } from './member.model';
import { ReturnModel } from './return.model';
import { Tuple } from './tuple.model';
import { MemberSettingService } from './services/member-setting.service';
import { MemberSetting } from './member-setting.model';
import { JwtHelperService } from '@auth0/angular-jwt';

const jwtHelper = new JwtHelperService();

// #todo Store tokens/userdata in sessions, local storage is insafe
@Injectable()
export class MemberShared {
    constructor() { }

    private empty = new Member(null, null, null, null, null, null, null);
    public token: Subject<string> = new ReplaySubject<string>(1); // behave like behavioursubject because of buffer=1, other values cached.
    public account: BehaviorSubject<Member> = new BehaviorSubject<Member>(this.empty);
    public Username: string
    public LoggedIn: boolean
    public tokenStr: string;
    Auth(tokenAndMember: ReturnModel<Tuple<string, Member>>) {
        let token = tokenAndMember.Model.Item1;
        let member = tokenAndMember.Model.Item2;

        this.token.next(token);
        this.tokenStr = token;
        this.account.next(member);
        this.Username = member.Username;

        this.LoggedIn = true;

        // localStorage.setItem("Xyzeki_Member", JSON.stringify(member)); // Persistance
        // localStorage.setItem("Xyzeki_JWTToken", token); // Persistance
    }

    LogOut() {
        // localStorage.removeItem("Xyzeki_Member");
        // localStorage.removeItem("Xyzeki_JWTToken");
  
        location.reload();
        this.token.next('0');
        this.LoggedIn = false;
        this.token = undefined;
        //this.loadDefaultSetting();
        this.Username = null;
    }

    // loadDefaultSetting() {
    //     let element: HTMLElement = document.getElementById('appBody');
    //     element.className = null;
    //     element.classList.add('KlasikBeyaz');

    // }
    isValidToken(): boolean {
        //let member: Member = JSON.parse(localStorage.getItem("Xyzeki_Member")) as Member
        // let token = localStorage.getItem("Xyzeki_JWTToken");
        // console.log('token bitiş' + jwtHelper.getTokenExpirationDate(this.tokenStr));
        if (this.tokenStr && !jwtHelper.isTokenExpired(this.tokenStr)) {
            return true;
        }
        else {
            return false;
        }
    }

    // retrieveAuthMember() { // Get & Set
    //     try {
    //         let member: Member = JSON.parse(localStorage.getItem("Xyzeki_Member")) as Member
    //         let token = localStorage.getItem("Xyzeki_JWTToken");

    //         if (member && token && !jwtHelper.isTokenExpired(token)) {
    //             this.token.next(token);
    //             this.account.next(member);
    //             this.Username = member.Username;
    //             this.LoggedIn = true;
    //         }

    //     } catch (error) {
    //         // do nothing if failed
    //     }
    // }




}




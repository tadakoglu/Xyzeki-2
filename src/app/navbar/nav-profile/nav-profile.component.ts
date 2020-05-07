import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { MemberShared } from 'src/app/model/member-shared.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-profile',
  templateUrl: './nav-profile.component.html',
  styleUrls: ['./nav-profile.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class NavProfileComponent implements OnInit {

  constructor(private router: Router, public memberShared: MemberShared) { }

  ngOnInit() {
  }
  logOut(){
    this.memberShared.LogOut();
    this.router.navigate(['/'])
  }
  @Input() isLocked=false;

}

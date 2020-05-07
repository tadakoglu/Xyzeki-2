import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MemberShared } from 'src/app/model/member-shared.model';
import { Router } from '@angular/router';
import { PrivateTalkRepository } from 'src/app/model/repository/private-talk-repository';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class NavbarComponent implements OnInit {

  constructor(private router: Router, public memberShared: MemberShared, public repositoryPT:PrivateTalkRepository) { }

  ngOnInit() {
  }
  

  get getUnreadTotalPTCount(): number {
    return this.repositoryPT.getUnreadTotalPTCount();
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    
  }

}

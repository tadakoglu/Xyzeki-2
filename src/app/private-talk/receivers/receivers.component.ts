import { Component, OnInit, ViewChild, OnDestroy, ElementRef, HostListener, AfterViewInit, Input, ChangeDetectionStrategy, SimpleChanges, OnChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MemberShared } from 'src/app/model/member-shared.model';
import { NgForm } from '@angular/forms';
import { TeamMemberRepository } from 'src/app/model/repository/team-member-repository';
import { Member } from 'src/app/model/member.model';
import { PrivateTalkReceiver } from 'src/app/model/private-talk-receiver.model';
import { PrivateTalkReceiversService } from 'src/app/model/services/private-talk-receivers.service';
import { Subscription } from 'rxjs';
import { PrivateTalkTeamReceiver } from 'src/app/model/private-talk-team-receiver.model';
import { PrivateTalkTeamReceiversService } from 'src/app/model/services/private-talk-team-receivers.service';
import { TeamRepository } from 'src/app/model/repository/team-repository';
import { Team } from 'src/app/model/team.model';

@Component({
  selector: 'app-receivers',
  templateUrl: './receivers.component.html',
  styleUrls: ['./receivers.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ReceiversComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  constructor(private repositoryTM: TeamMemberRepository, private teamRepository: TeamRepository, private receiversService: PrivateTalkReceiversService, private teamReceiversService: PrivateTalkTeamReceiversService, private router: Router, private route: ActivatedRoute, public memberShared: MemberShared, ) {
    this.focusOnInput();

  }

  ngAfterViewInit(): void {
    this.focusOnInput();
  }

  public getMemberPT(username): Member {
    return this.repositoryTM.getAllTeamMembersPTAsMembers().find(m => m.Username == username);
  }
  // Whenever parent component changes the value of properties used in child component
  // decorated with @Input() then the method ngOnChanges() created in child component runs automatically.
  ngOnChanges(changes: SimpleChanges) {
    // create header using child_id
    if (this.privateTalkId) {
      this.loadAllReceivers(); /// repo kullan
    }

    console.log(this.privateTalkId);
  }
  private subscription: Subscription;
  private subscription2: Subscription;
  ngOnInit(): void {
    this.loadAllReceivers();
    // this.repositoryTM.openHubConnection();
  }
  loadAllReceivers() {
    this.subscription = this.receiversService.privateTalkReceivers(this.getPrivateTalkId).subscribe(ptr => {
      this.privateTalkReceivers.splice(0, this.privateTalkReceivers.length);
      this.privateTalkReceivers.push(...ptr);

      //this.privateTalkReceivers = ptr;
    });
    this.subscription2 = this.teamReceiversService.privateTalkTeamReceivers(this.getPrivateTalkId).subscribe(pttr => {
      this.privateTalkTeamReceivers.splice(0, this.privateTalkTeamReceivers.length);
      this.privateTalkTeamReceivers.push(...pttr);

      //this.privateTalkTeamReceivers = pttr;
      this.loading = false;
    });

  }

  ngOnDestroy(): void {
    // this.repositoryTM.closeHubConnection();
    this.subscription.unsubscribe();
    this.subscription2.unsubscribe();
  }
  @Input()
  set setPrivateTalkId(id) {
    this.privateTalkId = id;
  }
  get getPrivateTalkId() {
    return this.privateTalkId;
  }

  @Input()
  public privateTalkId: number;

  @Input()
  public outgoing: boolean = false;

  @Input()
  public incoming: boolean = true;

  @Input()
  public sender: string = null;

  @Input()
  public whiteColor: boolean = false;

  loading: boolean = true;


  newPrivateTalkMessagePanelOpen: boolean = false;
  togglePrivateTalkMessagePanel() {
    if (this.newPrivateTalkMessagePanelOpen == false) {
      this.newPrivateTalkMessagePanelOpen = true;
    }
    else
      this.newPrivateTalkMessagePanelOpen = false;

  }

  public getMember(username): Member {
    let member: Member = this.repositoryTM.getTeamMembersOwnedAsMembers().find(m => m.Username == username);
    if (member == undefined)
      member = this.repositoryTM.getTeamMembersJoinedAsMembers().find(m => m.Username == username);
    return member;
  }


  @ViewChild('messageForm') form: NgForm;
  onKeydownEvent(event: KeyboardEvent): void {
    if (event.keyCode === 13) {
      event.preventDefault(); // surpass enter
      this.form.ngSubmit.emit();
      this.form.reset();
    }
  }

  focusOnInput() {
    setTimeout(() => {
      if (document.getElementById('textForFocus'))
        document.getElementById('textForFocus').focus();
    }, 10);
  }

  public privateTalkReceivers: PrivateTalkReceiver[] = []; //bunları repoya bağla find ile ngonchanges üzerinden.
  public privateTalkTeamReceivers: PrivateTalkTeamReceiver[] = [];

  getTeamPT(teamId): Team {
    return this.teamRepository.getAllTeamsPT().find(team => team.TeamId == teamId);
  }
}

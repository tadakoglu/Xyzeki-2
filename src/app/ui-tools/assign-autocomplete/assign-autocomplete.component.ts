import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, Input, AfterViewInit, AfterContentInit, SimpleChanges, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { TeamMemberRepository } from 'src/app/model/repository/team-member-repository';
import { TeamMember } from 'src/app/model/team-member.model.';
import { MemberShared } from 'src/app/model/member-shared.model';
import { TeamRepository } from 'src/app/model/repository/team-repository';
import { Team } from 'src/app/model/team.model';
import { Member } from 'src/app/model/member.model';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-assign-autocomplete',
  templateUrl: './assign-autocomplete.component.html',
  styleUrls: ['./assign-autocomplete.component.css'],
  changeDetection: ChangeDetectionStrategy.Default})


export class AssignAutocompleteComponent implements AfterViewInit, OnDestroy, OnInit {
  ngOnInit(): void {
    //this.repositoryTM.openHubConnection();
  }
  ngOnDestroy(): void {
    //this.repositoryTM.closeHubConnection();
  }

  ngAfterViewInit(): void {
    if (this.privateTalkMode && this.firstPrivateTalkMode && !this.extraPrivateTalkMode) {
      setTimeout(() => {
        this.open();
      }, 350);
    }
    if (this.selectedItemOver)
      this.selectTeamMember(this.selectedItemOver, false);

  }

  @Input() public selectedItemOver: string;

  @Input() public normalMode: boolean = false;

  @Input() public privateTalkMode: boolean = false;
  @Input() public firstPrivateTalkMode: boolean = false;
  @Input() public extraPrivateTalkMode: boolean = false;

  @Input() public projectManagerMode: boolean = false;


  constructor(private repositoryTM: TeamMemberRepository, private repository: TeamRepository, public memberShared: MemberShared, ) {
  }

  get allTeamsPT(): Team[] {
    return this.repository.getAllTeamsPT()
  }
  public allTeamMembersPT(teamId: number): TeamMember[] {
    return this.repositoryTM.getAllTeamMembersPT().filter(val => val.TeamId == teamId && val.Status == true).filter(this.myFilter)
  }
  public getMemberPT(username): Member {
    return this.repositoryTM.getAllTeamMembersPTAsMembers().find(m => m.Username == username);
  }



  get myTeams(): Team[] {
    return this.repository.getMyTeams()
  }
  public getMember(username): Member {
    let member: Member = this.repositoryTM.getTeamMembersOwnedAsMembers().find(m => m.Username == username);
    if (member == undefined)
      member = this.repositoryTM.getTeamMembersJoinedAsMembers().find(m => m.Username == username);
    return member;
  }

  myTeamMembers(teamId: number): TeamMember[] {
    return this.repositoryTM.getTeamMembersOwned().filter(val => val.TeamId == teamId && val.Status == true).filter(this.myFilter)
  }
  private myFilter: any = (tm) => { return tm };

  @Output() assignedToEvent = new EventEmitter();
  @Output() assignedToEventEdit = new EventEmitter();
  @Output() assignedToEventForProject = new EventEmitter();
  @Output() assignedToEventForProjectEdit = new EventEmitter();

  @Output() receiverEventForPTalk = new EventEmitter();

  @Output() projectManagerSelectedEvent = new EventEmitter();

  @ViewChild("inputToFocus") inputElement: ElementRef;
  @ViewChild("inputToSearch") searchElement: ElementRef;


  private textToSearch: string;
  onSearchEvent($event) {
    this.textToSearch = ($event.target.value as string).toLocaleLowerCase()

    if ($event.target.value == "") {
      this.secimIptal();
    }

    this.setUpMyFilter();
  }

  setUpMyFilter() { // By Name, Surname or Username
    this.myFilter = ((teamMember: TeamMember) => {
      let name = this.getMemberPT(teamMember.Username).Name
      let surname = this.getMemberPT(teamMember.Username).Surname
      let full = name + ' ' + surname;
      return full.toLowerCase().includes(this.textToSearch) || teamMember.Username.includes(this.textToSearch)
    })
  }

  secimIptal() {
    this.selectedTM = null;
    this.inputElement.nativeElement.value = null;
    this.searchElement.nativeElement.value = null;
    this.myFilter = (tm) => { return tm };
    this.focusInput();
    this.emitAssignedTo(null);
  }

  load() {

    // this.repository.loadPTRelateds();
    // this.repositoryTM.loadPTRelateds();
    // this.repositoryTM.loadMYRelateds();
    // this.repository.loadMYRelateds();

  }
  focusInput() {
    setTimeout(() => {
      this.inputElement.nativeElement.focus()
      //@ViewChild("inputToFocus") inputElement: ElementRef;
    }, 250);
    // setTimeout(() => {
    //   this.load();
    // }, 1000);

  }


  @ViewChild(NgbDropdown)
  private dropdown: NgbDropdown;

  open() {
    this.dropdown.open();
    this.focusInput();


  }

  public selectedTM: string;

  selectTeamMember(username, isEmit = true) {
    if (this.privateTalkMode && this.memberShared.Username == username) // He/She can't add him/herself.
      return;

    this.selectedTM = username;
    this.inputElement.nativeElement.value = this.selectedTM;
    this.searchElement.nativeElement.value = this.selectedTM;
    if (isEmit)
      this.emitAssignedTo(this.selectedTM);

  }

  selectTeam(teamId, isEmit = true) {
    if (!this.privateTalkMode)
      return;

    this.selectedTM = this.allTeamsPT.find(val => val.TeamId == teamId).TeamName;
    this.inputElement.nativeElement.value = this.selectedTM;
    this.searchElement.nativeElement.value = this.selectedTM;
    if (isEmit)
      this.emitAssignedTo(teamId, true);

  }

  emitAssignedTo(value, isTeam = false) {
    this.assignedToEvent.emit(value);
    this.assignedToEventEdit.emit(value);
    this.assignedToEventForProject.emit(value);
    this.assignedToEventForProjectEdit.emit(value);

    this.receiverEventForPTalk.emit([value, isTeam]);

    this.projectManagerSelectedEvent.emit(value);
  }

}
// const distinctBy = (value, index, self) => {
//   return self.indexOf(value) === index;
// }

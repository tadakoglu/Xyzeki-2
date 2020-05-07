import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, ViewChild, AfterViewInit, Input, SimpleChanges, OnChanges, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatChipInputEvent, MatAutocomplete, MatAutocompleteTrigger } from '@angular/material';
import { map, startWith } from 'rxjs/operators';
import { TeamMemberRepository } from 'src/app/model/repository/team-member-repository';
import { TeamRepository } from 'src/app/model/repository/team-repository';
import { MemberShared } from 'src/app/model/member-shared.model';
import { Team } from 'src/app/model/team.model';
import { TeamMember } from 'src/app/model/team-member.model.';
import { Member } from 'src/app/model/member.model';
import { PrivateTalkReceiverRepository } from 'src/app/model/repository/private-talk-receiver-repository';


@Component({
  selector: 'app-edit-receivers',
  templateUrl: './edit-receivers.component.html',
  styleUrls: ['./edit-receivers.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class EditReceiversComponent implements OnChanges {

  @Input()
  set setPrivateTalkId(id) {
    this.privateTalkId = id;
  }
  get getPrivateTalkId() {
    return this.privateTalkId;
  }
  privateTalkId;

  public getReceivers(): string[] {
    return this.receiverRepo.getPrivateTalkReceivers().filter(ptr => ptr.PrivateTalkId == this.getPrivateTalkId).map(ptr => ptr.Receiver);
  }
  public getTeamReceivers(): number[] {
    return this.receiverRepo.getPrivateTalkTeamReceivers().filter(ptr => ptr.PrivateTalkId == this.getPrivateTalkId).map(pttr => pttr.TeamId);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (this.privateTalkId) {
      this.receivers.splice(0, this.receivers.length);
      //this.receivers = []; 
      this.receivers.push(...this.getReceivers());

      //this.teamReceivers = [];
      this.teamReceivers.splice(0, this.teamReceivers.length);
      this.teamReceivers.push(...this.getTeamReceivers());
    }
  }

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  receiverCtrl = new FormControl();

  visibleForTeam = true;
  selectableForTeam = true;
  removableForTeam = true;
  addOnBlurForTeam = true;
  separatorKeysCodesForTeam: number[] = [ENTER, COMMA];
  receiverCtrlForTeam = new FormControl();

  @Output()
  saveChangesEvent: EventEmitter<[string[], number[]]> = new EventEmitter();

  @Input()
  receivers: string[] = [] // Selected receivers

  @Input()
  teamReceivers: number[] = [] // Selected team receivers

  @ViewChild('receiverInput') receiverInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  @ViewChild('receiverInputForTeam') receiverInputForTeam: ElementRef<HTMLInputElement>;
  @ViewChild('autoForTeam') matAutocompleteForTeam: MatAutocomplete;

  constructor(private repositoryTM: TeamMemberRepository, private receiverRepo: PrivateTalkReceiverRepository, private repository: TeamRepository, public memberShared: MemberShared) {
    this.receiverCtrl.valueChanges.pipe(startWith(null)).subscribe((receiver: string | null) => this.receiverToLookUp = receiver);
    this.receiverCtrlForTeam.valueChanges.pipe(startWith(null)).subscribe((teamReceiver: string | null) => this.teamReceiverToLookUp = teamReceiver);
  }

  public receiverToLookUp: string = null;
  public teamReceiverToLookUp: string = null;


  @ViewChild('receiverInput', { read: MatAutocompleteTrigger }) autoComplete: MatAutocompleteTrigger;

  closePanel() {
    this.autoComplete.closePanel();
  }
  openPanel() {
    this.autoComplete._onChange("");
    this.autoComplete.openPanel();
  }


  @ViewChild('receiverInputForTeam', { read: MatAutocompleteTrigger }) autoCompleteForTeam: MatAutocompleteTrigger;

  closePanelForTeam() {
    this.autoCompleteForTeam.closePanel();
  }
  openPanelForTeam() {
    this.autoCompleteForTeam._onChange("");
    this.autoCompleteForTeam.openPanel();
  }


  add(event: MatChipInputEvent): void {
    if (!this.isValid(event.value))
      return;
    // Add receiver only when MatAutocomplete is not open
    // To make sure this does not conflict with OptionSelected Event

    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;

      // Add our receiver
      if ((value || '').trim()) {
        this.receivers.push(value.trim());
      }

      // Reset the input value
      if (input) {
        input.value = '';
      }

      this.receiverCtrl.setValue(null);
    }
  }
  addForTeam(event: MatChipInputEvent): void {
    if (!this.isValidForTeam(event.value))
      return;
    // Add receiver only when MatAutocomplete is not open
    // To make sure this does not conflict with OptionSelected Event

    if (!this.matAutocompleteForTeam.isOpen) {
      const input = event.input;
      const value = event.value;

      // Add our receiver
      if ((value || '').trim()) {
        this.teamReceivers.push(parseInt(value.trim()));
      }

      // Reset the input value
      if (input) {
        input.value = '';
      }

      this.receiverCtrlForTeam.setValue(null);
    }
  }


  remove(receiver: string): void {
    const index = this.receivers.indexOf(receiver);

    if (index >= 0) {
      this.receivers.splice(index, 1);
    }
  }
  removeForTeam(teamReceiver: number): void {
    const index = this.teamReceivers.indexOf(teamReceiver);

    if (index >= 0) {
      this.teamReceivers.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    if (!this.isValid(event.option.value))
      return;

    this.receivers.push(event.option.value);
    this.receiverInput.nativeElement.value = '';
    this.receiverCtrl.setValue(null);
    // setTimeout(() => {
    //   this.openPanel();
    // }, 0);

  }
  selectedForTeam(event: MatAutocompleteSelectedEvent): void {
    if (!this.isValidForTeam(event.option.value))
      return;

    this.teamReceivers.push(parseInt(event.option.value));
    this.receiverInputForTeam.nativeElement.value = '';
    this.receiverCtrlForTeam.setValue(null);
    // setTimeout(() => {
    //   this.openPanel();
    // }, 0);

  }
  isValid(username): boolean {
    let index = this.repositoryTM.getAllTeamMembersPT().filter(val => val.Status == true && val.Username != this.memberShared.Username).findIndex(tm => tm.Username == username);
    if (-1 != index)
      return true;
    else
      return false;
  }
  isValidForTeam(teamId): boolean {
    let index = this.repository.getAllTeamsPT().findIndex(t => t.TeamId == teamId);
    if (-1 != index)
      return true;
    else
      return false;
  }


  private lookUpFilterForTeam: any = (team: Team) => { return team.TeamName.toLowerCase().startsWith(this.teamReceiverToLookUp) }; // closed at first.

  private uniqueFilterForTeam: any = (team: Team) => { return this.isNotIncludedForTeam(team.TeamId) }; // closed at first.


  private lookUpFilter: any = (teamMember: TeamMember) => { return teamMember.Username.toLowerCase().startsWith(this.receiverToLookUp) }; // closed at first.

  private uniqueFilter: any = (teamMember: TeamMember) => { return this.isNotIncluded(teamMember.Username) }; // closed at first.

  private isNotIncluded(username) {
    return !this.receivers.includes(username);
  }
  private isNotIncludedForTeam(teamId) {
    return !this.teamReceivers.includes(teamId);
  }

  get allTeamMembersPT_V2(): TeamMember[] {
    return this.repositoryTM.getAllTeamMembersPT().filter(val => val.Status == true && val.Username != this.memberShared.Username).filter(this.uniqueFilter).filter(this.lookUpFilter);
  }
  public teamMemberTeam(teamId: number): Team {
    return this.repository.getAllTeamsPT().find(t => t.TeamId == teamId);
  }
  public getMemberPT(username): Member {
    return this.repositoryTM.getAllTeamMembersPTAsMembers().find(m => m.Username == username);
  }

  get allTeamsPT(): Team[] {
    return this.repository.getAllTeamsPT().filter(this.uniqueFilterForTeam).filter(this.lookUpFilterForTeam);
  }


}


/**  Copyright 2019 Google Inc. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at http://angular.io/license */
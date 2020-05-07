
import { Component, OnInit, ViewChild, OnDestroy, ElementRef, HostListener, AfterViewInit, SimpleChanges, OnChanges, Input, ChangeDetectionStrategy, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MemberShared } from 'src/app/model/member-shared.model';
import { NgForm } from '@angular/forms';
import { TeamMemberRepository } from 'src/app/model/repository/team-member-repository';
import { Member } from 'src/app/model/member.model';
import { DataService } from 'src/app/model/services/shared/data.service';
import { PrivateTalkMessagesService } from 'src/app/model/services/private-talk-messages.service'; import { PrivateTalkMessageRepository } from 'src/app/model/repository/private-talk-message-repository';
import { PrivateTalkMessage } from 'src/app/model/private-talk-message.model';
import { PrivateTalk } from 'src/app/model/private-talk.model';
import { PrivateTalkRepository } from 'src/app/model/repository/private-talk-repository';
import { PrivateTalksService } from 'src/app/model/services/private-talks.service';
import { MemberLicenseRepository } from 'src/app/model/repository/member-license-repository';
import { PrivateTalkReceiver } from 'src/app/model/private-talk-receiver.model';
import { PrivateTalkTeamReceiver } from 'src/app/model/private-talk-team-receiver.model';
import { EditReceiversComponent } from '../edit-receivers/edit-receivers.component';
import { PrivateTalkReceiverRepository } from 'src/app/model/repository/private-talk-receiver-repository';
import { TeamRepository } from 'src/app/model/repository/team-repository';
import { Team } from 'src/app/model/team.model';
import { fromEvent, Subscription, Subject } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, distinctUntilKeyChanged, filter, startWith } from 'rxjs/operators';
import { Emoji } from '@ctrl/ngx-emoji-mart/ngx-emoji/emoji.component';
import { PageSizes } from 'src/infrastructure/page-sizes';
import { XyzekiSignalrService } from 'src/app/model/signalr-services/xyzeki-signalr.service';
import { TimeService } from 'src/app/model/services/time.service';


@Component({
  selector: 'app-private-talk-messages',
  templateUrl: './private-talk-messages.component.html',
  styleUrls: ['./private-talk-messages.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class PrivateTalkMessagesComponent implements OnInit, AfterViewInit, OnDestroy {



  @ViewChild('textAreaX') textAreaX: ElementRef;
  private subscriptionTextArea: Subscription;

  ngAfterViewInit(): void {
    this.route.paramMap.subscribe(params => {
      setTimeout(() => {
        this.pTalkExistingRepo.resetUnreadCounter(Number.parseInt(params.get('PrivateTalkId')));
      }, 1500);
    });
    this.repository.typingSignal = undefined;


    this.focusOnInput();
    const textSignals$ = fromEvent<any>(this.textAreaX.nativeElement, 'keyup')
      .pipe(debounceTime(4000), filter(event => event.target.value != ''),
        map(event => new PrivateTalkMessage(this.privateTalkId, event.target.value, this.memberShared.Username, new Date().toISOString(), 0)),
        distinctUntilKeyChanged('Message'),
      )
    this.subscriptionTextArea = textSignals$
      .subscribe(
        (message: PrivateTalkMessage) => {
          this.sendTypingSignalMessage(message);
        }
      );


  }
  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;

    this.route.paramMap.subscribe(params => {
      this.privateTalkId = Number.parseInt(params.get('PrivateTalkId'))
      this.dataService.openPrivateTalkId = this.privateTalkId;


      this.pageNo = 1;
      this.repository.loadPrivateTalkMessages(this.privateTalkId)
      //this.repository = new PrivateTalkMessageRepository(this.privateTalkId, privateTalkMessageService, privateTalkMessageSignalrService, this.psz, this.timeService)
      Object.assign(this.privateTalkMessageModel, new PrivateTalkMessage(this.privateTalkId, '', this.memberShared.Username, null));
      //this.privateTalkMessageModel = new PrivateTalkMessage(this.privateTalkId, '', this.memberShared.Username, null);

    })
  }
  ngOnDestroy(): void {
    this.saveLastSeen(); // In case our member closes the private talk message component.
    this.dataService.openPrivateTalkId = 0;
    this.subscriptionTextArea.unsubscribe();

    // if (this.fastTypingTextareaSubscription) {
    //   this.fastTypingTextareaSubscription.unsubscribe();
    // }


  }

  @HostListener('window:beforeunload')
  saveLastSeen() { // In case our member clicks browser windows close.
    this.pTalkExistingRepo.signalService.notifyPrivateTalkLastSeen(this.privateTalkId);
  }


  public privateTalkMessageModel: PrivateTalkMessage = new PrivateTalkMessage(0, undefined, undefined, undefined, 0);
  public privateTalkId: number = 0; // input is for change detection 

  // public privateTalk: PrivateTalk = new PrivateTalk(null, null);

  public privateTalk(): PrivateTalk {
    let my = this.pTalkExistingRepo.getMyPrivateTalks().find(val => val.PrivateTalkId == this.privateTalkId);
    if (my != undefined)
      return my;
    else
      return this.pTalkExistingRepo.getPrivateTalksReceived().find(val => val.PrivateTalkId == this.privateTalkId);
  }
  sendTypingSignalMessage(privateTalkMessage) {
    return this.repository.sendTypingSignalViaSignalR(privateTalkMessage)
  }
  get typingSignalMessage(): PrivateTalkMessage {
    return this.repository.getTypingSignalMessage();
  }
  constructor(private repository: PrivateTalkMessageRepository, private repositoryTM: TeamMemberRepository, private teamRepository: TeamRepository, private receiverRepo: PrivateTalkReceiverRepository, private permissions: MemberLicenseRepository, private dataService: DataService, private pTalkExistingRepo: PrivateTalkRepository, private pTalkService: PrivateTalksService,
    private router: Router, private route: ActivatedRoute, public memberShared: MemberShared,
    private privateTalkMessageService: PrivateTalkMessagesService,
    private privateTalkMessageSignalrService: XyzekiSignalrService, private psz: PageSizes, private timeService: TimeService) {

    
    // this.fastTypingTextareaSubscription = this.fastTypingTextarea.pipe(debounceTime(1000), distinctUntilChanged()).subscribe(event => {
    //   this.privateTalkMessageModel.Message = event.target.value;
    //   this.onKeydownEvent(event)
    // })
    // this.focusOnInput();
  }
  // fastTypingTextarea = new Subject<any>();
  // fastTypingTextareaSubscription: Subscription



  deletePrivateTalk(privateTalkId) {
    this.pTalkExistingRepo.deletePrivateTalk(privateTalkId);
    setTimeout(() => {
      this.router.navigate(['/is-konusmalari'])
    }, 100);

  }


  public innerWidth: any;
  public innerHeight: any;
  @HostListener('window:resize', ['$event']) // respond to browser resizing
  onResize(event) {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;


    if (this.innerWidth < 992) {
      this.router.navigate(['/is-konusmalari/m', this.privateTalkId]);
    }
    if (this.innerWidth >= 992) {
      this.router.navigate(['/is-konusmalari', this.privateTalkId]);
    }
  }


  newPrivateTalkMessagePanelOpen: boolean = false;
  togglePrivateTalkMessagePanel() {
    if (this.newPrivateTalkMessagePanelOpen == false) {
      this.newPrivateTalkMessagePanelOpen = true;
    }
    else
      this.newPrivateTalkMessagePanelOpen = false;

  }
  getTeamPT(teamId): Team {
    return this.teamRepository.getAllTeamsPT().find(team => team.TeamId == teamId);
  }

  public getMember(username): Member {
    let member: Member = this.repositoryTM.getTeamMembersOwnedAsMembers().find(m => m.Username == username);
    if (member == undefined)
      member = this.repositoryTM.getTeamMembersJoinedAsMembers().find(m => m.Username == username);
    return member;
  }
  @ViewChild('scrollMe') scrollEl: ElementRef;
  @ViewChild('messageForm') form: NgForm;

  onKeydownEvent(event: KeyboardEvent): void {
    if (event.keyCode === 13) {
      event.preventDefault(); // surpass enter
      this.form.ngSubmit.emit();
      this.form.reset();
    }
  }

  onScrollDown() {
    console.log('scrolled down!!');
  }

  public pageNo: number = 1;
  onScrollUp() {
    this.repository.loadMorePrivateTalkMessages(++this.pageNo);
  }

  focusOnInputPTEdit() {
    setTimeout(() => {
      if (document.getElementById('textForFocusEdit'))
        document.getElementById('textForFocusEdit').focus();
    }, 10);
  }


  focusOnInput() {
    setTimeout(() => {
      if (document.getElementById('textForFocus'))
        document.getElementById('textForFocus').focus();
    }, 10);
  }

  get privateTalkMessages(): PrivateTalkMessage[] {
    return this.repository.getPrivateTalkMessages();
    //filter these with dates ascending. for messages.
  }

  modelSent: boolean = false;
  modelSubmitted: boolean = false; // That's for validation method

  addPrivateTalkMessage(privateTalkMessageForm: NgForm) {
    if (this.permissions.getAccessGranted()) {
      this.modelSubmitted = true;
      if (privateTalkMessageForm.valid) {
        this.privateTalkMessageModel.DateTimeSent = new Date().toISOString(); // set date time when sent.
        this.repository.savePrivateTalkMessage(this.privateTalkMessageModel)
        this.modelSent = true;
        this.modelSubmitted = false;
        this.privateTalkMessageModel = new PrivateTalkMessage(this.privateTalkId, '', this.memberShared.Username, null); // RESET
      }
    }
    else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);
    }

  }
  invalidLicensePanelOpen: boolean = false;



  modelSentForEdit: boolean = false;
  modelSubmittedForEdit: boolean = false;
  public privateTalkModelEdit = new PrivateTalk(null, this.memberShared.Username, null); //Reset

  editPrivateTalk(privateTalkForm: NgForm) {
    if (this.permissions.getAccessGranted()) {
      this.modelSubmittedForEdit = true;
      if (privateTalkForm.valid) {

        this.pTalkExistingRepo.savePrivateTalk(this.privateTalkModelEdit, this.receiversModel, this.teamReceiversModel); // to-do: implement update
        this.modelSentForEdit = true;
        this.modelSubmittedForEdit = false;
        this.privateTalkModelEdit = new PrivateTalk(null, this.memberShared.Username, null); //Reset
        this.resetReceiverModels() // reset receivers
        this.editPrivateTalkPanelOpen = false;
      }
    }
    else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);
    }
  }
  onSaveChanges(event) {
    this.receiversModel = event[0];
    this.teamReceiversModel = event[1];
    // event.preventDefault(); // surpass enter
    this.ptef.ngSubmit.emit();
    this.ptef.reset();
  }
  @ViewChild('privateTalkEditForm') ptef: NgForm;
  resetReceiverModels() {
    this.receiversModel = [];
    this.teamReceiversModel = [];
  }

  public receiversModel: string[] = [];
  public teamReceiversModel: number[] = [];


  @ViewChild(EditReceiversComponent) editReceiversComp: EditReceiversComponent;

  editPrivateTalkPanelOpen: boolean = false;
  privateTalkIdToEdit: number
  toggleEditPrivateTalkPanel(privateTalkId) {
    if (this.editPrivateTalkPanelOpen == false) {
      this.editPrivateTalkPanelOpen = true;
      Object.assign(this.privateTalkModelEdit, this.pTalkExistingRepo.getMyPrivateTalks().find(val => val.PrivateTalkId == privateTalkId))
      //team receivers bla bla
      this.focusOnInputPTEdit();
      this.privateTalkIdToEdit = privateTalkId;
    }
    else {
      this.editPrivateTalkPanelOpen = false;
      this.privateTalkIdToEdit = undefined;
    }
  }

  public getReceivers(privateTalkId): PrivateTalkReceiver[] {
    return this.receiverRepo.getPrivateTalkReceivers().filter(ptr => ptr.PrivateTalkId == privateTalkId);
  }
  public getTeamReceivers(privateTalkId): PrivateTalkTeamReceiver[] {
    return this.receiverRepo.getPrivateTalkTeamReceivers().filter(ptr => ptr.PrivateTalkId == privateTalkId);
  }
  // htmlString = 'test';
  sheet = 'emojione';
  // size = 22;
  sheetSize = 64;
  size = 22;

  get backgroundImageFn(): (set: string, sheetSize: number) => string {
    return (set: string, sheetSize: number) =>
      "../../../assets/emoji/emojione-64.png";
  }


  addEmoji(event) {
    let stringOne = this.privateTalkMessageModel.Message.substr(0, this.getCaretPosition());
    let stringOnev2 = stringOne + event.emoji.native;
    let stringTwo = this.privateTalkMessageModel.Message.substr(this.getCaretPosition())
    this.privateTalkMessageModel.Message = stringOnev2 + stringTwo;
  }
  caretPos: number = 0

  getCaretPosition() {
    let textLength = 0;
    textLength = this.privateTalkMessageModel.Message.length;
    let selectionStart = (this.textA.nativeElement as HTMLTextAreaElement).selectionStart;
    return selectionStart ? selectionStart : textLength;
  }
  @ViewChild('textAreaX') textA: ElementRef

  public backgroundImage: Emoji['backgroundImageFn'] = (set: string, sheetSize: number) => "../../../assets/emoji/emojione-sprite-40-people.png";




}

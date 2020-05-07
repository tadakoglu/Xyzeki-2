import { Component, Inject, HostListener, ViewChild, ElementRef, ChangeDetectionStrategy, OnInit, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { QuickToDoCommentRepository } from 'src/app/model/repository/quick-to-do-comment-repository';
import { ProjectToDoCommentRepository } from 'src/app/model/repository/project-to-do-comment-repository';
import { QuickToDoCommentsService } from 'src/app/model/services/quick-to-do-comments.service';
import { ProjectToDoCommentsService } from 'src/app/model/services/project-to-do-comments.service';
import { QuickTaskComment } from 'src/app/model/quick-task-comment.model';
import { ProjectTaskComment } from 'src/app/model/project-task-comment.model';
import { NgForm } from '@angular/forms';
import { MemberShared } from 'src/app/model/member-shared.model';
import { Member } from 'src/app/model/member.model';
import { TeamMemberRepository } from 'src/app/model/repository/team-member-repository';
import { MemberLicenseRepository } from 'src/app/model/repository/member-license-repository';
import { Emoji } from '@ctrl/ngx-emoji-mart/ngx-emoji/emoji.component';
import { XyzekiSignalrService } from 'src/app/model/signalr-services/xyzeki-signalr.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TimeService } from 'src/app/model/services/time.service';


export interface DialogData {
  taskId: number,
  title: string,
  kind: string
}

@Component({
  selector: 'app-task-comments',
  templateUrl: './task-comments.component.html',
  styleUrls: ['./task-comments.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class TaskCommentsComponent implements AfterViewInit {

  ngAfterViewInit(): void {
    (this.textA.nativeElement as HTMLTextAreaElement).blur();
  }
  public colors: string[] = ['#E9F6FE', '#E3E651', '#EA6E4F', '#80C76B', '#84D3E2', '#D0E185', '#292930']
  setColor(messageId) {
    if (this.permissions.getAccessGranted()) {
      let comment: any;
      if (this.kind == 'qtComments') {
        comment = this.qtCommentRepository.getQuickToDoComments().find((val, index, obj) => val.MessageId == messageId) // object assign doesnt allow undefined values to be assigned, checking them.
      } else if (this.kind == 'ptComments') {
        comment = this.ptCommentRepository.getProjectToDoComments().find((val, index, obj) => val.MessageId == messageId) // object assign doesnt allow undefined values to be assigned, checking them.
      }

      if (!comment)
        return;


      let commentColor = comment.Color
      if (commentColor) {
        let colorIndex = this.colors.findIndex((color) => color == commentColor);
        let nextIndex = (++colorIndex % 7);
        comment.Color = this.colors[nextIndex];
      } else {
        comment.Color = this.colors[1]; // set to white
      }


      if (this.kind == 'qtComments') {
        this.qtCommentRepository.saveQuickToDoComment(comment);
      }
      else if (this.kind == 'ptComments') {
        this.ptCommentRepository.saveProjectToDoComment(comment);
      }
    }
    else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);
    }
  }

  @HostListener('window:keyup.esc') onKeyUp() {
    this.closeComments();
  }

  public qtCommentModel: QuickTaskComment = new QuickTaskComment(0, undefined, undefined, undefined, 0, undefined);
  public ptCommentModel: ProjectTaskComment = new ProjectTaskComment(0, undefined, undefined, undefined, 0, undefined);

  public kind: string;
  public taskId: number;
  public title: string;

  constructor(public qtCommentRepository: QuickToDoCommentRepository, public ptCommentRepository: ProjectToDoCommentRepository, private repositoryTM: TeamMemberRepository, private permissions: MemberLicenseRepository, private dialogRef: MatDialogRef<TaskCommentsComponent>, @Inject(MAT_DIALOG_DATA) data: DialogData,
    private qtCommentsService: QuickToDoCommentsService, private ptCommentsService: ProjectToDoCommentsService,
    public memberShared: MemberShared, private commentSignalService: XyzekiSignalrService, private timeService: TimeService
  ) {
    this.taskId = data.taskId;
    this.kind = data.kind;
    this.title = data.title;
    if (this.kind == 'qtComments') {
      Object.assign(this.qtCommentModel, new QuickTaskComment(this.taskId, '', this.memberShared.Username))
      this.qtCommentRepository.loadComments(this.taskId);
      //this.qtCommentRepository = new QuickToDoCommentRepository(this.taskId, this.qtCommentsService, this.commentSignalService, this.timeService);
      //this.qtCommentModel = new QuickTaskComment(this.taskId, '', this.memberShared.Username);
      // this.fastTypingTextareaSubscription = this.fastTypingTextarea.pipe(debounceTime(1000), distinctUntilChanged()).subscribe(event => {
      //   this.qtCommentModel.Message = event.target.value;
      //   this.onKeydownEvent(event)
      // })
    } else if (this.kind == 'ptComments') {
      Object.assign(this.ptCommentModel, new ProjectTaskComment(this.taskId, '', this.memberShared.Username));
      this.ptCommentRepository.loadComments(this.taskId);
      // this.ptCommentRepository = new ProjectToDoCommentRepository(this.taskId, this.ptCommentsService, this.commentSignalService, this.timeService);
      // this.ptCommentModel = new ProjectTaskComment(this.taskId, '', this.memberShared.Username);
      // this.fastTypingTextareaSubscription = this.fastTypingTextarea.pipe(debounceTime(1000), distinctUntilChanged()).subscribe(event => {
      //   this.ptCommentModel.Message = event.target.value;
      //   this.onKeydownEvent(event)
      // })
    }
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
  }
  // fastTypingTextarea = new Subject<any>();
  // fastTypingTextareaSubscription: Subscription

  public innerWidth: any;
  public innerHeight: any;

  @HostListener('window:resize', ['$event']) // respond to browser resizing
  onResize(event) {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
  }
  onKeydownEvent(event): void {
    if (event.keyCode === 13) {
      event.preventDefault(); // surpass enter
      this.form.ngSubmit.emit();
      this.form.reset();
    }
  }
  @ViewChild('messageForm') form: NgForm;

  get comments(): any[] {
    if (this.kind == 'qtComments') {
      return this.qtCommentRepository.getQuickToDoComments();
    }
    else if (this.kind == 'ptComments') {
      return this.ptCommentRepository.getProjectToDoComments();
    }

  }

  public getMember(username): Member {
    let member: Member = this.repositoryTM.getTeamMembersOwnedAsMembers().find(m => m.Username == username);
    if (member == undefined)
      member = this.repositoryTM.getTeamMembersJoinedAsMembers().find(m => m.Username == username);
    return member;
  }

  modelSent: boolean = false;
  modelSubmitted: boolean = false; // That's for validation method

  addComment(commentForm: NgForm) {

    if (this.permissions.getAccessGranted()) {
      this.modelSubmitted = true;
      if (commentForm.valid) {
        if (this.kind == 'qtComments') {
          this.qtCommentModel.DateTimeSent = new Date().toISOString(); // set date time when sent.
          this.qtCommentRepository.saveQuickToDoComment(this.qtCommentModel);
          this.qtCommentModel = new QuickTaskComment(this.taskId, '', this.memberShared.Username);
        } else if (this.kind == 'ptComments') {
          this.ptCommentModel.DateTimeSent = new Date().toISOString(); // set date time when sent.
          this.ptCommentRepository.saveProjectToDoComment(this.ptCommentModel);
          this.ptCommentModel = new ProjectTaskComment(this.taskId, '', this.memberShared.Username);
        }
        this.modelSent = true;
        this.modelSubmitted = false;

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
  deleteComment(messageId) {
    if (this.permissions.getAccessGranted()) {
      if (this.kind == 'qtComments') {
        this.qtCommentRepository.deleteQuickToDoComment(messageId);
      } else if (this.kind == 'ptComments') {
        this.ptCommentRepository.deleteProjectToDoComment(messageId);
      }
    } else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);

    }

  }

  closeComments() {
    this.dialogRef.close();
  }
  closeCommentsWithValue() {
    this.dialogRef.close('3 yorum/not')
  }

  sheetSize = 64;
  size = 22;

  sheet = 'emojione';

  get backgroundImageFn(): (set: string, sheetSize: number) => string {
    return (set: string, sheetSize: number) =>
      "../../../assets/emoji/emojione-64.png";
  }



  // addEmoji(event) {
  //   if (this.qtCommentModel) {
  //     let stringOne = this.qtCommentModel.Message.substr(0, this.caretPos);
  //     let stringOnev2 = stringOne + event.emoji.native;
  //     let stringTwo = this.qtCommentModel.Message.substr(this.caretPos)
  //     this.qtCommentModel.Message = stringOnev2 + stringTwo;
  //     this.caretPos = this.qtCommentModel.Message.length;
  //   } else {
  //     let stringOneP = this.ptCommentModel.Message.substr(0, this.caretPos);
  //     let stringOnev2P = stringOneP + event.emoji.native;
  //     let stringTwoP = this.ptCommentModel.Message.substr(this.caretPos)
  //     this.ptCommentModel.Message = stringOnev2P + stringTwoP;
  //     this.caretPos = this.ptCommentModel.Message.length;
  //   }
  // }

  addEmoji(event) {
    if (this.kind == 'qtComments') {
      let stringOne = this.qtCommentModel.Message.substr(0, this.getCaretPosition());
      let stringOnev2 = stringOne + event.emoji.native;
      let stringTwo = this.qtCommentModel.Message.substr(this.getCaretPosition())
      this.qtCommentModel.Message = stringOnev2 + stringTwo;
    } else {
      let stringOneP = this.ptCommentModel.Message.substr(0, this.getCaretPosition());
      let stringOnev2P = stringOneP + event.emoji.native;
      let stringTwoP = this.ptCommentModel.Message.substr(this.getCaretPosition())
      this.ptCommentModel.Message = stringOnev2P + stringTwoP;
    }
  }

  getCaretPosition() {
    let textLength = 0;
    if (this.kind == 'qtComments') {
      textLength = this.qtCommentModel.Message.length;
    } else {
      textLength = this.ptCommentModel.Message.length;
    }
    let selectionStart = (this.textA.nativeElement as HTMLTextAreaElement).selectionStart;
    return selectionStart ? selectionStart : textLength;
  }
  @ViewChild('textAreaX') textA: ElementRef

  public backgroundImage: Emoji['backgroundImageFn'] = (set: string, sheetSize: number) => "../../../assets/emoji/emojione-sprite-40-people.png";

}

import { IQuickToDoCommentRepository } from '../abstract/i-quick-to-do-comment-repository';
import { QuickTaskComment } from '../quick-task-comment.model';
import { QuickToDoCommentsService } from '../services/quick-to-do-comments.service';
import { XyzekiSignalrService } from '../signalr-services/xyzeki-signalr.service';
import { TimeService } from '../services/time.service';
import { concatMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';

@Injectable()
export class QuickToDoCommentRepository implements IQuickToDoCommentRepository {

    constructor(private service: QuickToDoCommentsService,
        private signalService: XyzekiSignalrService, private timeService: TimeService) {
        

        this.signalService.newQuickToDoCommentAvailable.subscribe(qtComment => {
            this.saveQTCommentViaSignalR(qtComment[0]);
        })
        this.signalService.deletedQuickToDoCommentAvailable.subscribe(qtComment => {
            this.deleteQTCommentViaSignalR(qtComment);
        })


    }

    
    private taskId: number
    loadComments(taskId){
        this.taskId = taskId;
        this.service.quickTaskComments(taskId).subscribe(qtComments => {
            this.quickToDoComments.splice(0, this.quickToDoComments.length);
            this.quickToDoComments.push(...qtComments);

            //this.quickToDoComments = qtComments
        });
    }
    private quickToDoComments: QuickTaskComment[] = []

    getQuickToDoComments(): QuickTaskComment[] {
        return this.quickToDoComments;
    }

    //quick todo yorumlarını sadece owner ve assignedto değerli görebilir sinyal sadece bu kişilere gider. bu kişilere new/sil mesaj
    //project todo yorumlarını ise project owner, project manager ve project shareholders görebilir bu kişilere mesaj gider., bu kişilere new/sil mesajı
    //sinyalleme metoduna 'project', 'quick' değerlerini ekle uzaktan mesajı bu şekilde gönder.
    saveQuickToDoComment(quickToDoComment: QuickTaskComment) {
        if (quickToDoComment.MessageId == 0 || quickToDoComment.MessageId == null) {
            this.timeService.getNow().pipe(concatMap((now) => {
                quickToDoComment.DateTimeSent = now;
                return this.service.saveQuickTaskComment(quickToDoComment)
            })).subscribe(messageId => {
                quickToDoComment.MessageId = messageId;
                this.quickToDoComments.push(quickToDoComment);
                //Signalling via SignalR                
                this.signalService.notifyQuickToDoComment(quickToDoComment, 'new');
            })

        }
        else {
            // There will not be update mechanism for comments for now.

            this.service.updateQuickTaskComment(quickToDoComment).subscribe(() => {
                let index = this.quickToDoComments.findIndex(value => value.TaskId == quickToDoComment.MessageId)
                if (index != -1)
                    this.quickToDoComments.splice(index, 1, quickToDoComment);

                this.signalService.notifyQuickToDoComment(quickToDoComment, 'update');
            })
        }
    }

    deleteQuickToDoComment(messageId: number) {
        this.service.deleteQuickTaskComment(messageId).subscribe(qtComment => {
            let index: number = this.quickToDoComments.findIndex(value => value.MessageId == qtComment.MessageId);
            this.quickToDoComments.splice(index, 1);
            this.signalService.notifyDeletedQuickToDoComment(qtComment)
        })
    }
    saveQTCommentViaSignalR(quickTaskComment: QuickTaskComment) {
        if (quickTaskComment.TaskId != this.taskId) //  bu görevin atandığı proje shareholderlara, owner ve project manager
            return;
        let index = this.quickToDoComments.findIndex(val => val.MessageId == quickTaskComment.MessageId)
        if (-1 == index) // Not founded on repository
        {
            this.quickToDoComments.push(quickTaskComment);
        }
        else { // Founded on repository, just changes with what's sent( update mechanism)
            this.quickToDoComments.splice(index, 1, quickTaskComment); //change appearance     
        }

    }
    deleteQTCommentViaSignalR(quickTaskComment: QuickTaskComment) {
        let index: number = this.quickToDoComments.findIndex(value => value.MessageId == quickTaskComment.MessageId)
        if (-1 != index)
            this.quickToDoComments.splice(index, 1);
    }

    // public closeHubConnection() {
    //     this.signalService.closeHubConnection();
    // }
    // public openHubConnection() {
    //     this.signalService.openHubConnection();
    // }

}
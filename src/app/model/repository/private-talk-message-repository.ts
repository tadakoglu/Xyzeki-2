import { IPrivateTalkMessageRepository } from '../abstract/i-private-talk-message-repository';
import { PrivateTalkMessagesService } from '../services/private-talk-messages.service';
import { PrivateTalkMessage } from '../private-talk-message.model';
import { Subscription } from 'rxjs';
import { PageSizes } from 'src/infrastructure/page-sizes';
import { XyzekiSignalrService } from '../signalr-services/xyzeki-signalr.service';
import { TimeService } from '../services/time.service';
import { concatMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';

// @Injectable()
@Injectable()
export class PrivateTalkMessageRepository implements IPrivateTalkMessageRepository {

    constructor(private service: PrivateTalkMessagesService,
        private signalService: XyzekiSignalrService, private psz: PageSizes, private timeService: TimeService) {

        this.newMessageSubscription = this.signalService.newPrivateTalkMessageAvailable.subscribe(message => {
            this.savePrivateTalkMessageViaSignalR(message[0], message[1]);
        });
    }
    private privateTalkId: number = 0;
    
    loadPrivateTalkMessages(privateTalkId: number) {
        this.privateTalkId = privateTalkId;
        this.service.privateTalkMessages(privateTalkId, 1, this.psz.PTMPageSize).subscribe(messages => {
            this.privateTalkMessages.splice(0, this.privateTalkMessages.length)
            this.privateTalkMessages.push(...messages);
            //this.privateTalkMessages = messages
        });
    }
    newMessageSubscription: Subscription;

    private privateTalkMessages: PrivateTalkMessage[] = []

    getPrivateTalkMessages(): PrivateTalkMessage[] {
        return this.privateTalkMessages
    }

    savePrivateTalkMessage(privateTalkMessage: PrivateTalkMessage) {
        if (privateTalkMessage.MessageId == 0 || privateTalkMessage.MessageId == null) {
            this.timeService.getNow().pipe(concatMap((now) => {
                privateTalkMessage.DateTimeSent = now;
                return this.service.savePrivateTalkMessage(privateTalkMessage);
            })).subscribe(messageId => {
                privateTalkMessage.MessageId = messageId;
                this.privateTalkMessages.push(privateTalkMessage);
                //Signalling via SignalR                
                this.signalService.notifyNewPrivateTalkMessage(privateTalkMessage);
            })

        }
        else {
            // There will not be update mechanism for btalkmessages.
        }
    }

    set typingSignal(typingSignalMessage) {
        this.typingSignalMessage = typingSignalMessage;
    }
    private typingSignalMessage: PrivateTalkMessage;

    getTypingSignalMessage(): PrivateTalkMessage {
        return this.typingSignalMessage;
    }
    sendTypingSignalViaSignalR(privateTalkMessage: PrivateTalkMessage) {
        this.signalService.notifyNewPrivateTalkMessage(privateTalkMessage, true);
    }

    savePrivateTalkMessageViaSignalR(privateTalkMessage: PrivateTalkMessage, isTypingSignal: boolean = false) {
        if (privateTalkMessage.PrivateTalkId != this.privateTalkId)
            return; //otherwise add

        if (!isTypingSignal) { // PrivateTalkMessage

            // if (this.typingSignalMessage && this.typingSignalMessage.Sender == privateTalkMessage.Sender)
            //     this.typingSignalMessage = undefined;

            // //
            let index = this.privateTalkMessages.findIndex(val => val.MessageId == privateTalkMessage.MessageId)
            if (-1 == index) // Not founded on repository
            {
                this.privateTalkMessages.push(privateTalkMessage);
                //Run sorting again & change detection required if needed.
            }
            else { // Founded on repository, just changes with what's sent( update mechanism)
                this.privateTalkMessages.splice(index, 1, privateTalkMessage); //change appearance     
            }
        }
        else { // Just a typing signal

            this.typingSignalMessage = privateTalkMessage
            setTimeout(() => {
                this.typingSignalMessage = undefined;
            }, 1250);
        }


    }

    //unused method,  there will not be any delete mechanism for btalkmessage.
    deletePrivateTalkMessage(privateTalkMessageId: number) {
        this.service.deletePrivateTalkMessage(privateTalkMessageId).subscribe(message => {
            let index: number = this.privateTalkMessages.findIndex(value => value.MessageId == message.MessageId);
            this.privateTalkMessages.splice(index, 1);
        })
    }


    loadMorePrivateTalkMessages(pageNo: number) {
        this.service.privateTalkMessages(this.privateTalkId, pageNo, this.psz.PTMPageSize).subscribe(messages => {
            if (messages) {
                this.privateTalkMessages.unshift(...messages);

                let tempPT = Object.assign([], this.privateTalkMessages.filter((value, index, self) => self.indexOf(self.find(val => val.MessageId == value.MessageId)) === index));
                this.privateTalkMessages.splice(0, this.privateTalkMessages.length);
                this.privateTalkMessages.push(...tempPT);

                //this.privateTalkMessages = this.privateTalkMessages.filter((value, index, self) => self.indexOf(self.find(val => val.MessageId == value.MessageId)) === index);;
            }
            //That unique filter is for a problem when new messages sent and then member scroll up to load new messages, some messages will repeat.
            //A better approach can be applied later on .
        });
    }


    // public closeHubConnection() {
    //     this.signalService.closeHubConnection();
    // }
    // public openHubConnection() {
    //     this.signalService.openHubConnection();
    // }


}
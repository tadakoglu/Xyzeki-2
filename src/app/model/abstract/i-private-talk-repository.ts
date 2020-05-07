import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { PrivateTalk } from '../private-talk.model';
import { PrivateTalkReceiver } from '../private-talk-receiver.model';
import { PrivateTalkTeamReceiver } from '../private-talk-team-receiver.model';

@Injectable()
export abstract class IPrivateTalkRepository {
    abstract getMyPrivateTalks(): PrivateTalk[]
    abstract getPrivateTalksReceived(): PrivateTalk[]
    public privateTalkToOpen = new EventEmitter<PrivateTalk>();
    abstract getPrivateTalk(privateTalkId)
    abstract savePrivateTalk(privateTalk: PrivateTalk, receiversModel: string[], teamReceiversModel: number[])
    abstract deletePrivateTalk(privateTalkId: number)
    // save or delete methods doesn't return anything in front-end
}

import { Injectable } from '@angular/core';
import { PrivateTalkMessage } from '../private-talk-message.model';

@Injectable()
export abstract class IPrivateTalkMessageRepository {
    abstract getPrivateTalkMessages(): PrivateTalkMessage[]
    abstract loadMorePrivateTalkMessages(pageNo: number)
    abstract savePrivateTalkMessage(privateTalkMessage: PrivateTalkMessage)
    abstract deletePrivateTalkMessage(privateTalkMessageId: number)

    // save or delete methods doesn't return anything.
}

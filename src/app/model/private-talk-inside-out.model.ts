import { PrivateTalkReceiver } from './private-talk-receiver.model';
import { PrivateTalk } from './private-talk.model';
import { MessageCountModel } from './message-count.model';
import { PrivateTalkTeamReceiver } from './private-talk-team-receiver.model';

export class PrivateTalkInsideOut {
    constructor(
        public My: boolean,
        public PrivateTalk: PrivateTalk,
        public MessageCountModel: MessageCountModel,
        public Receivers: PrivateTalkReceiver[],
        public TeamReceivers: PrivateTalkTeamReceiver[]
    ) { }

} 
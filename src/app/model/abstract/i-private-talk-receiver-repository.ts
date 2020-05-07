import { Injectable } from '@angular/core';
import { PrivateTalkReceiver } from '../private-talk-receiver.model';
import { PrivateTalkTeamReceiver } from '../private-talk-team-receiver.model';

@Injectable()
export abstract class IPrivateTalkReceiverRepository {

    abstract getPrivateTalkReceivers(privateTalkId: number): PrivateTalkReceiver[]
    abstract getPrivateTalkTeamReceivers(privateTalkId: number): PrivateTalkTeamReceiver[]


    abstract deletePrivateTalkReceiver(privateTalkReceiverId: number): PrivateTalkReceiver
    abstract deletePrivateTalkTeamReceiver(privateTalkTeamReceiverId: number): PrivateTalkTeamReceiver

    abstract savePrivateTalkReceiver(privateTalkReceivers: PrivateTalkReceiver)
    abstract savePrivateTalkTeamReceiver(privateTalkTeamReceivers: PrivateTalkTeamReceiver)


    // abstract savePrivateTalkReceivers(privateTalkReceivers: PrivateTalkReceiver[])    
    // abstract savePrivateTalkTeamReceivers(privateTalkTeamReceivers: PrivateTalkTeamReceiver[])

}

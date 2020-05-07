import { Injectable, SimpleChanges } from '@angular/core';
import { PrivateTalkReceiver } from '../private-talk-receiver.model';
import { PrivateTalkTeamReceiver } from '../private-talk-team-receiver.model';
import { PrivateTalkReceiversService } from '../services/private-talk-receivers.service';
import { PrivateTalkTeamReceiversService } from '../services/private-talk-team-receivers.service';
import { PrivateTalk } from '../private-talk.model';
import { DataService } from '../services/shared/data.service';
import { PageSizes } from 'src/infrastructure/page-sizes';
import { XyzekiSignalrService } from '../signalr-services/xyzeki-signalr.service';
import { concatMap } from 'rxjs/operators';

@Injectable()
export class PrivateTalkReceiverRepository {
    constructor(private psz: PageSizes, private dataService: DataService, public signalService: XyzekiSignalrService, private receiversService: PrivateTalkReceiversService, private teamReceiversService: PrivateTalkTeamReceiversService) {
        this.loadAll(1);
    }

    loadAll(pageNo?: number, searchValue?: string) { //  private talk repo can do reloadeding when team component destroyed)
        this.receiversService.myPrivateTalkReceivers(pageNo, searchValue, this.psz.PTPageSize).subscribe(ptr => { // Page 1
            this.privateTalkReceivers.splice(0, this.privateTalkReceivers.length);
            this.privateTalkReceivers.push(...ptr);
            //this.privateTalkReceivers = ptr;
        });
        this.teamReceiversService.myPrivateTalkTeamReceivers(pageNo, searchValue, this.psz.PTPageSize).subscribe(pttr => { // Page 1
            this.privateTalkTeamReceivers.splice(0, this.privateTalkTeamReceivers.length);
            this.privateTalkTeamReceivers.push(...pttr);
            //this.privateTalkTeamReceivers = pttr;
            //this.loading = false;
        });
    }

    set setPrivateTalkId(id) {
        this.privateTalkId = id;
    }
    get getPrivateTalkId() {
        return this.privateTalkId;
    }
    public privateTalkId: number;

    //loading: boolean = true;

    getPrivateTalkReceivers(): PrivateTalkReceiver[] {
        return this.privateTalkReceivers;
    }
    getPrivateTalkTeamReceivers(): PrivateTalkTeamReceiver[] {
        return this.privateTalkTeamReceivers;
    }

    private privateTalkReceivers: PrivateTalkReceiver[] = []
    private privateTalkTeamReceivers: PrivateTalkTeamReceiver[] = []

    loadMoreReceivers(pageNo: number, searchValue?: string) {
        this.receiversService.myPrivateTalkReceivers(pageNo, searchValue, this.psz.PTPageSize).subscribe(ptr => { // Page ++ ,Receiver usernames
            this.privateTalkReceivers.push(...ptr);
        });
        this.teamReceiversService.myPrivateTalkTeamReceivers(pageNo, searchValue, this.psz.PTPageSize).subscribe(pttr => { // Page ++, Receiver team id's
            this.privateTalkTeamReceivers.push(...pttr);
            //this.loading = false;
        });
    }
    savePrivateTalkReceivers(receivers: PrivateTalkReceiver[], teamReceivers: PrivateTalkTeamReceiver[], mode: string = 'new', privateTalk: PrivateTalk) {
        if (mode == 'new') {
            this.receiversService.savePrivateTalkReceivers(receivers).pipe(concatMap(() => {
                return this.teamReceiversService.savePrivateTalkTeamReceivers(teamReceivers)
            }
            )).subscribe(() => {
                this.privateTalkReceivers.push(...receivers);
                this.privateTalkTeamReceivers.push(...teamReceivers);
                this.signalService.notifyNewPrivateTalk(privateTalk, receivers, teamReceivers);
            })

        }
        else if (mode == 'update') {

            let receiversOld: PrivateTalkReceiver[] = Object.assign([], this.getPrivateTalkReceivers().filter(val => val.PrivateTalkId == privateTalk.PrivateTalkId))
            let teamReceiversOld: PrivateTalkTeamReceiver[] = Object.assign([], this.getPrivateTalkTeamReceivers().filter(val => val.PrivateTalkId == privateTalk.PrivateTalkId));

            this.signalService.notifyDeletedPrivateTalkJoined(privateTalk, receiversOld, teamReceiversOld);

            this.receiversService.deletePrivateTalkReceivers(privateTalk.PrivateTalkId).pipe(concatMap((val, index) => {
                return this.receiversService.savePrivateTalkReceivers(receivers);
            })).pipe(concatMap((val, index) => {
                return this.teamReceiversService.deletePrivateTalkTeamReceivers(privateTalk.PrivateTalkId).pipe(concatMap((val, index) => {
                    return this.teamReceiversService.savePrivateTalkTeamReceivers(teamReceivers)
                }))
            })).subscribe(() => {

                let temp = Object.assign([], this.privateTalkReceivers.filter(val => val.PrivateTalkId != privateTalk.PrivateTalkId));
                this.privateTalkReceivers.splice(0, this.privateTalkReceivers.length);
                this.privateTalkReceivers.push(...temp);
                //this.privateTalkReceivers = this.privateTalkReceivers.filter(val => val.PrivateTalkId != privateTalk.PrivateTalkId);

                this.privateTalkReceivers.push(...receivers);

                let tempT = Object.assign([], this.privateTalkTeamReceivers.filter(val => val.PrivateTalkId != privateTalk.PrivateTalkId));
                this.privateTalkTeamReceivers.splice(0, this.privateTalkTeamReceivers.length);
                this.privateTalkTeamReceivers.push(...tempT);

                //this.privateTalkTeamReceivers = this.privateTalkTeamReceivers.filter(val => val.PrivateTalkId != privateTalk.PrivateTalkId);
                this.privateTalkTeamReceivers.push(...teamReceivers);

                this.signalService.notifyNewPrivateTalk(privateTalk, receivers, teamReceivers);
            });


        }

    }












}

import { HostListener } from '@angular/core';

export class PageSizes {

    //Page size MUST BE ALWAYS same, doesn't get affected by a user changing the viewport, for that reason no need for onResize...
    public QTPageSize = Math.floor(1.5 * innerHeight / 45) // QuickTask

    public PTPageSize = Math.floor(1.5 * innerHeight / 34) // PrivateTalk

    public PTMPageSize = Math.floor(1.5 * innerHeight / 73) // PrivateTalkMessage

    constructor() {
        this.innerWidth = window.innerWidth;
        this.innerHeight = window.innerHeight;
    }

    public innerWidth: any;
    public innerHeight: any;



}

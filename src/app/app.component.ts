import { Component, OnInit, AfterViewInit, HostListener, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { MemberShared } from './model/member-shared.model';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { CustomNgbDateParserFormatter } from 'src/infrastructure/custom-NgbDate-parser-formatter';
import { MembersService } from './model/services/members.service';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { SwitchHourDataService } from './model/services/shared/switch-hour-data.service';
import { DataService } from './model/services/shared/data.service';
import { isNullOrUndefined } from 'util';
import { SwPush, ServiceWorkerModule } from '@angular/service-worker';
import { environment } from 'src/environments/environment';


export const customNgbPFProvider = () => { return new CustomNgbDateParserFormatter(); };

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [{
    provide: NgbDateParserFormatter,
    useFactory: customNgbPFProvider
  }]
})

export class AppComponent implements OnInit, AfterViewInit {
  constructor(private cdr: ChangeDetectorRef, public memberShared: MemberShared, private router: Router, private switchHourDataService: SwitchHourDataService, public dataService: DataService) { // Initialize our member.

    //this.memberShared.retrieveAuthMember();
    this.loading = true;
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
  }
  title = 'Xyzeki';
  public innerWidth: any;
  public innerHeight: any;

  @HostListener('window:resize', ['$event']) // respond to browser resizing
  onResize(event) {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
  }

  // isCustomerSubdomain(): boolean { // this is an general solution
  //   const domain = window.location.hostname;
  //   if (domain.indexOf('.') < 0 || domain.split('.')[0] === 'www') { // add here your special xyzeki subdomains(except customers)
  //     return false;
  //   } else {
  //     return true;
  //     //domain.split('.')[0];
  //   }
  // }
  ngOnInit(): void {
    //this.setUpDefaultTheme();
    this.switchHourDataService.setupStyle.subscribe((c: { Left, Top, Visibility, isOpen }) => {
      this.switchHourStyle.Left = c.Left
      this.switchHourStyle.Top = c.Top
      this.switchHourStyle.Visibility = c.Visibility
      this.switchHourStyle.isOpen = c.isOpen
    })
    this.dataService.signalConnectionSeconds.subscribe(seconds => {
      this.secondsLeft = seconds;
      clearInterval(this.intervalId); // Always restart
      if (isNullOrUndefined(seconds)) {
        return;
      }
      this.intervalId = setInterval(() => {
        this.secondsLeft = this.secondsLeft - 1;
        if (this.secondsLeft === 0)
          clearInterval(this.intervalId)
      }, 1000)

    })

  }
  private intervalId;
  switchHourStyle = { Left: '0px', Top: '0px', Visibility: 'hidden', isOpen: false }

  public secondsLeft: number

  startConnectionNow() {

    this.dataService.startSignalConnection.next();
  }

  @Input()
  loading = true;
  ngAfterViewInit() {
    // if (this.isCustomerSubdomain()) {
    //   this.router.navigate(['/giris'])
    // }
    
    this.router.events.subscribe((event) => {
      switch (true) {
        case event instanceof NavigationStart: {
          this.loading = true;
          break;
        }

        case event instanceof NavigationEnd:
        case event instanceof NavigationCancel:
        case event instanceof NavigationError: {
          this.loading = false;
          
          // setTimeout(() => {
          //   this.loading = false;
          //   this.cdr.detectChanges
         
          // }, 200);

          break;
        }
        default: {
          break;
        }
      }
    });


  }

  // setUpDefaultTheme() {
  //   //let myArray = ["ArashiyamaBambulari", "Venedik", "Peribacalari", "Orman", "Yaprak", "Kedi", "Deniz", "Denizalti", "Brienz", "Bulutlar", "TropicalGunisigi", "DenizAgac", "Bulutlar", "Tarla"];
  //   // let myArray = ['Bulutlar']
  //   // let randomItem = myArray[Math.floor(Math.random() * myArray.length)];

  //   // let element: HTMLElement = document.getElementById('appBody');
  //   // element.className = null;
  //   // element.classList.add(randomItem);
  // }
  //   case 'ArashiyamaBambulari':
  //   element.classList.add('ArashiyamaBambulari');
  //   break;
  // case 'Venedik':
  //   element.classList.add('Venedik');
  //   break;
  // case 'Peribacalari':
  //   element.classList.add('Peribacalari');
  //   break;

  // case 'Orman':
  //   element.classList.add('Orman');
  //   break;
  // case 'Yaprak':
  //   element.classList.add('Yaprak');
  //   break;
  // case 'Kedi':
  //   element.classList.add('Kedi');
  //   break;
  // case 'Deniz':
  //   element.classList.add('Deniz');
  //   break;
  // case 'Deve':
  //   element.classList.add('Deve');
  //   break;
  // case 'Pamukkale':
  //   element.classList.add('Pamukkale');
  //   break;
  // case 'Denizalti':
  //   element.classList.add('Denizalti');
  //   break;
  // case 'Brienz':
  //   element.classList.add('Brienz');
  //   break;
  // case 'Aconcagua':
  //   element.classList.add('Aconcagua');
  //   break;
  // case 'Bulutlar':
  //   element.classList.add('Bulutlar');
  //   break;
  // case 'TropicalGunisigi':
  //   element.classList.add('TropicalGunisigi');
  //   break;
  // case 'DenizAgac':
  //   element.classList.add('DenizAgac');
  //   break;
  // case 'Tarla':
  //   element.classList.add('Tarla');
  //   break;






}

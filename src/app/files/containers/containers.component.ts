import { Component, OnInit, HostListener, AfterViewInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ContainerRepository } from 'src/app/model/repository/container-repository';
import { MemberShared } from 'src/app/model/member-shared.model';
import { DataService } from 'src/app/model/services/shared/data.service';
import { MemberLicenseRepository } from 'src/app/model/repository/member-license-repository';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamMemberRepository } from 'src/app/model/repository/team-member-repository';
import { Member } from 'src/app/model/member.model';
import { NgForm } from '@angular/forms';
import { CloudContainer } from 'src/app/model/azure-models/cloud-container.model';
import { MemberLicense } from 'src/app/model/member-license.model';
import { Subscription } from 'rxjs';
import { CloudContainers } from 'src/app/model/azure-models/cloud-containers.model';


@Component({
  selector: 'app-containers',
  templateUrl: './containers.component.html',
  styleUrls: ['./containers.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ContainersComponent implements OnInit, AfterViewInit, OnDestroy {
  ngAfterViewInit(): void {
    this.searchSubscription = this.dataService.newContainerSearchEvent.subscribe(searchValue => {
      this.localSearchCC(searchValue);
    })
  }
  ngOnDestroy(): void {
    this.searchSubscription ? this.searchSubscription.unsubscribe() : () => { };
    this.subscription ? this.subscription.unsubscribe() : () => { };
  }
  private searchSubscription: Subscription;

  constructor(public memberShared: MemberShared, private repositoryTM: TeamMemberRepository, private dataService: DataService, public mLicenseRepository: MemberLicenseRepository, private route: ActivatedRoute, private router: Router, private repository: ContainerRepository) { }

  private subscription: Subscription
  ngOnInit() {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
    
    this.route.data.subscribe((resolvedData: { containers: CloudContainers }) => {
      this.repository.loadContainersViaResolver(resolvedData.containers);
    })

    //when first loaded, searched pt, when added new pt, open first private talk if exists.
    // this.subscription = this.repository.containerToOpen.subscribe((container) => { //if a signal comes here, it works in every condition.
    //   if (this.innerWidth > 992) {
    //     this.containerName = container.ContainerName
    //     this.router.navigate(['dosyalar', container.ContainerName])
    //   }
    // });

    // // when second and more loads 
    // if (this.firstContainerAvailable()) {
    //   if (this.innerWidth > 992) {
    //     if (this.route.children) {
    //       let child = this.route.children.find((val, index, obj) => index == 0)
    //       if (!isNullOrUndefined(child)) {
    //         child.paramMap.subscribe(params => {
    //           if (!isNullOrUndefined(params))
    //             this.containerName = params.get('ContainerName').toString();
    //         })
    //       }
    //       else {
    //         this.containerName = this.firstContainerAvailable().ContainerName
    //         this.router.navigate(['dosyalar', this.firstContainerAvailable().ContainerName])
    //       }
    //     }

    //   }
    // }

  }
  // private firstContainerAvailable(): CloudContainer {
  //   return this.repository.getContainers().find((val, index, arr) => index == 0);
  // }
  public innerWidth: any;
  public innerHeight: any;

  @HostListener('window:resize', ['$event']) // respond to browser resizing
  onResize(event) {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;

    if (this.innerWidth < 992) {
      if (this.containerName != undefined)
        this.router.navigate(['/dosyalar/m', this.containerName]);
    }
    if (this.innerWidth >= 992) {
      if (this.containerName != undefined)
        this.router.navigate(['/dosyalar', this.containerName]);
    }

  }
  public getMember(username): Member {
    let member: Member = this.repositoryTM.getTeamMembersOwnedAsMembers().find(m => m.Username == username);
    if (member == undefined)
      member = this.repositoryTM.getTeamMembersJoinedAsMembers().find(m => m.Username == username);
    return member;
  }

  // public getMemberPT(username):Member{
  //   return this.repositoryTM.getAllTeamMembersPTAsMembers().find(m => m.Username == username);
  // }

  public containerModel = new CloudContainer(null, null, null, null);

  containers(): CloudContainer[] {
      return this.repository.getContainers().filter(cC => this.searchFilter(cC))
  }

  // get containers(): CloudContainer[] { // a pipe will sort items in here.
  //   // return this.repository.getContainers().filter(cC => this.searchFilter(cC))
  //   return this.repository.getContainers().filter(cC => this.searchFilter(cC))
  // }

  get myLicense(): MemberLicense {
    return this.mLicenseRepository.getMemberLicense();
  }

  // pageNo = 1;
  localSearchCC(searchValue) { // connect to 'input' event with fromEvent observable
    // this.pageNo = 1;
    this.searchValue = searchValue;
  }
  // get loaded() {
  //   return this.repository.loaded;
  // }
  loaded = true;
  searchFilter(cContainer: CloudContainer): boolean {
    if (this.searchValue == undefined)
      return true
    else
      return cContainer.ContainerName.toLocaleLowerCase().includes(this.searchValue.toLocaleLowerCase());
  }
  public searchValue: string;



  newContainerPanelOpen: boolean = false;
  toggleContainerPanel() {
    if (this.newContainerPanelOpen == false) {
      this.newContainerPanelOpen = true;
      this.containerName = undefined;
      this.router.navigate(['/dosyalar']);
      this.focusOnInputCT();
    }
    else {
      this.newContainerPanelOpen = false;
    }
  }
  focusOnInputCT() {
    setTimeout(() => {
      if (document.getElementById('inputToFocusCT'))
        document.getElementById('inputToFocusCT').focus();
    }, 10);
  }
  onScrollDown() {
    //to-do
  }
  public containerName: string;

  public oldContainerName: string
  onSelectContainer(containerName) {
    this.oldContainerName = this.containerName;
    this.containerName = containerName;
    if (innerWidth >= 992) {
      this.router.navigate(['dosyalar', containerName])
    }
    else {
      this.router.navigate(['dosyalar/m', containerName])
    }
    if (this.newContainerPanelOpen)
      this.toggleContainerPanel();
  }


  deleteContainer(containerName) {
    if (this.mLicenseRepository.getAccessGranted()) {
      this.repository.deleteContainer(containerName);
      
    }
    else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);
    }
  }

  modelSent: boolean = false;
  modelSubmitted: boolean = false;

  addContainer(containerForm: NgForm) {
    if (this.mLicenseRepository.getAccessGranted()) {
      this.modelSubmitted = true;
      if (containerForm.valid) {
        this.containerModel.CreatedAt = new Date().toISOString()
        this.containerModel.CreatedBy = this.memberShared.Username;
        this.repository.saveContainer(this.containerModel);
        this.modelSent = true;
        this.modelSubmitted = false;
        this.containerModel = new CloudContainer(null, null, null, null);
        this.toggleContainerPanel();
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

  searchBarOpen = false;
}







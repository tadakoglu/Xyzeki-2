import { Component, OnInit, HostListener, AfterViewInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FileRepository } from 'src/app/model/repository/file-repository';
import { FilesService } from 'src/app/model/services/files.service';
import { MemberLicenseRepository } from 'src/app/model/repository/member-license-repository';
import { MemberLicense } from 'src/app/model/member-license.model';
import { CloudFile } from 'src/app/model/azure-models/cloud-file.model';
import { TeamMemberRepository } from 'src/app/model/repository/team-member-repository';
import { Router, ActivatedRoute } from '@angular/router';
import { MemberShared } from 'src/app/model/member-shared.model';
import { Member } from 'src/app/model/member.model';
import { ContainerRepository } from 'src/app/model/repository/container-repository';
import { CloudContainer } from 'src/app/model/azure-models/cloud-container.model';
import { DataService } from 'src/app/model/services/shared/data.service';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { XyzekiSignalrService } from 'src/app/model/signalr-services/xyzeki-signalr.service';
import { CloudFiles } from 'src/app/model/azure-models/cloud-files.model';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class FilesComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(public repository: FileRepository, public _location: Location, private repositoryTM: TeamMemberRepository, private dataService: DataService, private containerExistingRepo: ContainerRepository, private fileService: FilesService, public mLicenseRepository: MemberLicenseRepository,
    private permissions: MemberLicenseRepository, private router: Router, private route: ActivatedRoute,
    public memberShared: MemberShared,
    private signalService: XyzekiSignalrService) {

  }

  ngAfterViewInit(): void {
    this.searchSubscription = this.dataService.newContainerBlobSearchEvent.subscribe(searchValue => {
      this.localSearchCF(searchValue);
    })
  }
  ngOnDestroy(): void {
    this.searchSubscription ? this.searchSubscription.unsubscribe() : () => { };
  }
  private searchSubscription: Subscription



  public containerName: string;

  public getMember(username): Member {
    let member: Member = this.repositoryTM.getTeamMembersOwnedAsMembers().find(m => m.Username == username);
    if (member == undefined)
      member = this.repositoryTM.getTeamMembersJoinedAsMembers().find(m => m.Username == username);
    return member;
  }
  deleteContainer(containerName: string) {
    this.containerExistingRepo.deleteContainer(containerName);
    // setTimeout(() => {
    //   this.router.navigate(['/dosyalar'])
    // }, 100);
    setTimeout(() => {
      this.router.navigate(['/dosyalar'])
      // this._location.back(); //or
    }, 100);

  }
  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;

    // this.route.paramMap.subscribe(params => {
    //   this.containerName = params.get('ContainerName')
    //   //this.repository = new FileRepository(this.containerName, fileService, signalService);
    //   this.repository.loadAll(this.containerName);
    // })

    this.route.data.subscribe((resolvedData: { containerFiles: CloudFiles }) => {
      this.containerName = this.route.snapshot.paramMap.get('ContainerName')
      this.repository.loadContainerFilesViaResolver(resolvedData.containerFiles, this.containerName);
    })

    //{  containerFiles: ContainerFilesResolverService }
  }
  get myLicense(): MemberLicense {
    return this.mLicenseRepository.getMemberLicense();
  }
  // get loaded() {
  //   return this.repository.loaded;
  // }
  loaded = true;

  get uploadHandler() {
    return this.repository.getUploadHandler;
  }
  public container(): CloudContainer {
    return this.containerExistingRepo.getContainers().find(val => val.ContainerName == this.containerName);
  }

  files(): CloudFile[] {
    return this.repository.getFiles().filter(cf => this.searchFilter(cf));
  }

  // get files(): CloudFile[] {
  //   return this.repository.getFiles().filter(cf => this.searchFilter(cf));

  // }

  // pageNo = 1;
  localSearchCF(searchValue) { // connect to 'input' event with fromEvent observable
    // this.pageNo = 1;
    this.searchValue = searchValue;
  }
  searchFilter(cFile: CloudFile): boolean {
    if (this.searchValue == undefined)
      return true
    else
      return cFile.FileName.toLocaleLowerCase().includes(this.searchValue.toLocaleLowerCase());
  }
  public searchValue: string;

  uploadFile(files: any) {
    if (this.permissions.getAccessGranted()) {
      let formData: FormData = new FormData();
      formData.append("asset", files[0], files[0].name);
      this.repository.insertFile(formData);
    } else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);
    }
  }

  downloadFile(fileName: string) {
    if (this.permissions.getAccessGranted()) {
      this.repository.downloadFile(fileName);
    } else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);
    }
  }

  deleteFile(fileName: string) {
    if (this.permissions.getAccessGranted()) {
      this.repository.deleteFile(fileName);
    } else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);
    }
  }
  invalidLicensePanelOpen: boolean = false;
  onScrollDown() {

  }



  public innerWidth: any;
  public innerHeight: any;
  @HostListener('window:resize', ['$event']) // respond to browser resizing
  onResize(event) {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;


    if (this.innerWidth < 992) {
      this.router.navigate(['/dosyalar/m', this.containerName]);
    }
    if (this.innerWidth >= 992) {
      this.router.navigate(['/dosyalar', this.containerName]);
    }
  }
  searchBarOpen = false;
}

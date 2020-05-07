import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { MemberShared } from 'src/app/model/member-shared.model';
import { ProjectRepository } from 'src/app/model/repository/project-repository';
import { Project } from 'src/app/model/project.model';
import { NgForm } from '@angular/forms';
import { DataService } from 'src/app/model/services/shared/data.service';
import { CdkDragDrop, moveItemInArray, CdkDragStart, CdkDragEnd } from '@angular/cdk/drag-drop';
import { AssignAutocompleteComponent } from 'src/app/ui-tools/assign-autocomplete/assign-autocomplete.component';
import { TeamMemberRepository } from 'src/app/model/repository/team-member-repository';
import { Member } from 'src/app/model/member.model';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { MemberLicenseRepository } from 'src/app/model/repository/member-license-repository';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-my-projects',
  templateUrl: './my-projects.component.html',
  styleUrls: ['./my-projects.component.css'],
  changeDetection: ChangeDetectionStrategy.Default})

export class MyProjectsComponent implements OnDestroy, OnInit, AfterViewInit {
  ngAfterViewInit(): void {
    this.searchSubscription = this.dataService.newDeepSearchEvent.subscribe(searchValue => {
      this.localSearchP(searchValue);
    })
  }
  ngOnDestroy(): void {
    this.searchSubscription ? this.searchSubscription.unsubscribe() : () => { };
  }
  private searchSubscription: Subscription

  ngOnInit(): void {
    this.route.data.subscribe((resolvedData: { myProjects: Project[], projectsAssigned: Project[] }) => {
      this.repository.loadMyProjectsViaResolver(resolvedData.myProjects);
      this.repository.loadProjectsAssignedViaResolver(resolvedData.projectsAssigned);
    })

  }

  constructor(private route: ActivatedRoute, private repositoryTM: TeamMemberRepository, private permissions: MemberLicenseRepository, public repository: ProjectRepository, private dataService: DataService, public memberShared: MemberShared) 
  {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;

  }

  public getMember(username): Member {
    let member: Member = this.repositoryTM.getTeamMembersOwnedAsMembers().find(m => m.Username == username);
    if (member == undefined)
      member = this.repositoryTM.getTeamMembersJoinedAsMembers().find(m => m.Username == username);
    return member;
  }
  focusOnInput() {
    setTimeout(() => {
      if (document.getElementById('textForFocus'))
        document.getElementById('textForFocus').focus();
    }, 10);
  }
  drop(event: CdkDragDrop<Project[]>) {
    if (this.permissions.getAccessGranted()) {
      let item1: Project = this.repository.getMyProjects().find((val, index, obj) => index == event.previousIndex);
      let indexPrevious = this.repository.getMyProjects().findIndex((val => val.ProjectId == item1.ProjectId))

      let item2: Project = this.repository.getMyProjects().find((val, index, obj) => index == event.currentIndex);
      let indexCurrent = this.repository.getMyProjects().findIndex((val => val.ProjectId == item2.ProjectId))

      moveItemInArray(this.repository.getMyProjects(), indexPrevious, indexCurrent);

      this.repository.reOrderAndSaveP();

    }
    else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);
    }
  }

  public colors: string[] = ['#E9F6FE', '#E3E651', '#EA6E4F', '#80C76B', '#84D3E2', '#D0E185', '#292930']
  setColor(projectId) {
    if (this.permissions.getAccessGranted()) {
      let proj: Project = this.repository.getMyProjects().find((val, index, obj) => val.ProjectId == projectId) // object assign doesnt allow undefined values to be assigned, checking them.
      if (!proj)
        return;
      let projColor = proj.Color
      if (projColor) {
        let colorIndex = this.colors.findIndex((color) => color == projColor);
        let nextIndex = (++colorIndex % 7);
        proj.Color = this.colors[nextIndex];
      } else {
        proj.Color = this.colors[1]; // set to white
      }
      this.repository.saveProject(proj);
    }
    else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);
    }
  }

  public projectModel = new Project(null);

  // pageNo = 1;
  localSearchP(searchValue) { // connect to 'input' event with fromEvent observable
    // this.pageNo = 1;
    this.searchValue = searchValue;
  }
  searchFilter(proj: Project): boolean {
    if (this.searchValue == undefined)
      return true
    else
      return proj.ProjectName.toLocaleLowerCase().includes(this.searchValue.toLocaleLowerCase());
  }
  public searchValue: string;

  public myProjects() {
    return this.repository.getMyProjects().filter(proj => this.searchFilter(proj));
  }
  public myProjectsAssigned() {
    return this.repository.getMyProjectsAssigned().filter(proj => this.searchFilter(proj));;
  }

  // get myProjects() {
  //   return this.repository.getMyProjects().filter(proj => this.searchFilter(proj));
  // }
  // get myProjectsAssigned() {
  //   return this.repository.getMyProjectsAssigned().filter(proj => this.searchFilter(proj));;
  // }
  //edit mechanism
  updateProjectPanelOpen: boolean = false;
  oldProjectId: number = 0;
  selectedProjectId;
  toggleUpdateProjectPanel(projectId) {

    this.modelSubmitted = false; // RESET

    if (this.newProjectPanelOpen) //close add panel if it were open, we'll use same addProject methot and model for both update and adding purposes.
      this.newProjectPanelOpen = false;

    if (this.oldProjectId == 0 || this.oldProjectId == projectId) { // if first click or the click on the open panel's project edit/x.. do the casual.

      if (this.updateProjectPanelOpen == false) {
        this.updateProjectPanelOpen = true;
        this.projectModel = Object.assign({}, this.repository.getMyProjects().find(val => val.ProjectId == projectId))
        this.focusOnInput();
      }
      else {
        this.updateProjectPanelOpen = false;
        this.projectModel = new Project(null); // RESET MODEL
      }

    }
    else { // if user clicked another team's edit without closing the first one.
      this.updateProjectPanelOpen = true;
      this.projectModel = Object.assign({}, this.repository.getMyProjects().find(val => val.ProjectId == projectId))
      this.focusOnInput();
    }
    this.oldProjectId = projectId;
  }
  //edit mechanism end

  newProjectPanelOpen: boolean = false;
  toggleProjectPanel() {
    this.modelSubmitted = false; // RESET

    if (this.updateProjectPanelOpen)
      this.updateProjectPanelOpen = false;

    if (this.newProjectPanelOpen == false) {
      this.newProjectPanelOpen = true;
      this.projectModel = new Project(null); //RESET MODEL 
      this.focusOnInput();
    }
    else
      this.newProjectPanelOpen = false;
  }

  public innerWidth: any;
  public innerHeight: any;

  @HostListener('window:resize', ['$event']) // respond to browser resizing
  onResize(event) {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
  }


  onDragStart(event: CdkDragStart) {
    if(this.innerWidth < 600){
      let element: HTMLElement = document.getElementsByTagName('html')[0]
      element.className = null;
    }
    
  } 
  onDragEnd(event: CdkDragEnd) {    
    if(this.innerWidth < 600){
      let element: HTMLElement = document.getElementsByTagName('html')[0]
      element.classList.add('hizlandir');
    }

  }



  @ViewChild(AssignAutocompleteComponent) child: AssignAutocompleteComponent;

  @ViewChild('pmDP') dropdown: NgbDropdown

  closeDropdown() {
    this.dropdown.close();
  }
  projectIdForProjectManager: number;

  onProjectManagerSelectedEvent($event) {
    if (this.permissions.getPrimaryAccessGranted()) {

      let proj: Project = Object.assign({}, this.repository.getMyProjects().find(val => val.ProjectId == this.projectIdForProjectManager));
      if (!proj)
        return;

      proj.ProjectManager = $event as string;
      this.repository.saveProject(proj);

      setTimeout(() => {
        this.closeDropdown();
      }, 250);
    }
    else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);
    }

  }

  modelSent: boolean = false;
  modelSubmitted: boolean = false; // That's for validation method

  addProject(projectForm: NgForm) {
    if (this.permissions.getAccessGranted()) {
      this.modelSubmitted = true;
      if (projectForm.valid) {
        this.projectModel.Owner = this.memberShared.Username;
        this.repository.saveProject(this.projectModel);
        this.modelSent = true;
        this.modelSubmitted = false;
        this.projectModel = new Project(null); // RESET MODEL
        this.oldProjectId = 0;
        this.updateProjectPanelOpen = false; // this is needed for update functinality of addProject method.
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

  deleteProject(projectId: number) {
    if (this.permissions.getAccessGranted()) {
      this.repository.deleteProject(projectId);
    }
    else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);
    }
  }

  searchBarOpen = false;


}

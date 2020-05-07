using System;
using System.Collections.Generic;

namespace XYZToDo.Models
{
    public partial class Member
    {
        public Member()
        {
            ConnectionComment = new HashSet<ConnectionComment>();
            ConnectionContainer = new HashSet<ConnectionContainer>();
            ConnectionContainerBlob = new HashSet<ConnectionContainerBlob>();
            ConnectionPrivateTalk = new HashSet<ConnectionPrivateTalk>();
            ConnectionPrivateTalkMessage = new HashSet<ConnectionPrivateTalkMessage>();
            ConnectionProject = new HashSet<ConnectionProject>();
            ConnectionProjectToDo = new HashSet<ConnectionProjectToDo>();
            ConnectionQuickToDo = new HashSet<ConnectionQuickToDo>();
            ConnectionTeamMember = new HashSet<ConnectionTeamMember>();
            ConnectionXyzeki = new HashSet<ConnectionXyzeki>();
            ForgotPassword = new HashSet<ForgotPassword>();
            PrivateTalkLastSeen = new HashSet<PrivateTalkLastSeen>();
            PrivateTalkMessage = new HashSet<PrivateTalkMessage>();
            PrivateTalkOwnerNavigation = new HashSet<PrivateTalk>();
            PrivateTalkReceiver = new HashSet<PrivateTalkReceiver>();
            PrivateTalkSenderNavigation = new HashSet<PrivateTalk>();
            ProjectOwnerNavigation = new HashSet<Project>();
            ProjectProjectManagerNavigation = new HashSet<Project>();
            ProjectTask = new HashSet<ProjectTask>();
            ProjectTaskComment = new HashSet<ProjectTaskComment>();
            QuickTaskAssignedToNavigation = new HashSet<QuickTask>();
            QuickTaskComment = new HashSet<QuickTaskComment>();
            QuickTaskOwnerNavigation = new HashSet<QuickTask>();
            Team = new HashSet<Team>();
            TeamMember = new HashSet<TeamMember>();
        }

        public string Username { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public decimal? CellCountry { get; set; }
        public decimal? Cell { get; set; }
        public string Avatar { get; set; }
        public string CryptoPassword { get; set; }
        public string CryptoSalt { get; set; }

        public MemberLicense MemberLicense { get; set; }
        public MemberSetting MemberSetting { get; set; }
        public ICollection<ConnectionComment> ConnectionComment { get; set; }
        public ICollection<ConnectionContainer> ConnectionContainer { get; set; }
        public ICollection<ConnectionContainerBlob> ConnectionContainerBlob { get; set; }
        public ICollection<ConnectionPrivateTalk> ConnectionPrivateTalk { get; set; }
        public ICollection<ConnectionPrivateTalkMessage> ConnectionPrivateTalkMessage { get; set; }
        public ICollection<ConnectionProject> ConnectionProject { get; set; }
        public ICollection<ConnectionProjectToDo> ConnectionProjectToDo { get; set; }
        public ICollection<ConnectionQuickToDo> ConnectionQuickToDo { get; set; }
        public ICollection<ConnectionTeamMember> ConnectionTeamMember { get; set; }
        public ICollection<ConnectionXyzeki> ConnectionXyzeki { get; set; }
        public ICollection<ForgotPassword> ForgotPassword { get; set; }
        public ICollection<PrivateTalkLastSeen> PrivateTalkLastSeen { get; set; }
        public ICollection<PrivateTalkMessage> PrivateTalkMessage { get; set; }
        public ICollection<PrivateTalk> PrivateTalkOwnerNavigation { get; set; }
        public ICollection<PrivateTalkReceiver> PrivateTalkReceiver { get; set; }
        public ICollection<PrivateTalk> PrivateTalkSenderNavigation { get; set; }
        public ICollection<Project> ProjectOwnerNavigation { get; set; }
        public ICollection<Project> ProjectProjectManagerNavigation { get; set; }
        public ICollection<ProjectTask> ProjectTask { get; set; }
        public ICollection<ProjectTaskComment> ProjectTaskComment { get; set; }
        public ICollection<QuickTask> QuickTaskAssignedToNavigation { get; set; }
        public ICollection<QuickTaskComment> QuickTaskComment { get; set; }
        public ICollection<QuickTask> QuickTaskOwnerNavigation { get; set; }
        public ICollection<Team> Team { get; set; }
        public ICollection<TeamMember> TeamMember { get; set; }
    }
}

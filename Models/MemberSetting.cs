using System;
using System.Collections.Generic;

namespace XYZToDo.Models
{
    public partial class MemberSetting
    {
        public string Username { get; set; }
        public string Theme { get; set; }
        public bool? OwnerReporting { get; set; }
        public bool? AssignedToReporting { get; set; }
        public int SwitchMode { get; set; }

        public Member UsernameNavigation { get; set; }
    }
}

using System;
using System.Collections.Generic;

namespace XYZToDo.Models
{
    public partial class TeamMember
    {
        public long TeamMemberId { get; set; }
        public long TeamId { get; set; }
        public string Username { get; set; }
        public bool? Status { get; set; }

        public Team Team { get; set; }
        public Member UsernameNavigation { get; set; }
    }
}

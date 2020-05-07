using System;
using System.Collections.Generic;

namespace XYZToDo.Models
{
    public partial class Team
    {
        public Team()
        {
            PrivateTalkTeamReceiver = new HashSet<PrivateTalkTeamReceiver>();
            TeamMember = new HashSet<TeamMember>();
        }

        public long TeamId { get; set; }
        public string Owner { get; set; }
        public string TeamName { get; set; }

        public Member OwnerNavigation { get; set; }
        public ICollection<PrivateTalkTeamReceiver> PrivateTalkTeamReceiver { get; set; }
        public ICollection<TeamMember> TeamMember { get; set; }
    }
}

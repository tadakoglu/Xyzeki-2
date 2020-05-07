using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace XYZToDo.Models
{
    public partial class PrivateTalkTeamReceiver
    {
        public long PrivateTalkTeamReceiverId { get; set; }
        public long PrivateTalkId { get; set; }
        public long TeamId { get; set; }

        [JsonIgnore]
        public PrivateTalk PrivateTalk { get; set; }
        [JsonIgnore]
        public Team Team { get; set; }
    }
}

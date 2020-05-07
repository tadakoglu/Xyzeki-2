using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace XYZToDo.Models
{
    public partial class PrivateTalkLastSeen
    {
        public long PrivateTalkLastSeenId { get; set; }
        public long PrivateTalkId { get; set; }
        public string Visitor { get; set; }
        public DateTimeOffset LastSeen { get; set; }

        [JsonIgnore]
        public PrivateTalk PrivateTalk { get; set; }
        [JsonIgnore]
        public Member VisitorNavigation { get; set; }
    }
}

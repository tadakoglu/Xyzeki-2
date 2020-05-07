using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace XYZToDo.Models
{
    public partial class PrivateTalk
    {
        public PrivateTalk()
        {
            PrivateTalkLastSeen = new HashSet<PrivateTalkLastSeen>();
            PrivateTalkMessage = new HashSet<PrivateTalkMessage>();
            PrivateTalkReceiver = new HashSet<PrivateTalkReceiver>();
            PrivateTalkTeamReceiver = new HashSet<PrivateTalkTeamReceiver>();
        }

        public string Owner { get; set; }
        public long PrivateTalkId { get; set; }
        public string Sender { get; set; }
        public string Thread { get; set; }
        public DateTimeOffset? DateTimeCreated { get; set; }
        [JsonIgnore]
        public Member OwnerNavigation { get; set; }
        [JsonIgnore]
        public Member SenderNavigation { get; set; }
        [JsonIgnore]
        public ICollection<PrivateTalkLastSeen> PrivateTalkLastSeen { get; set; }
        [JsonIgnore]
        public ICollection<PrivateTalkMessage> PrivateTalkMessage { get; set; }
        [JsonIgnore]
        public ICollection<PrivateTalkReceiver> PrivateTalkReceiver { get; set; }
        [JsonIgnore]
        public ICollection<PrivateTalkTeamReceiver> PrivateTalkTeamReceiver { get; set; }
    }
}

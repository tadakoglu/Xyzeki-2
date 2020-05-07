using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace XYZToDo.Models
{
    public partial class PrivateTalkReceiver
    {
        public long PrivateTalkReceiverId { get; set; }
        public long PrivateTalkId { get; set; }
        public string Receiver { get; set; }
        [JsonIgnore]
        public PrivateTalk PrivateTalk { get; set; }
        [JsonIgnore]
        public Member ReceiverNavigation { get; set; }
    }
}

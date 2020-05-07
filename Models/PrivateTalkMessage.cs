using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace XYZToDo.Models
{
    public partial class PrivateTalkMessage
    {
        public long PrivateTalkId { get; set; }
        public long MessageId { get; set; }
        public string Sender { get; set; }
        public string Message { get; set; }
        public DateTimeOffset DateTimeSent { get; set; }

        [JsonIgnore]
        public PrivateTalk PrivateTalk { get; set; }
        [JsonIgnore]
        public Member SenderNavigation { get; set; }
    }
}

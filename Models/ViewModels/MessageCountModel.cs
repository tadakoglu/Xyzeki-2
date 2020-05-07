using System;

namespace XYZToDo.Models.ViewModels
{
    public class MessageCountModel
    {
        public long PrivateTalkId { get; set; }
        public int MessagesCount { get; set; }

        public DateTimeOffset OrderingCriterion { get; set; }
    }
}

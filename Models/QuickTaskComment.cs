﻿using System;
using System.Collections.Generic;

namespace XYZToDo.Models
{
    public partial class QuickTaskComment
    {
        public long MessageId { get; set; }
        public long TaskId { get; set; }
        public string Sender { get; set; }
        public string Message { get; set; }
        public DateTimeOffset DateTimeSent { get; set; }
        public string Color { get; set; }

        public Member SenderNavigation { get; set; }
        public QuickTask Task { get; set; }
    }
}

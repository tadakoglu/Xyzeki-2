using System;
using System.Collections.Generic;

namespace XYZToDo.Models
{
    public partial class ForgotPassword
    {
        public Guid SecurityCode { get; set; }
        public string Username { get; set; }
        public DateTimeOffset LastValid { get; set; }

        public Member UsernameNavigation { get; set; }
    }
}

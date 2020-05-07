using System;
using System.Collections.Generic;

namespace XYZToDo.Models
{
    public partial class ConnectionContainer
    {
        public string Username { get; set; }
        public string ConnectionId { get; set; }
        public string UserAgent { get; set; }
        public bool Connected { get; set; }

        public Member UsernameNavigation { get; set; }
    }
}

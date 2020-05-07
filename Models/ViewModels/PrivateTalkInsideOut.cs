using System;

namespace XYZToDo.Models.ViewModels
{
    public class PrivateTalkInsideOut
    {
        public bool My { get; set; }
        public PrivateTalk PrivateTalk { get; set; }
        public MessageCountModel MessageCountModel { get; set; }
        public PrivateTalkReceiver[] Receivers { get; set; }
        public PrivateTalkTeamReceiver[] TeamReceivers { get; set; }
    }
}

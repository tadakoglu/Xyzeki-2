using System;
using System.Linq;
using XYZToDo.Models.ViewModels;

namespace XYZToDo.Models.Abstract
{
    public interface IPrivateTalkTeamReceiverRepository
    {
        IQueryable<PrivateTalkTeamReceiver> PrivateTalkTeamReceivers { get; }

        //Viewing methods  will return NULL there is/are not such object/objects otherwise object/objects 
        PrivateTalkTeamReceiver[] GetMyPrivateTalkTeamReceivers(string sender, int pageNo, string searchValue, int pageSize);

        PrivateTalkTeamReceiver[] GetPrivateTalkTeamReceivers(long privateTalkId);
        PrivateTalkTeamReceiver GetPrivateTalkTeamReceiver(long privateTalkTeamReceiverId); // Returns null or object
        ReturnModel AddPrivateTalkTeamReceiver(PrivateTalkTeamReceiver privateTalkTeamReceiver); // Return -1 if error has occured, otherwise 0(OK),
        ReturnModel AddPrivateTalkTeamReceivers(PrivateTalkTeamReceiver[] privateTalkTeamReceiver);

        PrivateTalkTeamReceiver DeletePrivateTalkTeamReceiver(long privateTalkTeamReceiverId); //Return -1 if error has occurred, otherwise 0(OK)
        PrivateTalkTeamReceiver[] DeletePrivateTalkTeamReceivers(long privateTalkId);
    }
}

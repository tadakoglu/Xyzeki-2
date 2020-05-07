using System;
using System.Linq;
using XYZToDo.Models.ViewModels;

namespace XYZToDo.Models.Abstract
{
    public interface IPrivateTalkReceiverRepository
    {
        IQueryable<PrivateTalkReceiver> PrivateTalkReceivers { get; } // PrivateTalkReceivers query api

        //Viewing methods  will return NULL there is/are not such object/objects otherwise object/objects
        PrivateTalkReceiver[] GetMyPrivateTalkReceivers(string sender, int pageNo, string searchValue, int pageSize);
        PrivateTalkReceiver[] GetPrivateTalkReceivers(long privateTalkId);
        PrivateTalkReceiver GetPrivateTalkReceiver(long privateTalkReceiverId); // Returns null or object
        ReturnModel AddPrivateTalkReceiver(PrivateTalkReceiver privateTalkReceiver); // Return -1 if error has occured, otherwise 0(OK),
        ReturnModel AddPrivateTalkReceivers(PrivateTalkReceiver[] privateTalkReceivers);

        PrivateTalkReceiver DeletePrivateTalkReceiver(long privateTalkReceiverId); //Return -1 if error has occurred, otherwise 0(OK)
        PrivateTalkReceiver[] DeletePrivateTalkReceivers(long privateTalkId);

    }
}

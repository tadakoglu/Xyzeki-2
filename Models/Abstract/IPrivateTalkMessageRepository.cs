using System;
using System.Linq;
using XYZToDo.Models.ViewModels;

namespace XYZToDo.Models.Abstract
{
    public interface IPrivateTalkMessageRepository
    {
        IQueryable<PrivateTalkMessage> PrivateTalkMessages { get; } // PrivateTalkMessages query api

        //Viewing methods  will return NULL there is/are not such object/objects otherwise object/objects
        PrivateTalkMessage[] GetPrivateTalkMessages(long privateTalkId, int pageNo, int pageSize);
        PrivateTalkMessage GetPrivateTalkMessage(long messageId); // Returns null or object

        ReturnModel AddPrivateTalkMessage(PrivateTalkMessage privateTalkMessage); // Return -1 if error has occured, otherwise 0(OK),
        PrivateTalkMessage DeletePrivateTalkMessage(long messageId); //Return -1 if error has occurred, otherwise 0(OK)

    }
}

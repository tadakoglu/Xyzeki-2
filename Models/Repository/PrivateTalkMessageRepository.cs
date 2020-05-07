using System;
using System.Linq;
using XYZToDo.Infrastructure;
using XYZToDo.Models.Abstract;
using XYZToDo.Models.DatabasePersistanceLayer;
using XYZToDo.Models.ViewModels;

namespace XYZToDo.Models.Repository
{
    public class PrivateTalkMessageRepository : IPrivateTalkMessageRepository
    {
        XYZToDoSQLDbContext context;
        public PrivateTalkMessageRepository(XYZToDoSQLDbContext context)
        {
            this.context = context;
        }

        public IQueryable<PrivateTalkMessage> PrivateTalkMessages => context.PrivateTalkMessage;


        public PrivateTalkMessage[] GetPrivateTalkMessages(long privateTalkId, int pageNo = 1, int pageSize=50)  // Returns null or objects
        {
            //11.09.2019, 10.09.2019, 9.09.2019 x3 x2 x1 
            PrivateTalkMessage[] msgs = PrivateTalkMessages.Where(pt => pt.PrivateTalkId == privateTalkId)?.OrderByDescending(ptm => ptm.DateTimeSent).ToArray();

            if (msgs != null) // min 1
            {
                int totalCount = msgs.Count();
                // int pageSize = 12;
                int noOfPages = (int)Math.Ceiling((decimal)totalCount / pageSize); // sayfa sayısı: 4, sayfa 1
                if (pageNo > noOfPages)
                    return null;

                //int pageNoFromEnd = noOfPages - pageNo + 1;  // 4 - 1 + 1 = 4
                msgs = msgs.Skip((pageNo - 1) * pageSize).Take(pageSize).OrderBy(ptm => ptm.DateTimeSent).ToArray(); // 1-10 ürünlerini 1. sayfa olarak al, sonra 11-20 ürünleri 2. sayfa
            }

            return msgs;
        }

        //  public PrivateTalkMessage[] GetPrivateTalkMessages(long privateTalkId, int pageNo = 1)  // Returns null or objects
        //         {
        //             PrivateTalkMessage[] msgs = PrivateTalkMessages.Where(pt => pt.PrivateTalkId == privateTalkId)?.OrderByDescending(ptm => ptm.DateTimeSent).ToArray();
        //             Bugün, Dün, Geçmiş

        //             if (msgs != null) // min 1
        //             {
        //                 int totalCount = msgs.Count();
        //                 int pageSize = 12;
        //                 int noOfPages = (int)Math.Ceiling((decimal)totalCount / pageSize); // sayfa sayısı: 4, sayfa 1
        //                 if (pageNo > noOfPages)
        //                     return null;

        //                 int pageNoFromEnd = noOfPages - pageNo + 1;  // 4 - 1 + 1 = 4
        //                 msgs = msgs.Skip((pageNoFromEnd - 1) * pageSize).Take(pageSize).ToArray(); // 1-10 ürünlerini 1. sayfa olarak al, sonra 11-20 ürünleri 2. sayfa
        //             }

        //             return msgs;
        //         }
        public PrivateTalkMessage GetPrivateTalkMessage(long messageId)
        {
            return PrivateTalkMessages.Where(ptm => ptm.MessageId == messageId).FirstOrDefault();
        }

        public ReturnModel AddPrivateTalkMessage(PrivateTalkMessage privateTalkMessage) // Return -1 for any errors otherwise 0
        {
            try
            {
                context.PrivateTalkMessage.Add(privateTalkMessage);
                context.SaveChanges();
            }
            catch { return new ReturnModel { ErrorCode = ErrorCodes.DatabaseError }; }
            return new ReturnModel { ErrorCode = ErrorCodes.OK, ReturnedId = privateTalkMessage.MessageId };  // Return TaskId(autoset from identity)
        }

        public PrivateTalkMessage DeletePrivateTalkMessage(long messageId) // Return -1  for any errors otherwise 0
        {
            PrivateTalkMessage ptMessage = context.PrivateTalkMessage.Where(ptm => ptm.MessageId == messageId).FirstOrDefault();
            if (ptMessage != null)
            {
                context.PrivateTalkMessage.Remove(ptMessage);
                context.SaveChanges();
            }
            return ptMessage;

        }

    }
}

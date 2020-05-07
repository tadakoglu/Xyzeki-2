using System;
using System.Linq;
using XYZToDo.Infrastructure;
using XYZToDo.Models.Abstract;
using XYZToDo.Models.DatabasePersistanceLayer;
using XYZToDo.Models.ViewModels;

namespace XYZToDo.Models.Repository
{
    public class PrivateTalkTeamReceiverRepository : IPrivateTalkTeamReceiverRepository
    {
        XYZToDoSQLDbContext context;
        public PrivateTalkTeamReceiverRepository(XYZToDoSQLDbContext context)
        {
            this.context = context;
        }

        public IQueryable<PrivateTalkTeamReceiver> PrivateTalkTeamReceivers => context.PrivateTalkTeamReceiver;

        public IQueryable<PrivateTalkReceiver> PrivateTalkReceivers => context.PrivateTalkReceiver;

        public IQueryable<PrivateTalk> PrivateTalks => context.PrivateTalk;

        public PrivateTalkTeamReceiver[] GetMyPrivateTalkTeamReceivers(string sender, int pageNo, string searchValue, int pageSize = 50) // Returns null or objects,  giden kutusu
        {
            var context2 = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext();

            // int pageSize = 12;
            PrivateTalkTeamReceiver[] ptr = null;
            try
            {
                ptr = PrivateTalks.Where(bt => bt.Sender == sender)
                .OrderByDescending(pt => pt.DateTimeCreated).
                 Where(bt => searchValue == "undefined" || (bt.Thread.Contains(searchValue) || bt.Sender.Contains(searchValue))).Skip((pageNo - 1) * pageSize).Take(pageSize).SelectMany(pt => pt.PrivateTalkTeamReceiver).ToArray();

                context2.Dispose();
            }
            catch (System.Exception)
            {
            }
            return ptr;
        }

        // DateTimeOffset PTOrderingCriterion(long privateTalkId, string thisMember, XYZToDoSQLDbContext context)
        // {
        //     PrivateTalk pTalk = context.PrivateTalk.Where(pt => pt.PrivateTalkId == privateTalkId).FirstOrDefault();
        //     DateTimeOffset orderingCriterion = (context.PrivateTalkMessage.Where(ptm => ptm.PrivateTalkId == privateTalkId && ptm.Sender != thisMember).OrderByDescending(ptm => ptm.DateTimeSent)?.FirstOrDefault()?.DateTimeSent ?? pTalk.DateTimeCreated) ?? new DateTimeOffset(DateTime.MinValue, TimeSpan.Zero);
        //     return orderingCriterion;
        // }


        public PrivateTalkTeamReceiver[] GetPrivateTalkTeamReceivers(long privateTalkId)  // Returns null or objects
        {
            return PrivateTalkTeamReceivers.Where(pt => pt.PrivateTalkId == privateTalkId)?.ToArray();
        }
        public PrivateTalkTeamReceiver GetPrivateTalkTeamReceiver(long privateTalkTeamReceiverId)
        {
            return PrivateTalkTeamReceivers.Where(ptr => ptr.PrivateTalkTeamReceiverId == privateTalkTeamReceiverId).FirstOrDefault();
        }

        public ReturnModel AddPrivateTalkTeamReceiver(PrivateTalkTeamReceiver privateTalkTeamReceiver) // Return -1 for any errors otherwise 0
        {
            try
            {
                context.PrivateTalkTeamReceiver.Add(privateTalkTeamReceiver);
                context.SaveChanges();
            }
            catch { return new ReturnModel { ErrorCode = ErrorCodes.DatabaseError }; }
            return new ReturnModel { ErrorCode = ErrorCodes.OK, ReturnedId = privateTalkTeamReceiver.PrivateTalkTeamReceiverId };  // Return TaskId(autoset from identity)
        }

        public ReturnModel AddPrivateTalkTeamReceivers(PrivateTalkTeamReceiver[] privateTalkTeamReceivers) // Return -1 for any errors otherwise 0
        {
            try
            {
                context.PrivateTalkTeamReceiver.AddRange(privateTalkTeamReceivers);
                context.SaveChanges();
            }
            catch { return new ReturnModel { ErrorCode = ErrorCodes.DatabaseError }; }
            return new ReturnModel { ErrorCode = ErrorCodes.OK };
        }

        public PrivateTalkTeamReceiver DeletePrivateTalkTeamReceiver(long privateTalkTeamReceiverId) // Return -1  for any errors otherwise 0
        {
            PrivateTalkTeamReceiver ptReceiver = context.PrivateTalkTeamReceiver.Where(ptm => ptm.PrivateTalkTeamReceiverId == privateTalkTeamReceiverId).FirstOrDefault();
            if (ptReceiver != null)
            {
                context.PrivateTalkTeamReceiver.Remove(ptReceiver);
                context.SaveChanges();
            }
            return ptReceiver;

        }
        public PrivateTalkTeamReceiver[] DeletePrivateTalkTeamReceivers(long privateTalkId) // Return -1  for any errors otherwise 0
        {
            PrivateTalkTeamReceiver[] ptReceivers = context.PrivateTalkTeamReceiver.Where(ptm => ptm.PrivateTalkId == privateTalkId).ToArray();
            if (ptReceivers != null)
            {
                context.PrivateTalkTeamReceiver.RemoveRange(ptReceivers);
                context.SaveChanges();
            }
            return ptReceivers;

        }


    }
}

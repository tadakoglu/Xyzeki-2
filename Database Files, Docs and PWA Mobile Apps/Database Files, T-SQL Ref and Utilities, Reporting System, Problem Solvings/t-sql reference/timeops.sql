Select dateadd(day, 10, getdate()) as after10daysdatetimefromcurrentdatetime 

Select datediff(MINUTE,  dateadd(day, 5, getdate()),GETDATE()) as 
differencehoursbetween20151116and20151111 

select GETDATE()

SELECT CONVERT(VARCHAR(19),GETDATE()) 
SELECT CONVERT(VARCHAR(10),GETDATE(),10) 
SELECT CONVERT(VARCHAR(10),GETDATE(),105)

select CONVERT(VARCHAR(10),Date,127) from QuickTask

select DATEDIFF(MINUTE, CONVERT(VARCHAR(10),Date,127), GETDATE()) from QuickTask


select SWITCHOFFSET(cast('2008-12-19 17:30:09.0000000 +11:00' as datetimeoffset),'+00:00')

select cast('2008-12-19 17:30:09.0000000 +11:00' as datetimeoffset)
select cast(getdate() as datetimeoffset)

select SWITCHOFFSET(getdate(),'+03:00')

select SYSUTCDATETIME()

select SWITCHOFFSET(SYSUTCDATETIME(),'+03:00') --TR

 --select SWITCHOFFSET(DATE, '+03:00'), SWITCHOFFSET(cast( SYSUTCDATETIME() as datetimeoffset(0)),'+03:00') from QuickTask  where AssignedTo = 'tadakoglu'

	 --select DATEDIFF(day, SWITCHOFFSET(DATE, '+03:00'), SWITCHOFFSET(cast( SYSUTCDATETIME() as datetimeoffset(0)),'+03:00')) from QuickTask  where AssignedTo = 'tadakoglu'
declare @createdon datetimeoffset
set @createdon = '2008-12-19 17:30:09.1234567 +11:00'

select CONVERT(datetime2, @createdon, 1)
--Output: 2008-12-19 06:30:09.12

select convert(datetimeoffset,CONVERT(datetime2, @createdon, 1))

--Output: 2008-12-19 06:30:09.1234567 +00:00

select GETUTCDATE()

SELECT DATENAME(MONTH, '12:10:30.123')   -- JANUARY

SELECT DATENAME(MONTH, GETDATE())   -- 

SELECT DAY ( GETDATE()) --6

DECLARE @cnt_total INT = 22;
DECLARE @cnt INT = 0;

WHILE @cnt < @cnt_total
BEGIN
 
   DECLARE @someVar INT = 0;

   --...statements...
   
   SET @cnt = @cnt + 1;
END;


---------------

DECLARE @cnt2 INT = 0;
WHILE @cnt2 < 10
BEGIN
   PRINT 'Inside simulated FOR LOOP on TechOnTheNet.com' + ' ' + convert(nvarchar(max),  @cnt2);
   SET @cnt2 = @cnt2 + 1;
END;

PRINT 'Done simulated FOR LOOP on TechOnTheNet.com';
GO
------------------

DECLARE @site_value INT;
SET @site_value = 0;

WHILE @site_value <= 10
BEGIN
   PRINT 'Inside WHILE LOOP on TechOnTheNet.com';
   SET @site_value = @site_value + 1;
END;

PRINT 'Done WHILE LOOP on TechOnTheNet.com';
GO



------

select top 1000 TableID
into #ControlTable 
from dbo.table
where StatusID = 7

declare @TableID int

while exists (select * from #ControlTable)
begin

    select top 1 @TableID = TableID
    from #ControlTable
    order by TableID asc

    -- Do something with your TableID

    delete #ControlTable
    where TableID = @TableID

end

drop table #ControlTable

------------

select top 1000 TableID
into #ControlTable 
from dbo.table
where StatusID = 7

declare @TableID int

while exists (select * from #ControlTable)
begin

    select @TableID = (select top 1 TableID
                       from #ControlTable
                       order by TableID asc)

    -- Do something with your TableID

    delete #ControlTable
    where TableID = @TableID

end

drop table #ControlTable
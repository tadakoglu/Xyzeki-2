


IF object_id('getDatePartOf', 'FN') IS NOT NULL
BEGIN
    DROP FUNCTION [dbo].[getDatePartOf]
END
GO

CREATE FUNCTION getDatePartOf (@DATE datetimeoffset)  
RETURNS datetimeoffset  
AS  
BEGIN  
RETURN TODATETIMEOFFSET(CAST(@DATE AS date), DATEPART(tz,@DATE)) -- set hours to 0
END
GO

IF OBJECT_ID('getDeadlineHTML', 'P') IS NOT NULL  
    DROP PROCEDURE [dbo].[getDeadlineHTML]
GO  
CREATE PROCEDURE getDeadlineHTML  
@Username nvarchar(50),  
@Total_To_Deadline int OUTPUT,
@TotalLate_To_Deadline int OUTPUT,
@HTMLVALUE nvarchar(max) OUTPUT 
AS  
	DECLARE @FRONTENDSERVER NVARCHAR(MAX) = 'http://www.xyzeki.com'; --that will be used to connect to links, images etc..
	DECLARE @NOW_AS_DATE DATETIMEOFFSET = SWITCHOFFSET(cast( SYSUTCDATETIME() as datetimeoffset(0)),'+03:00')
	
	DECLARE @NOW DATETIMEOFFSET = SWITCHOFFSET(cast( SYSUTCDATETIME() as datetimeoffset(0)),'+03:00')

	SET @NOW_AS_DATE = dbo.getDatePartOf(@NOW)

	 -- CALCULATING NUMBERS
	 DECLARE @NoOfQT_To_Deadline int = 0;
	 DECLARE @NoOfPT_To_Deadline int = 0;

	 --DECLARE @Total_To_Deadline int =0; 


	 select @NoOfQT_To_Deadline=COUNT(*) from QuickTask where AssignedTo = @Username AND (Completedby IS NULL OR Completedby='False') AND (Archived IS NULL OR Archived ='False')
	 AND DateDiff(DD,dbo.getDatePartOf(SWITCHOFFSET(Date, '+03:00')), @NOW_AS_DATE)=0
	 
	 select @NoOfPT_To_Deadline=COUNT(*)  from ProjectTask INNER JOIN Project ON ProjectTask.ProjectId = Project.ProjectId WHERE (Project.Privacy = 0 OR Project.Privacy = 2) AND AssignedTo = @Username AND (IsCompleted='False' OR IsCompleted IS NULL) AND (Archived IS NULL OR Archived ='False')  
	 AND DateDiff(DD,dbo.getDatePartOf(SWITCHOFFSET(Deadline, '+03:00')),@NOW_AS_DATE )=0
     
	 SET @Total_To_Deadline = @NoOfQT_To_Deadline + @NoOfPT_To_Deadline

	 DECLARE @NoOfQTLATE_To_Deadline int = 0;
	 DECLARE @NoOfPTLATE_To_Deadline int = 0;
	 
	 --DECLARE @TotalLATE_To_Deadline int =0;

	 select @NoOfQTLATE_To_Deadline=COUNT(*) from QuickTask where AssignedTo = @Username AND (Completedby IS NULL OR Completedby='False') AND (Archived IS NULL OR Archived ='False')
	 AND DateDiff(MINUTE,SWITCHOFFSET(Date, '+03:00'),@NOW ) > 0


	 select @NoOfPTLATE_To_Deadline=COUNT(*)  from ProjectTask INNER JOIN Project ON ProjectTask.ProjectId = Project.ProjectId WHERE (Project.Privacy = 0 OR Project.Privacy = 2) AND AssignedTo = @Username AND (IsCompleted='False' OR IsCompleted IS NULL) AND (Archived IS NULL OR Archived ='False') 
	 AND DateDiff(MINUTE,SWITCHOFFSET(Deadline, '+03:00'),@NOW ) > 0

	 SET @TotalLATE_To_Deadline = @NoOfQTLATE_To_Deadline + @NoOfPTLATE_To_Deadline
	 

	 IF(@Total_To_Deadline + @TotalLATE_To_Deadline= 0)
	 BEGIN
	  return;
	 END


	 DECLARE @MSG_NO_OF_TODO_3 NVARCHAR(MAX) = N'<tr><td style="padding-left:10px; padding-right:10px"><b>Ayrýca</b>, bugün için teslim edilmesi planlanmýþ 
	 toplam <span style="color:rgb(46, 45, 45);font-family:arial,helvetica,sans-serif;text-align:left; 
        font-size:18px;">' + ISNULL(CAST( @Total_To_Deadline as nvarchar(5)),'') + '</span> adet göreviniz bulunmaktadýr.</td></tr>'

	 


	 DECLARE @MSG_NO_OF_QT_4 NVARCHAR(MAX) = N'<tr><td
        style="padding-left:10px; padding-right:10px; background-color:#fefefe; border-bottom: 1px solid #e9e9e9; font-weight:500">
        Görev: <span style="color:rgb(46, 45, 45);font-family:arial,helvetica,sans-serif;text-align:left; 
        font-size:18px;">' + ISNULL(CAST( @NoOfQT_To_Deadline as nvarchar(5)),'') + '</span></td></tr>'

	  

	 DECLARE @MSG_NO_OF_PT_5 NVARCHAR(MAX) = N'<tr><td
        style="padding-left:10px; padding-right:10px;; background-color:#fefefe; border-bottom: 1px solid #e9e9e9; font-weight:500">
        Proje Görevi: <span style="color:rgb(46, 45, 45);font-family:arial,helvetica,sans-serif;text-align:left; 
        font-size:18px;">' + ISNULL(CAST( @NoOfPT_To_Deadline as nvarchar(5)),'') + '</span></td></tr>'


	  


	 DECLARE @MSG_TODAY_6 NVARCHAR(MAX) = N'<tr><td style="padding-left:10px; padding-right:10px;; color:rgb(46, 45, 45);font-family:arial,helvetica,sans-serif;text-align:left; 
      font-size:18px; font-weight:500"">Bugün  </td></tr>'
	 

	 IF(@Total_To_Deadline = 0)
	 SET @MSG_TODAY_6 =  N'';
	 DECLARE @MSG_LINES_7 NVARCHAR(MAX) = N''




	 -- LOOP FOR QUICK TASKS
	 IF OBJECT_ID('tempdb..#XYZQTDEADLINE','u') IS NOT NULL
	 DROP TABLE #XYZQTDEADLINE
	 create table #XYZQTDEADLINE(TaskTitle nvarchar(MAX) not null, TaskId bigint not null)
	 INSERT into #XYZQTDEADLINE select TaskTitle,TaskId from QuickTask where AssignedTo = @Username AND (Completedby IS NULL OR Completedby='False') AND (Archived IS NULL OR Archived ='False')
	  AND DateDiff(DD,dbo.getDatePartOf(SWITCHOFFSET(Date, '+03:00')),@NOW_AS_DATE )=0 order by TaskTitle ASC
	 
	 declare @TaskTitle nvarchar(MAX)	
	 declare @TaskId bigint	

	 while exists (select * from  #XYZQTDEADLINE)
	 begin
		 select top 1 @TaskTitle = TaskTitle  from #XYZQTDEADLINE
		 select top 1 @TaskId = TaskId  from #XYZQTDEADLINE
		 --do sth with task title
		 PRINT 'Görev:' + @TaskTitle
		 SET @MSG_LINES_7 = @MSG_LINES_7 + '<tr><td style=" padding-left:15px; padding-right:15px; padding-bottom: 12px; padding-top:12px;
        background-color:#fefefe; border-bottom: 1px solid #e9e9e9; font-weight:400">

        ' + @TaskTitle + '</td></tr>'

		

		 delete from #XYZQTDEADLINE  where TaskId = @TaskId
	 end
	 drop table #XYZQTDEADLINE

	 -- END OF LOOP FOR QUICK TASKS




	 
	 -- LOOP FOR PROJECT TASKS
	  
	 IF OBJECT_ID('tempdb..#XYZPTDEADLINE','u') IS NOT NULL
	 DROP TABLE #XYZPTDEADLINE
	 create table #XYZPTDEADLINE(TaskTitle nvarchar(MAX) not null, TaskId bigint not null, ProjectName nvarchar(MAX) not null)
	 INSERT into #XYZPTDEADLINE select TaskTitle,TaskId, ProjectName from ProjectTask INNER JOIN Project ON ProjectTask.ProjectId = Project.ProjectId WHERE (Project.Privacy = 0 OR Project.Privacy = 2) AND AssignedTo =  @Username AND (IsCompleted='False' OR IsCompleted IS NULL) AND (Archived IS NULL OR Archived ='False') 
	 AND DateDiff(DD,dbo.getDatePartOf(SWITCHOFFSET(Deadline, '+03:00')),@NOW_AS_DATE )= 0  order by TaskTitle ASC
	 
	 declare @TaskTitleP nvarchar(MAX)	
	 declare @TaskIdP bigint	
	 declare @ProjectNameP nvarchar(MAX)	
	 while exists (select * from  #XYZPTDEADLINE)
	 begin
		 select top 1 @TaskTitleP = TaskTitle  from #XYZPTDEADLINE
		 select top 1 @TaskIdP = TaskId  from #XYZPTDEADLINE		
		 select top 1 @ProjectNameP = ProjectName  from #XYZPTDEADLINE --declare @ProjectNameP nvarchar(MAX)	

		 --do sth with task title
		 PRINT 'Proje Görevi:' + @TaskTitleP
		 SET @MSG_LINES_7 = @MSG_LINES_7 + '<tr><td
        style="padding-left: 15px; padding-right: 15px;  padding-bottom: 12px; padding-top:12px; background-color:#fefefe; border-bottom: 1px solid #e9e9e9;  font-weight:400">
        ' + @TaskTitleP + ', <span style="background-color:#303030; color:white; border-radius: 2px; padding:3px">' + @ProjectNameP + '</span></td></tr'

		  



		 delete from #XYZPTDEADLINE  where TaskId = @TaskIdP
	 end
	 
	 drop table #XYZPTDEADLINE
	 

	  -- END OF LOOP FOR PROJECT TASKS

	 PRINT 'Gecikmiþ(Henüz teslim edilmemiþ), ' + CAST( @TotalLATE_To_Deadline as nvarchar(5)) + ')'

	 DECLARE @EMTPY_L NVARCHAR(MAX) = N'<tr><td>&nbsp;</td></tr>';

	 SET @MSG_LINES_7 = @MSG_LINES_7 + @EMTPY_L + '<tr><td style="padding-left:10px; padding-right:10px;; color:#E62E2D;font-family:arial,helvetica,sans-serif;text-align:left; 
      font-size:18px; font-weight:500">Gecikmiþ(Henüz teslim edilmemiþ), ' + ISNULL(CAST( @TotalLATE_To_Deadline as nvarchar(5)),'') + '</td></tr>'


	 -- LOOP FOR QUICK TASKS LATE
	 IF OBJECT_ID('tempdb..#XYZQTLATEDEADLINE','u') IS NOT NULL
	 DROP TABLE #XYZQTLATEDEADLINE
	 create table #XYZQTLATEDEADLINE(TaskTitle nvarchar(MAX) not null, TaskId bigint not null)
	 INSERT into #XYZQTLATEDEADLINE select TaskTitle,TaskId from QuickTask where AssignedTo = @Username AND (Completedby IS NULL OR Completedby='False') AND (Archived IS NULL OR Archived ='False') 
	 AND  DateDiff(MINUTE,SWITCHOFFSET(Date, '+03:00'),@NOW ) > 0 order by TaskTitle ASC
		
	 declare @TaskTitleQTLATE nvarchar(MAX)	
	 declare @TaskIdQTLATE  bigint	

	 while exists (select * from  #XYZQTLATEDEADLINE)
	 begin
		 select top 1 @TaskTitleQTLATE = TaskTitle  from #XYZQTLATEDEADLINE
		 select top 1 @TaskIdQTLATE = TaskId  from #XYZQTLATEDEADLINE
		 --do sth with task title
		 PRINT @TaskTitleQTLATE
		 SET @MSG_LINES_7 = @MSG_LINES_7 + '<tr><td
        style="padding-left: 15px; padding-right: 15px;  padding-bottom: 12px; padding-top:12px; background-color:#fefefe; 
		border-bottom: 1px solid #e9e9e9; font-weight:400"><img src="' + @FRONTENDSERVER + '/assets/untickEmail2.png" style="height:25px"> ' + @TaskTitleQTLATE + '</td></tr>'


		

		 delete from #XYZQTLATEDEADLINE  where TaskId = @TaskIdQTLATE
	 end
	 drop table #XYZQTLATEDEADLINE

	 -- END OF LOOP FOR QUICK TASKS LATE

	  -- LOOP FOR PROJECT TASKS LATE


	 IF OBJECT_ID('tempdb..#XYZPTLATEDEADLINE','u') IS NOT NULL
	 DROP TABLE #XYZPTLATEDEADLINE
	 create table #XYZPTLATEDEADLINE(TaskTitle nvarchar(MAX) not null, TaskId bigint not null, ProjectName nvarchar(MAX) not null)
	 INSERT into #XYZPTLATEDEADLINE select TaskTitle,TaskId,ProjectName from ProjectTask INNER JOIN Project ON ProjectTask.ProjectId = Project.ProjectId WHERE (Project.Privacy = 0 OR Project.Privacy = 2) AND AssignedTo =  @Username AND (IsCompleted='False' OR IsCompleted IS NULL)  AND (Archived IS NULL OR Archived ='False')  
	 AND  DateDiff(MINUTE,SWITCHOFFSET(Deadline, '+03:00'),@NOW ) > 0 order by TaskTitle ASC
	 
	 declare @TaskTitlePLATE nvarchar(MAX)	
	 declare @TaskIdPLATE bigint	
	 declare @ProjectNamePLATE nvarchar(MAX)

	 while exists (select * from  #XYZPTLATEDEADLINE)
	 begin
		 select top 1 @TaskTitlePLATE = TaskTitle  from #XYZPTLATEDEADLINE
		 select top 1 @TaskIdPLATE = TaskId  from #XYZPTLATEDEADLINE
		 select top 1 @ProjectNamePLATE = ProjectName  from #XYZPTLATEDEADLINE 	

		 --do sth with task title
		 PRINT @TaskTitlePLATE
		 SET @MSG_LINES_7 = @MSG_LINES_7 + '<tr><td
        style="padding-left: 15px; padding-right: 15px;  padding-bottom: 12px; padding-top:12px; background-color:#fefefe; border-bottom: 1px solid #e9e9e9;  font-weight:400"><img src="' + @FRONTENDSERVER + '/assets/untickEmail2.png" 
		style="height:25px"> ' + @TaskTitlePLATE + ', <span style="background-color:#303030; color:white; border-radius: 2px; padding:3px">' + @ProjectNamePLATE + '</span></td></tr>'

		    

		 delete from #XYZPTLATEDEADLINE  where TaskId = @TaskIdPLATE
	 end
	
	 drop table #XYZPTLATEDEADLINE
	 

	 -- END OF LOOP FOR PROJECT TASKS LATE

	 DECLARE @EMTPY_LINE NVARCHAR(MAX) = N'<tr><td>&nbsp;</td></tr>';

	 SET @HTMLVALUE =  N'' + @EMTPY_LINE + @MSG_NO_OF_TODO_3 + @MSG_NO_OF_QT_4 + @MSG_NO_OF_PT_5 + @EMTPY_LINE + @MSG_TODAY_6 + @MSG_LINES_7

--reference
--Before use, Database Mail must be enabled using the Database Mail Configuration Wizard
--https://docs.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-send-dbmail-transact-sql?view=sql-server-2017      
RETURN  
GO  



BEGIN TRY
    BEGIN TRANSACTION
	
	SET ROWCOUNT 0    
	USE XYZToDo
	DECLARE @FRONTENDSERVER NVARCHAR(MAX) = 'http://www.xyzeki.com'; --that will be used to connect to links, images etc..
	DECLARE @EMAIL_SUBJECT NVARCHAR(MAX) = N''; -- N means this is a UNICODED string
	DECLARE @EMAIL_RECIPIENTS  VARCHAR(MAX)
	DECLARE @EMAIL_BODY  NVARCHAR(MAX) = N''; -- N means this is a UNICODED string
	DECLARE @TABLE  NVARCHAR(MAX) = N''; -- N means this is a UNICODED string
	DECLARE @TABLE_LINES  NVARCHAR(MAX) = N''; -- N means this is a UNICODED string

	DECLARE @NOW_AS_DATE DATETIMEOFFSET = SWITCHOFFSET(cast( SYSUTCDATETIME() as datetimeoffset(0)),'+03:00')
	
	DECLARE @NOW DATETIMEOFFSET = SWITCHOFFSET(cast( SYSUTCDATETIME() as datetimeoffset(0)),'+03:00')

	SET @NOW_AS_DATE = dbo.getDatePartOf(@NOW)



	IF OBJECT_ID('tempdb..#XYZEmails','u') IS NOT NULL
	DROP TABLE #XYZEmails
	create table #XYZEmails( Name  nvarchar(25) not null,    Surname  nvarchar(25) not null,    Username nvarchar(20) not null,    Email nvarchar(50) not null,)
	insert into #XYZEmails select Name, Surname, dbo.Member.Username,Email from dbo.Member inner join dbo.MemberSetting on dbo.Member.Username=dbo.MemberSetting.Username
	where dbo.MemberSetting.AssignedToReporting=1 order by dbo.Member.Username asc
	
	declare @Name nvarchar(25)
	declare @Surname nvarchar(25)
	declare @Username nvarchar(20)
	declare @Email nvarchar(50)

	while exists (select * from  #XYZEmails)
	begin
	 select top 1 @Name = Name  from #XYZEmails
	 select top 1 @Surname = Surname  from #XYZEmails
	 select top 1 @Username = Username  from #XYZEmails
	 select top 1 @Email = Email  from #XYZEmails

	 SET @EMAIL_RECIPIENTS = @Email

	 -- CALCULATING NUMBERS
	 DECLARE @NoOfQT_To_Start int = 0;
	 DECLARE @NoOfPT_To_Start int = 0;

	 DECLARE @Total_To_Start int =0; 

	 select @NoOfQT_To_Start=COUNT(*) from QuickTask where AssignedTo = @Username AND (Completedby IS NULL OR Completedby='False') AND (Archived IS NULL OR Archived ='False')  AND (Status IS NULL OR Status = 'Bekliyor')
	 AND DateDiff(DD,dbo.getDatePartOf(SWITCHOFFSET(Start, '+03:00')), @NOW_AS_DATE)=0
	 
	 select @NoOfPT_To_Start=COUNT(*)  from ProjectTask INNER JOIN Project ON ProjectTask.ProjectId = Project.ProjectId WHERE (Project.Privacy = 0 OR Project.Privacy = 2) AND AssignedTo = @Username AND (IsCompleted='False' OR IsCompleted IS NULL) AND (Archived IS NULL OR Archived ='False')  AND (Status IS NULL OR Status = 'Bekliyor')
	 AND DateDiff(DD,dbo.getDatePartOf(SWITCHOFFSET(Start, '+03:00')),@NOW_AS_DATE )=0
     
	 SET @Total_To_Start = @NoOfQT_To_Start + @NoOfPT_To_Start

	 DECLARE @NoOfQTLATE_To_Start int = 0;
	 DECLARE @NoOfPTLATE_To_Start int = 0;
	 
	 DECLARE @TotalLATE_To_Start int =0;

	 select @NoOfQTLATE_To_Start=COUNT(*) from QuickTask where AssignedTo = @Username AND (Completedby IS NULL OR Completedby='False') AND (Archived IS NULL OR Archived ='False') AND (Status IS NULL OR Status = 'Bekliyor')
	 AND DateDiff(MINUTE,SWITCHOFFSET(Start, '+03:00'),@NOW ) > 0


	 select @NoOfPTLATE_To_Start=COUNT(*)  from ProjectTask INNER JOIN Project ON ProjectTask.ProjectId = Project.ProjectId WHERE (Project.Privacy = 0 OR Project.Privacy = 2) AND AssignedTo = @Username AND (IsCompleted='False' OR IsCompleted IS NULL) AND (Archived IS NULL OR Archived ='False')   AND (Status IS NULL OR Status = 'Bekliyor')
	 AND DateDiff(MINUTE,SWITCHOFFSET(Start, '+03:00'),@NOW ) > 0

	 SET @TotalLATE_To_Start = @NoOfQTLATE_To_Start + @NoOfPTLATE_To_Start
	 

	 DECLARE @Total_To_Deadline int = 0;
	 DECLARE @TotalLate_To_Deadline int = 0;
	 
	
	 DECLARE @MSG_LINES_7_5_DEADLINE NVARCHAR(MAX) = N''

	 EXEC dbo.getDeadlineHTML @Username, @Total_To_Deadline, @TotalLate_To_Deadline, @HTMLVALUE = @MSG_LINES_7_5_DEADLINE output

	 
	 IF(@Total_To_Start + @TotalLATE_To_Start + @Total_To_Deadline + @TotalLate_To_Deadline = 0) -- DON'T EMAIL THE MEMBER IF ALL IS DONE.
	 BEGIN
	  delete from #XYZEmails  where Username = @Username
	  CONTINUE
	 END

	 SET @EMAIL_SUBJECT = 'Xyzeki, Çalýþan Gün Planý, (Bugün baþlayan, '+ ISNULL(CAST( @Total_To_Start as nvarchar(5)),'') + ', Gecikmiþ(Henüz baþlanmamýþ) ' + ISNULL(CAST( @TotalLATE_To_Start as nvarchar(5)),'') + ')'
	 + ' (Bugün teslim edilecek, '+ ISNULL(CAST( @Total_To_Deadline as nvarchar(5)),'') + ', Gecikmiþ(Henüz teslim edilmemiþ) ' + ISNULL(CAST( @TotalLate_To_Deadline as nvarchar(5)),'') + ')'

	 DECLARE @MSG_LOGO_1 NVARCHAR(MAX) = N'<tr>  <td style="padding-left:10px; padding-right:10px">
        <a href="' + @FRONTENDSERVER + '"
        style=" color:black;  display: inline-block;         padding-top: 0.3125rem;          padding-bottom: 0.3125rem;       
         margin-right: 1rem;          font-size: 1.25rem; text-decoration: none;         white-space: nowrap; ">
        <img src="' + @FRONTENDSERVER + '/assets/logo.png" style="height: 30px;  vertical-align: middle; "><span style="vertical-align: middle;"> Xyzeki</span>
      </a>

      </td></tr>'


	 DECLARE @MSG_GREETING_2 NVARCHAR(MAX) = N'<tr><td style="padding-left:10px; padding-right:10px">Merhaba Deðerli ' + ISNULL(@Name,'') + ' ' + ISNULL(@Surname,'') + ',</td></tr>'


	 DECLARE @MSG_NO_OF_TODO_3 NVARCHAR(MAX) = N'<tr><td style="padding-left:10px; padding-right:10px">Bugün için planlanmýþ 
	 toplam <span style="color:rgb(46, 45, 45);font-family:arial,helvetica,sans-serif;text-align:left; 
        font-size:18px;">' + ISNULL(CAST( @Total_To_Start as nvarchar(5)),'') + '</span> adet yeni göreviniz bulunmaktadýr.</td></tr>'

	 


	 DECLARE @MSG_NO_OF_QT_4 NVARCHAR(MAX) = N'<tr><td
        style="padding-left:10px; padding-right:10px; background-color:#fefefe; border-bottom: 1px solid #e9e9e9; font-weight:500">
        Görev: <span style="color:rgb(46, 45, 45);font-family:arial,helvetica,sans-serif;text-align:left; 
        font-size:18px;">' + ISNULL(CAST( @NoOfQT_To_Start as nvarchar(5)),'') + '</span></td></tr>'

	  

	 DECLARE @MSG_NO_OF_PT_5 NVARCHAR(MAX) = N'<tr><td
        style="padding-left:10px; padding-right:10px;; background-color:#fefefe; border-bottom: 1px solid #e9e9e9; font-weight:500">
        Proje Görevi: <span style="color:rgb(46, 45, 45);font-family:arial,helvetica,sans-serif;text-align:left; 
        font-size:18px;">' + ISNULL(CAST( @NoOfPT_To_Start as nvarchar(5)),'') + '</span></td></tr>'


	  


	 DECLARE @MSG_TODAY_6 NVARCHAR(MAX) = N'<tr><td style="padding-left:10px; padding-right:10px;; color:rgb(46, 45, 45);font-family:arial,helvetica,sans-serif;text-align:left; 
      font-size:18px; font-weight:500"">Bugün  </td></tr>'

	 IF(@Total_To_Start = 0)
	 SET @MSG_TODAY_6 =  N'';

	 DECLARE @MSG_LINES_7 NVARCHAR(MAX) = N''




	 -- LOOP FOR QUICK TASKS
	 IF OBJECT_ID('tempdb..#XYZQT','u') IS NOT NULL
	 DROP TABLE #XYZQT
	 create table #XYZQT(TaskTitle nvarchar(MAX) not null, TaskId bigint not null)
	 INSERT into #XYZQT select TaskTitle,TaskId from QuickTask where AssignedTo = @Username AND (Completedby IS NULL OR Completedby='False') AND (Archived IS NULL OR Archived ='False')  AND (Status IS NULL OR Status = 'Bekliyor')
	  AND DateDiff(DD,dbo.getDatePartOf(SWITCHOFFSET(Start, '+03:00')),@NOW_AS_DATE )=0 order by TaskTitle ASC
	 
	 declare @TaskTitle nvarchar(MAX)	
	 declare @TaskId bigint	

	 while exists (select * from  #XYZQT)
	 begin
		 select top 1 @TaskTitle = TaskTitle  from #XYZQT
		 select top 1 @TaskId = TaskId  from #XYZQT
		 --do sth with task title
		 PRINT 'Görev:' + @TaskTitle
		 SET @MSG_LINES_7 = @MSG_LINES_7 + '<tr><td style=" padding-left:15px; padding-right:15px; padding-bottom: 12px; padding-top:12px;
        background-color:#fefefe; border-bottom: 1px solid #e9e9e9; font-weight:400">

        ' + @TaskTitle + '</td></tr>'

		

		 delete from #XYZQT  where TaskId = @TaskId
	 end
	 drop table #XYZQT

	 -- END OF LOOP FOR QUICK TASKS




	 
	 -- LOOP FOR PROJECT TASKS
	  
	 IF OBJECT_ID('tempdb..#XYZPT','u') IS NOT NULL
	 DROP TABLE #XYZPT
	 create table #XYZPT(TaskTitle nvarchar(MAX) not null, TaskId bigint not null, ProjectName nvarchar(MAX) not null)
	 INSERT into #XYZPT select TaskTitle,TaskId, ProjectName from ProjectTask INNER JOIN Project ON ProjectTask.ProjectId = Project.ProjectId WHERE (Project.Privacy = 0 OR Project.Privacy = 2) AND AssignedTo =  @Username AND (IsCompleted='False' OR IsCompleted IS NULL) AND (Archived IS NULL OR Archived ='False')  AND (Status IS NULL OR Status = 'Bekliyor')
	 AND DateDiff(DD,dbo.getDatePartOf(SWITCHOFFSET(Start, '+03:00')),@NOW_AS_DATE )= 0  order by TaskTitle ASC
	 
	 declare @TaskTitleP nvarchar(MAX)	
	 declare @TaskIdP bigint	
	 declare @ProjectNameP nvarchar(MAX)	

	 while exists (select * from  #XYZPT)
	 begin
		 select top 1 @TaskTitleP = TaskTitle  from #XYZPT
		 select top 1 @TaskIdP = TaskId  from #XYZPT
		 select top 1 @ProjectNameP = ProjectName  from #XYZPT --declare @ProjectNameP nvarchar(MAX)	

		 --do sth with task title
		 PRINT 'Proje Görevi:' + @TaskTitleP
		 SET @MSG_LINES_7 = @MSG_LINES_7 + '<tr><td
        style="padding-left: 15px; padding-right: 15px;  padding-bottom: 12px; padding-top:12px; background-color:#fefefe; border-bottom: 1px solid #e9e9e9;  font-weight:400">
        ' + @TaskTitleP + ', <span style="background-color:#303030; color:white; border-radius: 2px; padding:3px">' + @ProjectNameP + '</span></td></tr'

		  



		 delete from #XYZPT  where TaskId = @TaskIdP
	 end
	 
	 drop table #XYZPT
	 

	  -- END OF LOOP FOR PROJECT TASKS

	 PRINT 'Gecikmiþ(Henüz baþlanmamýþ), ' + CAST( @TotalLATE_To_Start as nvarchar(5)) + ')'

	 DECLARE @EMTPY_L NVARCHAR(MAX) = N'<tr><td>&nbsp;</td></tr>';

	 SET @MSG_LINES_7 = @MSG_LINES_7 + @EMTPY_L + '<tr><td style="padding-left:10px; padding-right:10px;; color:#E62E2D;font-family:arial,helvetica,sans-serif;text-align:left; 
      font-size:18px; font-weight:500">Gecikmiþ(Henüz baþlanmamýþ), ' + ISNULL(CAST( @TotalLATE_To_Start as nvarchar(5)),'') + '</td></tr>'


	 -- LOOP FOR QUICK TASKS LATE
	 IF OBJECT_ID('tempdb..#XYZQTLATE','u') IS NOT NULL
	 DROP TABLE #XYZQTLATE
	 create table #XYZQTLATE(TaskTitle nvarchar(MAX) not null, TaskId bigint not null)
	 INSERT into #XYZQTLATE select TaskTitle,TaskId from QuickTask where AssignedTo = @Username AND (Completedby IS NULL OR Completedby='False') AND (Archived IS NULL OR Archived ='False')   AND (Status IS NULL OR Status = 'Bekliyor')
	 AND  DateDiff(MINUTE,SWITCHOFFSET(Start, '+03:00'),@NOW ) > 0 order by TaskTitle ASC
		
	 declare @TaskTitleQTLATE nvarchar(MAX)	
	 declare @TaskIdQTLATE  bigint	

	 while exists (select * from  #XYZQTLATE)
	 begin
		 select top 1 @TaskTitleQTLATE = TaskTitle  from #XYZQTLATE
		 select top 1 @TaskIdQTLATE = TaskId  from #XYZQTLATE
		 --do sth with task title
		 PRINT @TaskTitleQTLATE
		 SET @MSG_LINES_7 = @MSG_LINES_7 + '<tr><td
        style="padding-left: 15px; padding-right: 15px;  padding-bottom: 12px; padding-top:12px; background-color:#fefefe; 
		border-bottom: 1px solid #e9e9e9; font-weight:400"><img src="' + @FRONTENDSERVER + '/assets/untickEmail2.png" style="height:25px"> ' + @TaskTitleQTLATE + '</td></tr>'

		

		 delete from #XYZQTLATE  where TaskId = @TaskIdQTLATE
	 end
	 drop table #XYZQTLATE

	 -- END OF LOOP FOR QUICK TASKS LATE

	  -- LOOP FOR PROJECT TASKS LATE


	 IF OBJECT_ID('tempdb..#XYZPTLATE','u') IS NOT NULL
	 DROP TABLE #XYZPTLATE
	 create table #XYZPTLATE(TaskTitle nvarchar(MAX) not null, TaskId bigint not null, ProjectName nvarchar(MAX) not null)
	 INSERT into #XYZPTLATE select TaskTitle,TaskId, ProjectName from ProjectTask INNER JOIN Project ON ProjectTask.ProjectId = Project.ProjectId WHERE (Project.Privacy = 0 OR Project.Privacy = 2) AND AssignedTo =  @Username AND (IsCompleted='False' OR IsCompleted IS NULL)  AND (Archived IS NULL OR Archived ='False')   AND (Status IS NULL OR Status = 'Bekliyor')
	 AND  DateDiff(MINUTE,SWITCHOFFSET(Start, '+03:00'),@NOW ) > 0 order by TaskTitle ASC
	 
	 declare @TaskTitlePLATE nvarchar(MAX)	
	 declare @TaskIdPLATE bigint	
	 declare @ProjectNamePLATE nvarchar(MAX)	
	 while exists (select * from  #XYZPTLATE)
	 begin
		 select top 1 @TaskTitlePLATE = TaskTitle  from #XYZPTLATE
		 select top 1 @TaskIdPLATE = TaskId  from #XYZPTLATE
		 select top 1 @ProjectNamePLATE = ProjectName  from #XYZPTLATE --declare @ProjectNameP nvarchar(MAX)	
		 --do sth with task title
		 PRINT @TaskTitlePLATE
		 SET @MSG_LINES_7 = @MSG_LINES_7 + '<tr><td
        style="padding-left: 15px; padding-right: 15px;  padding-bottom: 12px; padding-top:12px; background-color:#fefefe; border-bottom: 1px solid #e9e9e9;  font-weight:400"><img src="' + @FRONTENDSERVER + '/assets/untickEmail2.png" 
		style="height:25px"> ' + @TaskTitlePLATE + ', <span style="background-color:#303030; color:white; border-radius: 2px; padding:3px">' + @ProjectNamePLATE + '</span></td></tr>'

		       

		 delete from #XYZPTLATE  where TaskId = @TaskIdPLATE
	 end
	
	 drop table #XYZPTLATE
	 

	  -- END OF LOOP FOR PROJECT TASKS LATE

	  -- ADD DEADLINE

	  --SET @MSG_LINES_7 = @MSG_LINES_7 + @MSG_LINES_7_5_DEADLINE


	  -- END OF ADDING DEADLINE


	  PRINT 'LOGO'
	  PRINT 'TRADEMARK'
	  PRINT 'NOTE'

	  DECLARE @MSG_LOGO_MINI NVARCHAR(MAX) = N'<tr style="text-align:center; background-color: #666;"> <td style="padding-top: 10px">      
       <a href="' + @FRONTENDSERVER + '" style="color:black; text-decoration: none;">
            <img src="' + @FRONTENDSERVER + '/assets/logo.png"" style=" height: 30px; vertical-align: middle "> <span style="vertical-align: middle;" >Xyzeki</span>
      </td></tr>';

	  

	     
	  DECLARE @MSG_TRADEMARK NVARCHAR(MAX) = N'<tr style="text-align:center; background-color: #666; color: #fefefe"><td><small>
          © 2020 Xyzeki ve logosu, Türk Patent Enstütüsü tescilli ticari markalardýr.
        </small>
      </td></tr>';

	   
	  DECLARE @MSG_NOTE NVARCHAR(MAX) = N'<tr style="text-align:center; background-color: #666; color: #fefefe"><td>
        <small>
          Bildirim e-postalarýný kapatmayý dilerseniz uygulama ayarlarýmýzý kullanabilirsiniz.
        </small>
      </td></tr>'

	  DECLARE @EMTPY_LINE NVARCHAR(MAX) = N'<tr><td>&nbsp;</td></tr>';
	  DECLARE @MSG_END_8 NVARCHAR(MAX) = N'' + @EMTPY_LINE;
	  SET @MSG_END_8 = @MSG_END_8 + @MSG_LOGO_MINI + @MSG_TRADEMARK + @MSG_NOTE 

	

	 --RUN EMAILLING

	  
	 
	  SET @TABLE_LINES = N'' + @MSG_LOGO_1 + @EMTPY_LINE + @MSG_GREETING_2 + @EMTPY_LINE + @MSG_NO_OF_TODO_3 + @MSG_NO_OF_QT_4 + @MSG_NO_OF_PT_5 + @EMTPY_LINE + @MSG_TODAY_6 + @MSG_LINES_7 + @MSG_LINES_7_5_DEADLINE + @MSG_END_8

	  SET @TABLE = N'<table border="0" align="center" cellpadding="2" cellspacing="0" style="background: rgb(255, 255, 255);  /* fallback for old browsers */
		background: -webkit-linear-gradient(to right, rgb(255, 255, 255), rgb(248, 249, 250));  /* Chrome 10-25, Safari 5.1-6 */
		background: linear-gradient(to right, rgb(255, 255, 255), rgb(248, 249, 250));text-align:left; font-size:16px; color: #353535; 
		box-shadow: 0 5px 15px rgba(0, 0, 0, .08); 
		font-size: 16px; font-family: Arial, Helvetica, sans-serif "> <tbody style="margin-left:5%; margin-right:5%; margin-top: 20px; padding:5%;  padding: 10px;">' + @TABLE_LINES +	N'</tbody></table>'


	 SET @EMAIL_BODY = @TABLE

	 EXEC msdb.dbo.sp_send_dbmail  @subject = @EMAIL_SUBJECT, @recipients = @EMAIL_RECIPIENTS,  @body = @EMAIL_BODY, @body_format = 'HTML', @profile_name= 'Xyzeki'

	 --END EMAILLING

	 delete from #XYZEmails  where Username = @Username

end

	drop table #XYZEmails
    COMMIT
END TRY
BEGIN CATCH
 ROLLBACK
END CATCH


--reference
--Before use, Database Mail must be enabled using the Database Mail Configuration Wizard
--https://docs.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-send-dbmail-transact-sql?view=sql-server-2017

--Ýþveren E-Mail Scripti
--assigned to boþ geldiði zaman {..} þeklinde geliyor bu da bulunduu kontextteki içlemde concatination hatasý verdiriyor..bu muhtemelen her iki scripti'de etkileyebilecek bir sorun.
--SET @Concatenated = ISNULL(@Column1, '') + ISNULL(@Column2, '') -- YA DA
--DECLARE @Column1 VARCHAR(50) = 'Foo',
--        @Column2 VARCHAR(50) = NULL,
--        @Column3 VARCHAR(50) = 'Bar';


--SELECT CONCAT(@Column1,@Column2,@Column3); /*Returns FooBar*/



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

	IF OBJECT_ID('tempdb..#XYZEmailsOwner','u') IS NOT NULL
	DROP TABLE #XYZEmailsOwner
	create table #XYZEmailsOwner( Name  nvarchar(25) not null,    Surname  nvarchar(25) not null,    Username nvarchar(20) not null,    Email nvarchar(50) not null,)
	insert into #XYZEmailsOwner select Name, Surname, dbo.Member.Username,Email from dbo.Member inner join dbo.MemberSetting on dbo.Member.Username=dbo.MemberSetting.Username
	where dbo.MemberSetting.OwnerReporting=1 order by dbo.Member.Username asc

	declare @Name nvarchar(25)
	declare @Surname nvarchar(25)
	declare @Username nvarchar(20)
	declare @Email nvarchar(50)

	while exists (select * from  #XYZEmailsOwner)
	begin
	 select top 1 @Name = Name  from #XYZEmailsOwner
	 select top 1 @Surname = Surname  from #XYZEmailsOwner
	 select top 1 @Username = Username  from #XYZEmailsOwner
	 select top 1 @Email = Email  from #XYZEmailsOwner

	 SET @EMAIL_RECIPIENTS = @Email
	 

	 -- CALCULATING NUMBERS
	 DECLARE @NoOfQTTOTAL int = 0;
	 DECLARE @NoOfQTCompleted int = 0;

	 DECLARE @NoOfPTTOTAL int = 0;
	 DECLARE @NoOfPTCompleted int = 0;

	 DECLARE @TOTAL int = 0;
	 DECLARE @TOTALCOMPLETED int = 0;

	 select @NoOfQTTOTAL=COUNT(*) from QuickTask where Owner = @Username AND (Archived IS NULL OR Archived ='False') 
	 AND DateDiff(DD,dbo.getDatePartOf(SWITCHOFFSET(Date, '+03:00')), @NOW_AS_DATE)=0 -- owned, not archived, and today,TOTAL

	 select @NoOfQTCompleted=COUNT(*) from QuickTask where Owner = @Username AND Completedby IS NOT NULL AND (Archived IS NULL OR Archived ='False') 
	 AND DateDiff(DD,dbo.getDatePartOf(SWITCHOFFSET(Date, '+03:00')), @NOW_AS_DATE)=0 -- owned, not archived, and today,COMPLETED

	
	 select @NoOfPTTOTAL = COUNT(*) from Project P inner join ProjectTask PT  on P.ProjectId = PT.ProjectId where (P.Privacy != 1) AND P.Owner = @Username 
	 AND (PT.Archived IS NULL OR PT.Archived ='False') 
	 AND DateDiff(DD,dbo.getDatePartOf(SWITCHOFFSET(Deadline, '+03:00')),@NOW_AS_DATE )=0  -- owned, not archived, and today,TOTAL

	 select @NoOfPTCompleted = COUNT(*) from Project P inner join ProjectTask PT  on P.ProjectId = PT.ProjectId where (P.Privacy != 1) AND P.Owner = @Username 
	 AND PT.IsCompleted='True' AND (PT.Archived IS NULL OR PT.Archived ='False') 
	 AND DateDiff(DD,dbo.getDatePartOf(SWITCHOFFSET(Deadline, '+03:00')),@NOW_AS_DATE )=0  -- owned, not archived, and today,COMPLETED


	 SET @TOTAL = @NoOfQTTOTAL + @NoOfPTTOTAL
	 SET @TOTALCOMPLETED = @NoOfQTCompleted + @NoOfPTCompleted

	 IF(@TOTAL = 0) -- DON'T EMAIL THE MEMBER IF ALL IS DONE.
	 BEGIN
	  delete from #XYZEmailsOwner  where Username = @Username
	  CONTINUE
	 END



	 --PRINT 'Xyzeki G'
	 --PRINT 'Merhaba Deðerli ' + @Name + ' ' + @Surname + ',' + @Username + ','
	 --PRINT 'Bugün için iþveren olarak yapýlmasýný istediðiniz toplam ' + CAST( @TOTAL as nvarchar(5)) + ' görev vardý, '
	 -- + CAST( @TOTALCOMPLETED as nvarchar(5)) + ' adeti tamamlandý'

	 --PRINT 'Durum(Tamamlanan/Toplam)'
	 --PRINT 'Görev: ' + CAST( @NoOfQTCompleted as nvarchar(5)) + '/' + CAST( @NoOfQTTOTAL as nvarchar(5)) -- 2/3 GÝBÝ

	 --PRINT 'Proje Görevi: ' + CAST( @NoOfPTCompleted as nvarchar(5)) + '/' + CAST( @NoOfPTTOTAL as nvarchar(5)) -- 2/2 GÝBÝ

	 --PRINT 'Bugün'

	 SET @EMAIL_SUBJECT = 'Xyzeki, Ýþveren Gün Özeti, (Bugün Tamamlanmasý Gereken '+ ISNULL(CAST( @TOTAL as nvarchar(5)), '') + ', Tamamlanan ' + ISNULL(CAST( @TOTALCOMPLETED as nvarchar(5)), '') + ')'

	 DECLARE @MSG_LOGO_1 NVARCHAR(MAX) =  N'<tr>  <td style="padding-left:10px; padding-right:10px">
        <a href="' + @FRONTENDSERVER + '"
        style=" color:black;  display: inline-block;         padding-top: 0.3125rem;          padding-bottom: 0.3125rem;       
         margin-right: 1rem;          font-size: 1.25rem; text-decoration: none;         white-space: nowrap; ">
        <img src="' + @FRONTENDSERVER + '/assets/logo.png" style="height: 30px;  vertical-align: middle; "><span style="vertical-align: middle;"> Xyzeki</span>
      </a>
      </td></tr>'


	 DECLARE @MSG_GREETING_2 NVARCHAR(MAX) = N'<tr><td style="padding-left:10px; padding-right:10px">Merhaba Deðerli ' + ISNULL(@Name,'') + ' ' + ISNULL(@Surname,'') + ',</td></tr>'

	 DECLARE @MSG_NO_OF_TODO_3 NVARCHAR(MAX) = N'<tr><td style="padding-left:10px; padding-right:10px">Bugün için iþveren olarak tamamlanmasýný 
      istediðiniz toplam <span style="color:rgb(46, 45, 45);font-family:arial,helvetica,sans-serif;text-align:left; 
      font-size:18px;">' + ISNULL(CAST( @TOTAL as nvarchar(5)),'') + '</span> görev vardý, <span style="color:rgb(46, 45, 45);font-family:arial,helvetica,sans-serif;text-align:left; 
        font-size:18px;">' + ISNULL(CAST( @TOTALCOMPLETED as nvarchar(5)),'') + '</span> adeti tamamlandý.</td></tr>'

	  

	 DECLARE @MSG_NO_OF_QT_4 NVARCHAR(MAX) = N'<tr><td
        style="padding-left:10px; padding-right:10px; background-color:#fefefe; border-bottom: 1px solid #e9e9e9; font-weight:500">
        Görev: <span style="color:rgb(46, 45, 45);font-family:arial,helvetica,sans-serif;text-align:left; 
        font-size:18px;">' + ISNULL(CAST( @NoOfQTCompleted as nvarchar(5)),'') + '/' + ISNULL(CAST( @NoOfQTTOTAL as nvarchar(5)),'') + '</span></td></tr>' -- 2/3 gibi

	  


	 DECLARE @MSG_NO_OF_PT_5 NVARCHAR(MAX) = N'<tr><td
        style="padding-left:10px; padding-right:10px;; background-color:#fefefe; border-bottom: 1px solid #e9e9e9; font-weight:500">Proje Görevi: <span style="color:rgb(46, 45, 45);font-family:arial,helvetica,sans-serif;text-align:left; 
        font-size:18px;">' + ISNULL(CAST( @NoOfPTCompleted as nvarchar(5)),'') + '/' + ISNULL(CAST( @NoOfPTTOTAL as nvarchar(5)),'') + '</span></td></tr>' -- 2/2 GÝBÝ

	 



	 DECLARE @MSG_TODAY_6 NVARCHAR(MAX) = N'<tr><td style="padding-left:10px; padding-right:10px;; color:rgb(46, 45, 45);font-family:arial,helvetica,sans-serif;text-align:left; 
      font-size:18px; font-weight:500"">Bugün  </td></tr>'

	 DECLARE @MSG_LINES_7 NVARCHAR(MAX) = N''

	
	 

	 -- LOOP FOR QUICK TASKS
	 IF OBJECT_ID('tempdb..#XYZQTOwner','u') IS NOT NULL
	 DROP TABLE #XYZQTOwner
	 create table #XYZQTOwner(TaskTitle nvarchar(MAX) not null, TaskId bigint not null, AssignedTo nvarchar(20) ,Completedby nvarchar(20))
	 INSERT into #XYZQTOwner select TaskTitle,TaskId,AssignedTo,Completedby from QuickTask where Owner = @Username AND (Archived IS NULL OR Archived ='False')
	  AND DateDiff(DD,dbo.getDatePartOf(SWITCHOFFSET(Date, '+03:00')),@NOW_AS_DATE )=0 order by TaskTitle ASC
	 
	 declare @TaskTitle nvarchar(MAX)	
	 declare @TaskId bigint	
	 declare @AssignedTo nvarchar(20)
	 declare @Completedby nvarchar(20)	
	 declare @A_Name nvarchar(MAX) = ''
	 declare @A_Surname nvarchar(MAX) = ''

	 while exists (select * from  #XYZQTOwner)
	 begin
		 set @A_Name = '';
		 set @A_Surname = '';

		 select top 1 @TaskTitle = TaskTitle  from #XYZQTOwner
		 select top 1 @TaskId = TaskId  from #XYZQTOwner
		 select top 1 @AssignedTo = AssignedTo  from #XYZQTOwner
		 select top 1 @Completedby = Completedby  from #XYZQTOwner
		 		 
		 select @A_Name=Name, @A_Surname=Surname from [dbo].[Member] where Username=@AssignedTo
		
		 DECLARE @STATUS NVARCHAR(MAX) = N'<img src="' + @FRONTENDSERVER + '/assets/untickEmail2.png" style="height:25px">';

		 IF(@Completedby IS NOT NULL)
		 BEGIN
		 SET @STATUS = N'<img src="' + @FRONTENDSERVER + '/assets/tickEmail.png" style="height:25px">'
		 END		
		 
		
		 
		 --burada null önleme mekanizmasý olabilir.

		

		 --do sth with task title
		 --PRINT @STATUS + ' ,' + @TaskTitle + ',' + @AssignedTo

		 SET @MSG_LINES_7 = @MSG_LINES_7 + '<tr><td style=" padding-left:15px; padding-right:15px; padding-bottom: 12px; padding-top:12px;
        background-color:#fefefe; border-bottom: 1px solid #e9e9e9; font-weight:400">
		' + @STATUS + ' ' + @TaskTitle + ', <u>' + ISNULL(@A_Name,'') + ' ' + ISNULL(@A_Surname,'') + '</u></td></tr>'

		 
		  
		 delete from #XYZQTOwner  where TaskId = @TaskId
	 end
	 drop table #XYZQTOwner

	 -- END OF LOOP FOR QUICK TASKS

	 -- LOOP FOR PROJECT TASKS
	  
	 IF OBJECT_ID('tempdb..#XYZPTOwner','u') IS NOT NULL
	 DROP TABLE #XYZPTOwner
	 create table #XYZPTOwner(TaskTitle nvarchar(MAX) not null, TaskId bigint not null,AssignedTo nvarchar(20),IsCompleted bit, ProjectName nvarchar(MAX) not null) 
	 INSERT into #XYZPTOwner select PT.TaskTitle, PT.TaskId,PT.AssignedTo, PT.IsCompleted, P.ProjectName from Project P inner join ProjectTask PT  on P.ProjectId = PT.ProjectId where (P.Privacy != 1) AND P.Owner = @Username 
	 AND (PT.Archived IS NULL OR PT.Archived ='False') 
	 AND DateDiff(DD,dbo.getDatePartOf(SWITCHOFFSET(Deadline, '+03:00')),@NOW_AS_DATE )=0  order by PT.TaskTitle ASC  -- owned, not archived, and today,TOTAL

	 declare @TaskTitleP nvarchar(MAX)	
	 declare @TaskIdP bigint	
	 declare @AssignedToP nvarchar(20)	
	 declare @IsCompletedP bit	
	 declare @ProjectNameP nvarchar(MAX)

	 declare @A_NameP nvarchar(MAX)	
	 declare @A_SurnameP nvarchar(MAX)	

	 --PRINT 'Proje Görevleri'
	 
	 while exists (select * from  #XYZPTOwner)
	 begin
		 set @A_NameP = '';
		 set @A_SurnameP = '';

		 select top 1 @TaskTitleP = TaskTitle  from #XYZPTOwner
		 select top 1 @TaskIdP = TaskId  from #XYZPTOwner
		 select top 1 @AssignedToP = AssignedTo  from #XYZPTOwner
		 select top 1 @IsCompletedP = IsCompleted  from #XYZPTOwner
		 select top 1 @ProjectNameP = ProjectName  from #XYZPTOwner
		 
		 select @A_NameP=Name, @A_SurnameP=Surname from [dbo].[Member] where Username=@AssignedToP
		 

		 DECLARE @STATUSP NVARCHAR(MAX) = '<img src="' + @FRONTENDSERVER + '/assets/untickEmail2.png" style="height:25px">';
		 IF(@IsCompletedP = 'True')
		 BEGIN
		 SET @STATUSP = '<img src="' + @FRONTENDSERVER + '/assets/tickEmail.png" style="height:25px">'
		 END

		 --do sth with task title
		 PRINT @STATUSP + ' ,' + @TaskTitleP + ',' + @AssignedToP

		 SET @MSG_LINES_7 = @MSG_LINES_7 + '<tr><td
        style="padding-left: 15px; padding-right: 15px;  padding-bottom: 12px; padding-top:12px; background-color:#fefefe; border-bottom: 1px solid #e9e9e9;  font-weight:400">
        ' + @STATUSP + ' ' + @TaskTitleP + ', <u> ' + ISNULL(@A_NameP, '') + ' ' + ISNULL(@A_SurnameP,'') + '</u> <span style="background-color:#303030; color:white; border-radius: 2px; padding:3px; overflow: hidden;
white-space: nowrap;">' + @ProjectNameP + '</span></td></tr>'

		
		 delete from #XYZPTOwner  where TaskId = @TaskIdP
	 end
	 
	 drop table #XYZPTOwner 


	 -- PRINT 'LOGO'
	 -- PRINT 'TRADEMARK'
	 -- PRINT 'NOTE'

	  DECLARE @MSG_LOGO_MINI NVARCHAR(MAX) = N'<tr style="text-align:center; background-color: #666;"> <td style="padding-top: 10px">      
       <a href="' + @FRONTENDSERVER +  '" style="color:black; text-decoration: none;">
            <img src="' + @FRONTENDSERVER + '/assets/logo.png"" style=" height: 30px; vertical-align: middle "> <span style="vertical-align: middle;" > Xyzeki</span>
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

	  SET @TABLE_LINES = @MSG_LOGO_1 + @EMTPY_LINE + @MSG_GREETING_2 + @EMTPY_LINE + @MSG_NO_OF_TODO_3 + @MSG_NO_OF_QT_4 + @MSG_NO_OF_PT_5 + @EMTPY_LINE + @MSG_TODAY_6 + @MSG_LINES_7 + @MSG_END_8

	  SET @TABLE = N'<table border="0" align="center" cellpadding="2" cellspacing="0" style="background: rgb(255, 255, 255);  /* fallback for old browsers */
		--background: -webkit-linear-gradient(to right, rgb(255, 255, 255), rgb(248, 249, 250));  /* Chrome 10-25, Safari 5.1-6 */
		--background: linear-gradient(to right, rgb(255, 255, 255), rgb(248, 249, 250));text-align:left; font-size:16px; color: #353535; 
		--box-shadow: 0 5px 15px rgba(0, 0, 0, .08); 
		--font-size: 16px; font-family: Arial, Helvetica, sans-serif "> <tbody style="margin-left:5%; margin-right:5%; margin-top: 20px; padding:5%;  padding: 10px;">' + @TABLE_LINES +	N'</tbody></table>'

	 SET @EMAIL_BODY = @TABLE

	 PRINT @EMAIL_BODY
	 EXEC msdb.dbo.sp_send_dbmail  @subject = @EMAIL_SUBJECT, @recipients = @EMAIL_RECIPIENTS,  @body = @EMAIL_BODY, @body_format = 'HTML', @profile_name= 'Xyzeki'

	 --END EMAILLING

	 delete from #XYZEmailsOwner  where Username = @Username

end

	drop table #XYZEmailsOwner
    COMMIT
END TRY
BEGIN CATCH
 ROLLBACK
END CATCH


--reference
--Before use, Database Mail must be enabled using the Database Mail Configuration Wizard
--https://docs.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-send-dbmail-transact-sql?view=sql-server-2017
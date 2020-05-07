DECLARE @bodyMsg nvarchar(max)

DECLARE @subject nvarchar(max)

DECLARE @tableHTML nvarchar(max)

DECLARE @Table NVARCHAR(MAX) = N''

SET @subject = 'Query Results in HTML with CSS'

SELECT @Table = @Table +'<tr style="background-color:'+CASE WHEN (ROW_NUMBER() OVER (ORDER BY [SpecialOfferID]))%2 =1 THEN '#A3E0FF' ELSE '#8ED1FB' END +';">' +

'<td>' + CAST([SpecialOfferID] AS VARCHAR(100))+ '</td>' +

'<td>' + [Description]+ '</td>' +

'<td>' + [Type]+ '</td>' +

'<td>' + [Category] + '</td>' +

'<td>' + CONVERT(VARCHAR(30),[StartDate],120) + '</td>' +

'<td>' + CONVERT(VARCHAR(30),[EndDate],120) + '</td>' +

'</tr>'

FROM [dbo].[SpecialOffer]

ORDER BY [SpecialOfferID]

SET @tableHTML =

N'<H3><font color="Red">All Rows From [AdventureWorks].[Sales].[SpecialOffer]</H3>' +

N'<table border="1" align="center" cellpadding="2" cellspacing="0" style="color:purple;font-family:arial,helvetica,sans-serif;text-align:center;" >' +

N'<tr style ="font-size: 14px;font-weight: normal;background: #b9c9fe;">

<th>SpecialOfferID</th>

<th>Description</th>

<th>Type</th>

<th>Category</th>

<th>StartDate</th>

<th>EndDate</th></tr>' + @Table +	N'</table>'

EXEC msdb.dbo.sp_send_dbmail @recipients='AnyEmail@SqlIsCool.com',

@subject = @subject,

@body = @tableHTML,

@body_format = 'HTML' ;
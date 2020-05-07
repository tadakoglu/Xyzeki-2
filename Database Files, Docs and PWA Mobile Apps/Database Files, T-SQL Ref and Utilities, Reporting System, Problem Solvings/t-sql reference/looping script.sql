set rowcount 0
-- THE SOURCE TABLE "LINE" HAS THE SAME SCHEMA AS #RESULT AND #TEMP
use Northwind
go

declare @sum int
declare @curr int
set @sum = 0
declare @id int

IF OBJECT_ID('tempdb..#temp','u') IS NOT NULL
    DROP TABLE #temp

IF OBJECT_ID('tempdb..#result','u') IS NOT NULL
    DROP TABLE #result

create table #result( 
    id int not null,
    [name] varchar(255) not null,
    weight int not null,
    turn int not null
)

create table #temp( 
    id int not null,
    [name] varchar(255) not null,
    weight int not null,
    turn int not null
)

INSERT into #temp SELECT * FROM line order by turn

 WHILE EXISTS (SELECT 1 FROM #temp)
  BEGIN
   -- Get the top record
   SELECT TOP 1 @curr =  r.weight  FROM  #temp r order by turn  
   SELECT TOP 1 @id =  r.id  FROM  #temp r order by turn

    --print @curr
    print @sum

    IF(@sum + @curr <= 1000)
    BEGIN
    print 'entering........ again'
    --print @curr
      set @sum = @sum + @curr
      --print @sum
      INSERT INTO #result SELECT * FROM  #temp where [id] = @id  --id, [name], turn
      DELETE FROM #temp WHERE id = @id
    END
     ELSE
    BEGIN    
    print 'breaaaking.-----'
      BREAK
    END 
  END

   SELECT TOP 1 [name] FROM #result r order by r.turn desc 
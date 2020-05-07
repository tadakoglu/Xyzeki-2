using XYZToDo.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;



namespace XYZToDo.Models.DatabasePersistanceLayer
{
    public partial class XYZToDoSQLDbContext : DbContext
    {
        public virtual DbSet<ConnectionComment> ConnectionComment { get; set; }
        public virtual DbSet<ConnectionContainer> ConnectionContainer { get; set; }
        public virtual DbSet<ConnectionContainerBlob> ConnectionContainerBlob { get; set; }
        public virtual DbSet<ConnectionPrivateTalk> ConnectionPrivateTalk { get; set; }
        public virtual DbSet<ConnectionPrivateTalkMessage> ConnectionPrivateTalkMessage { get; set; }
        public virtual DbSet<ConnectionProject> ConnectionProject { get; set; }
        public virtual DbSet<ConnectionProjectToDo> ConnectionProjectToDo { get; set; }
        public virtual DbSet<ConnectionQuickToDo> ConnectionQuickToDo { get; set; }
        public virtual DbSet<ConnectionTeamMember> ConnectionTeamMember { get; set; }
        public virtual DbSet<ConnectionXyzeki> ConnectionXyzeki { get; set; }
        public virtual DbSet<ForgotPassword> ForgotPassword { get; set; }
        public virtual DbSet<Member> Member { get; set; }
        public virtual DbSet<MemberLicense> MemberLicense { get; set; }
        public virtual DbSet<MemberLicenseUsedStorage> MemberLicenseUsedStorage { get; set; }
        public virtual DbSet<MemberSetting> MemberSetting { get; set; }
        public virtual DbSet<PrivateTalk> PrivateTalk { get; set; }
        public virtual DbSet<PrivateTalkLastSeen> PrivateTalkLastSeen { get; set; }
        public virtual DbSet<PrivateTalkMessage> PrivateTalkMessage { get; set; }
        public virtual DbSet<PrivateTalkReceiver> PrivateTalkReceiver { get; set; }
        public virtual DbSet<PrivateTalkTeamReceiver> PrivateTalkTeamReceiver { get; set; }
        public virtual DbSet<Project> Project { get; set; }
        public virtual DbSet<ProjectTask> ProjectTask { get; set; }
        public virtual DbSet<ProjectTaskComment> ProjectTaskComment { get; set; }
        public virtual DbSet<QuickTask> QuickTask { get; set; }
        public virtual DbSet<QuickTaskComment> QuickTaskComment { get; set; }
        public virtual DbSet<Team> Team { get; set; }
        public virtual DbSet<TeamMember> TeamMember { get; set; }

        IConfiguration Configuration;
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                this.Configuration = new ConfigurationHelpers().Configuration;
                optionsBuilder.UseSqlServer(Configuration["XYZToDoDatabases:XYZToDoSQL:ConnectionString"]);
                //optionsBuilder.UseSqlServer(@"Server=TADAKOGLU\MSSQLSERVERTA;Database=XYZToDo;Trusted_Connection=True;MultipleActiveResultSets=true");
                //#warning To protect potentially sensitive information in your connection string, you should move it out of source code. See http://go.microsoft.com/fwlink/?LinkId=723263 for guidance on storing connection strings.
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ConnectionComment>(entity =>
            {
                entity.HasKey(e => e.ConnectionId);

                entity.Property(e => e.ConnectionId)
                    .HasColumnName("ConnectionID")
                    .HasMaxLength(50)
                    .ValueGeneratedNever();

                entity.Property(e => e.UserAgent).IsRequired();

                entity.Property(e => e.Username)
                    .IsRequired()
                    .HasMaxLength(20);

                entity.HasOne(d => d.UsernameNavigation)
                    .WithMany(p => p.ConnectionComment)
                    .HasForeignKey(d => d.Username)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_ConnectionComment_Member");
            });

            modelBuilder.Entity<ConnectionContainer>(entity =>
            {
                entity.HasKey(e => e.ConnectionId);

                entity.Property(e => e.ConnectionId)
                    .HasColumnName("ConnectionID")
                    .HasMaxLength(50)
                    .ValueGeneratedNever();

                entity.Property(e => e.UserAgent).IsRequired();

                entity.Property(e => e.Username)
                    .IsRequired()
                    .HasMaxLength(20);

                entity.HasOne(d => d.UsernameNavigation)
                    .WithMany(p => p.ConnectionContainer)
                    .HasForeignKey(d => d.Username)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_ConnectionContainer_Member");
            });

            modelBuilder.Entity<ConnectionContainerBlob>(entity =>
            {
                entity.HasKey(e => e.ConnectionId);

                entity.Property(e => e.ConnectionId)
                    .HasColumnName("ConnectionID")
                    .HasMaxLength(50)
                    .ValueGeneratedNever();

                entity.Property(e => e.UserAgent).IsRequired();

                entity.Property(e => e.Username)
                    .IsRequired()
                    .HasMaxLength(20);

                entity.HasOne(d => d.UsernameNavigation)
                    .WithMany(p => p.ConnectionContainerBlob)
                    .HasForeignKey(d => d.Username)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_ConnectionContainerBlob_Member");
            });

            modelBuilder.Entity<ConnectionPrivateTalk>(entity =>
            {
                entity.HasKey(e => e.ConnectionId);

                entity.Property(e => e.ConnectionId)
                    .HasColumnName("ConnectionID")
                    .HasMaxLength(50)
                    .ValueGeneratedNever();

                entity.Property(e => e.UserAgent).IsRequired();

                entity.Property(e => e.Username)
                    .IsRequired()
                    .HasMaxLength(20);

                entity.HasOne(d => d.UsernameNavigation)
                    .WithMany(p => p.ConnectionPrivateTalk)
                    .HasForeignKey(d => d.Username)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_ConnectionPrivateTalk_Member");
            });

            modelBuilder.Entity<ConnectionPrivateTalkMessage>(entity =>
            {
                entity.HasKey(e => e.ConnectionId);

                entity.Property(e => e.ConnectionId)
                    .HasColumnName("ConnectionID")
                    .HasMaxLength(50)
                    .ValueGeneratedNever();

                entity.Property(e => e.UserAgent).IsRequired();

                entity.Property(e => e.Username)
                    .IsRequired()
                    .HasMaxLength(20);

                entity.HasOne(d => d.UsernameNavigation)
                    .WithMany(p => p.ConnectionPrivateTalkMessage)
                    .HasForeignKey(d => d.Username)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_ConnectionPrivateTalkMessage_Member");
            });

            modelBuilder.Entity<ConnectionProject>(entity =>
            {
                entity.HasKey(e => e.ConnectionId);

                entity.Property(e => e.ConnectionId)
                    .HasColumnName("ConnectionID")
                    .HasMaxLength(50)
                    .ValueGeneratedNever();

                entity.Property(e => e.UserAgent).IsRequired();

                entity.Property(e => e.Username)
                    .IsRequired()
                    .HasMaxLength(20);

                entity.HasOne(d => d.UsernameNavigation)
                    .WithMany(p => p.ConnectionProject)
                    .HasForeignKey(d => d.Username)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_ConnectionProject_Member");
            });

            modelBuilder.Entity<ConnectionProjectToDo>(entity =>
            {
                entity.HasKey(e => e.ConnectionId);

                entity.Property(e => e.ConnectionId)
                    .HasColumnName("ConnectionID")
                    .HasMaxLength(50)
                    .ValueGeneratedNever();

                entity.Property(e => e.UserAgent).IsRequired();

                entity.Property(e => e.Username)
                    .IsRequired()
                    .HasMaxLength(20);

                entity.HasOne(d => d.UsernameNavigation)
                    .WithMany(p => p.ConnectionProjectToDo)
                    .HasForeignKey(d => d.Username)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_ConnectionProjectToDo_Member");
            });

            modelBuilder.Entity<ConnectionQuickToDo>(entity =>
            {
                entity.HasKey(e => e.ConnectionId);

                entity.Property(e => e.ConnectionId)
                    .HasColumnName("ConnectionID")
                    .HasMaxLength(50)
                    .ValueGeneratedNever();

                entity.Property(e => e.UserAgent).IsRequired();

                entity.Property(e => e.Username)
                    .IsRequired()
                    .HasMaxLength(20);

                entity.HasOne(d => d.UsernameNavigation)
                    .WithMany(p => p.ConnectionQuickToDo)
                    .HasForeignKey(d => d.Username)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_ConnectionQuickToDo_Member");
            });

            modelBuilder.Entity<ConnectionTeamMember>(entity =>
            {
                entity.HasKey(e => e.ConnectionId);

                entity.Property(e => e.ConnectionId)
                    .HasColumnName("ConnectionID")
                    .HasMaxLength(50)
                    .ValueGeneratedNever();

                entity.Property(e => e.UserAgent).IsRequired();

                entity.Property(e => e.Username)
                    .IsRequired()
                    .HasMaxLength(20);

                entity.HasOne(d => d.UsernameNavigation)
                    .WithMany(p => p.ConnectionTeamMember)
                    .HasForeignKey(d => d.Username)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_TeamMemberConnection_Member");
            });

            modelBuilder.Entity<ConnectionXyzeki>(entity =>
            {
                entity.HasKey(e => e.ConnectionId);

                entity.Property(e => e.ConnectionId)
                    .HasColumnName("ConnectionID")
                    .HasMaxLength(50)
                    .ValueGeneratedNever();

                entity.Property(e => e.UserAgent).IsRequired();

                entity.Property(e => e.Username)
                    .IsRequired()
                    .HasMaxLength(20);

                entity.HasOne(d => d.UsernameNavigation)
                    .WithMany(p => p.ConnectionXyzeki)
                    .HasForeignKey(d => d.Username)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_ConnectionXyzeki_Member");
            });

            modelBuilder.Entity<ForgotPassword>(entity =>
            {
                entity.HasKey(e => e.SecurityCode);

                entity.Property(e => e.SecurityCode).HasDefaultValueSql("(newid())");

                entity.Property(e => e.LastValid).HasColumnType("datetimeoffset(0)");

                entity.Property(e => e.Username)
                    .IsRequired()
                    .HasMaxLength(20);

                entity.HasOne(d => d.UsernameNavigation)
                    .WithMany(p => p.ForgotPassword)
                    .HasForeignKey(d => d.Username)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_ForgotPassword_Member");
            });

            modelBuilder.Entity<Member>(entity =>
            {
                entity.HasKey(e => e.Username);

                entity.Property(e => e.Username)
                    .HasMaxLength(20)
                    .ValueGeneratedNever();

                entity.Property(e => e.Avatar).IsRequired();

                entity.Property(e => e.Cell).HasColumnType("decimal(15, 0)");

                entity.Property(e => e.CellCountry).HasColumnType("decimal(3, 0)");

                entity.Property(e => e.CryptoPassword).IsRequired();

                entity.Property(e => e.CryptoSalt).IsRequired();

                entity.Property(e => e.Email)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(25);

                entity.Property(e => e.Surname)
                    .IsRequired()
                    .HasMaxLength(25);
            });

            modelBuilder.Entity<MemberLicense>(entity =>
            {
                entity.HasKey(e => e.LicenseId);

                entity.HasIndex(e => e.Username)
                    .HasName("IX_MemberLicense")
                    .IsUnique();

                entity.Property(e => e.LicenseId).HasDefaultValueSql("(newid())");

                entity.Property(e => e.Address)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.AzureSaConnectionString).IsRequired();

                entity.Property(e => e.AzureSaSizeInGb).HasColumnName("AzureSaSizeInGB");

                entity.Property(e => e.Company)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.Currency)
                    .IsRequired()
                    .HasMaxLength(5);

                entity.Property(e => e.EndDate).HasColumnType("datetimeoffset(0)");

                entity.Property(e => e.Fee).HasColumnType("decimal(7, 2)");

                entity.Property(e => e.LicenseType)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.StartDate).HasColumnType("datetimeoffset(0)");

                entity.Property(e => e.Username)
                    .IsRequired()
                    .HasMaxLength(20);

                entity.HasOne(d => d.UsernameNavigation)
                    .WithOne(p => p.MemberLicense)
                    .HasForeignKey<MemberLicense>(d => d.Username)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_MemberLicense_Member");
            });

            modelBuilder.Entity<MemberLicenseUsedStorage>(entity =>
            {
                entity.HasKey(e => e.LicenseId);

                entity.Property(e => e.LicenseId).ValueGeneratedNever();

                entity.Property(e => e.AzureSaUsedSizeInBytes).HasDefaultValueSql("((0))");

                entity.HasOne(d => d.License)
                    .WithOne(p => p.MemberLicenseUsedStorage)
                    .HasForeignKey<MemberLicenseUsedStorage>(d => d.LicenseId)
                    .HasConstraintName("FK_MemberLicenseUsedStorage_MemberLicense");
            });

            modelBuilder.Entity<MemberSetting>(entity =>
            {
                entity.HasKey(e => e.Username);

                entity.Property(e => e.Username)
                    .HasMaxLength(20)
                    .ValueGeneratedNever();

                entity.Property(e => e.AssignedToReporting).HasDefaultValueSql("((1))");

                entity.Property(e => e.OwnerReporting).HasDefaultValueSql("((1))");

                entity.Property(e => e.SwitchMode).HasDefaultValueSql("((0))");

                entity.Property(e => e.Theme)
                    .IsRequired()
                    .HasMaxLength(100)
                    .HasDefaultValueSql("(N'klasikMavi')");

                entity.HasOne(d => d.UsernameNavigation)
                    .WithOne(p => p.MemberSetting)
                    .HasForeignKey<MemberSetting>(d => d.Username)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_MemberSetting_Member");
            });

            modelBuilder.Entity<PrivateTalk>(entity =>
            {
                entity.Property(e => e.Owner)
                    .IsRequired()
                    .HasMaxLength(20);

                entity.Property(e => e.Sender).HasMaxLength(20);

                entity.Property(e => e.Thread).IsRequired();

                entity.HasOne(d => d.OwnerNavigation)
                    .WithMany(p => p.PrivateTalkOwnerNavigation)
                    .HasForeignKey(d => d.Owner)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_PrivateTalk_Member");

                entity.HasOne(d => d.SenderNavigation)
                    .WithMany(p => p.PrivateTalkSenderNavigation)
                    .HasForeignKey(d => d.Sender);
            });

            modelBuilder.Entity<PrivateTalkLastSeen>(entity =>
            {
                entity.HasIndex(e => new { e.PrivateTalkId, e.Visitor })
                    .HasName("IX_PrivateTalkLastSeen")
                    .IsUnique();

                entity.Property(e => e.Visitor)
                    .IsRequired()
                    .HasMaxLength(20);

                entity.HasOne(d => d.PrivateTalk)
                    .WithMany(p => p.PrivateTalkLastSeen)
                    .HasForeignKey(d => d.PrivateTalkId)
                    .HasConstraintName("FK_PrivateTalkLastSeen_PrivateTalk");

                entity.HasOne(d => d.VisitorNavigation)
                    .WithMany(p => p.PrivateTalkLastSeen)
                    .HasForeignKey(d => d.Visitor)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_PrivateTalkLastSeen_Member");
            });

            modelBuilder.Entity<PrivateTalkMessage>(entity =>
            {
                entity.HasKey(e => e.MessageId);

                entity.Property(e => e.DateTimeSent).HasColumnType("datetimeoffset(0)");

                entity.Property(e => e.Message)
                    .IsRequired()
                    .HasMaxLength(1000);

                entity.Property(e => e.Sender).HasMaxLength(20);

                entity.HasOne(d => d.PrivateTalk)
                    .WithMany(p => p.PrivateTalkMessage)
                    .HasForeignKey(d => d.PrivateTalkId)
                    .HasConstraintName("FK_PrivateTalkMessage_PrivateTalk");

                entity.HasOne(d => d.SenderNavigation)
                    .WithMany(p => p.PrivateTalkMessage)
                    .HasForeignKey(d => d.Sender)
                    .HasConstraintName("FK_PrivateTalkMessage_Member");
            });

            modelBuilder.Entity<PrivateTalkReceiver>(entity =>
            {
                entity.HasKey(e => new { e.PrivateTalkId, e.Receiver });

                entity.Property(e => e.Receiver).HasMaxLength(20);

                entity.Property(e => e.PrivateTalkReceiverId).ValueGeneratedOnAdd();

                entity.HasOne(d => d.PrivateTalk)
                    .WithMany(p => p.PrivateTalkReceiver)
                    .HasForeignKey(d => d.PrivateTalkId)
                    .HasConstraintName("FK_PrivateTalkReceiver_PrivateTalk");

                entity.HasOne(d => d.ReceiverNavigation)
                    .WithMany(p => p.PrivateTalkReceiver)
                    .HasForeignKey(d => d.Receiver)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_PrivateTalkReceiver_Member");
            });

            modelBuilder.Entity<PrivateTalkTeamReceiver>(entity =>
            {
                entity.HasKey(e => new { e.PrivateTalkId, e.TeamId });

                entity.Property(e => e.PrivateTalkTeamReceiverId).ValueGeneratedOnAdd();

                entity.HasOne(d => d.PrivateTalk)
                    .WithMany(p => p.PrivateTalkTeamReceiver)
                    .HasForeignKey(d => d.PrivateTalkId)
                    .HasConstraintName("FK_PrivateTalkTeamReceiver_PrivateTalk");

                entity.HasOne(d => d.Team)
                    .WithMany(p => p.PrivateTalkTeamReceiver)
                    .HasForeignKey(d => d.TeamId)
                    .HasConstraintName("FK_PrivateTalkTeamReceiver_Team");
            });

            modelBuilder.Entity<Project>(entity =>
            {
                entity.Property(e => e.Color).HasMaxLength(20);

                entity.Property(e => e.CompletionRate)
                    .HasColumnType("decimal(4, 3)")
                    .HasDefaultValueSql("((0))");

                entity.Property(e => e.Owner)
                    .IsRequired()
                    .HasMaxLength(20);

                entity.Property(e => e.Privacy).HasDefaultValueSql("((0))");

                entity.Property(e => e.ProjectManager).HasMaxLength(20);

                entity.Property(e => e.ProjectName)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.HasOne(d => d.OwnerNavigation)
                    .WithMany(p => p.ProjectOwnerNavigation)
                    .HasForeignKey(d => d.Owner)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Project_Member");

                entity.HasOne(d => d.ProjectManagerNavigation)
                    .WithMany(p => p.ProjectProjectManagerNavigation)
                    .HasForeignKey(d => d.ProjectManager)
                    .HasConstraintName("FK_Project_MemberPM");
            });

            modelBuilder.Entity<ProjectTask>(entity =>
            {
                entity.HasKey(e => e.TaskId);

                entity.Property(e => e.AssignedTo).HasMaxLength(20);

                entity.Property(e => e.Deadline).HasColumnType("datetimeoffset(0)");

                entity.Property(e => e.Finish).HasColumnType("datetimeoffset(0)");

                entity.Property(e => e.ShowSubTasks).HasDefaultValueSql("((1))");

                entity.Property(e => e.Start).HasColumnType("datetimeoffset(0)");

                entity.Property(e => e.Status).HasMaxLength(20);

                entity.Property(e => e.TaskDescription).HasMaxLength(1000);

                entity.Property(e => e.TaskTitle).IsRequired();

                entity.Property(e => e.Zindex)
                    .HasColumnName("ZIndex")
                    .HasDefaultValueSql("((0))");

                entity.HasOne(d => d.AssignedToNavigation)
                    .WithMany(p => p.ProjectTask)
                    .HasForeignKey(d => d.AssignedTo)
                    .HasConstraintName("FK_ProjectTasks_Members");

                entity.HasOne(d => d.Project)
                    .WithMany(p => p.ProjectTask)
                    .HasForeignKey(d => d.ProjectId)
                    .HasConstraintName("FK_ProjectTasks_Projects");
            });

            modelBuilder.Entity<ProjectTaskComment>(entity =>
            {
                entity.HasKey(e => e.MessageId);

                entity.Property(e => e.Color).HasMaxLength(20);

                entity.Property(e => e.DateTimeSent).HasColumnType("datetimeoffset(0)");

                entity.Property(e => e.Message)
                    .IsRequired()
                    .HasMaxLength(1000);

                entity.Property(e => e.Sender).HasMaxLength(20);

                entity.HasOne(d => d.SenderNavigation)
                    .WithMany(p => p.ProjectTaskComment)
                    .HasForeignKey(d => d.Sender)
                    .HasConstraintName("FK_ProjectTaskComment_Member");

                entity.HasOne(d => d.Task)
                    .WithMany(p => p.ProjectTaskComment)
                    .HasForeignKey(d => d.TaskId)
                    .HasConstraintName("FK_ProjectTaskComment_ProjectTask");
            });

            modelBuilder.Entity<QuickTask>(entity =>
            {
                entity.HasKey(e => e.TaskId);

                entity.Property(e => e.AssignedTo).HasMaxLength(20);

                entity.Property(e => e.Completedby).HasMaxLength(20);

                entity.Property(e => e.Date).HasColumnType("datetimeoffset(0)");

                entity.Property(e => e.Finish).HasColumnType("datetimeoffset(0)");

                entity.Property(e => e.Owner)
                    .IsRequired()
                    .HasMaxLength(20);

                entity.Property(e => e.Start).HasColumnType("datetimeoffset(0)");

                entity.Property(e => e.Status).HasMaxLength(20);

                entity.Property(e => e.TaskTitle).IsRequired();

                entity.HasOne(d => d.AssignedToNavigation)
                    .WithMany(p => p.QuickTaskAssignedToNavigation)
                    .HasForeignKey(d => d.AssignedTo)
                    .HasConstraintName("FK_QuickTask_Member");

                entity.HasOne(d => d.OwnerNavigation)
                    .WithMany(p => p.QuickTaskOwnerNavigation)
                    .HasForeignKey(d => d.Owner)
                    .OnDelete(DeleteBehavior.ClientSetNull);
            });

            modelBuilder.Entity<QuickTaskComment>(entity =>
            {
                entity.HasKey(e => e.MessageId);

                entity.Property(e => e.Color).HasMaxLength(20);

                entity.Property(e => e.DateTimeSent).HasColumnType("datetimeoffset(0)");

                entity.Property(e => e.Message)
                    .IsRequired()
                    .HasMaxLength(1000);

                entity.Property(e => e.Sender).HasMaxLength(20);

                entity.HasOne(d => d.SenderNavigation)
                    .WithMany(p => p.QuickTaskComment)
                    .HasForeignKey(d => d.Sender)
                    .HasConstraintName("FK_QuickTaskComment_Member");

                entity.HasOne(d => d.Task)
                    .WithMany(p => p.QuickTaskComment)
                    .HasForeignKey(d => d.TaskId)
                    .HasConstraintName("FK_QuickTaskComment_QuickTask");
            });

            modelBuilder.Entity<Team>(entity =>
            {
                entity.Property(e => e.Owner)
                    .IsRequired()
                    .HasMaxLength(20);

                entity.Property(e => e.TeamName)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.HasOne(d => d.OwnerNavigation)
                    .WithMany(p => p.Team)
                    .HasForeignKey(d => d.Owner)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Team_Member");
            });

            modelBuilder.Entity<TeamMember>(entity =>
            {
                entity.HasIndex(e => new { e.TeamId, e.Username })
                    .HasName("IX_TeamMember")
                    .IsUnique();

                entity.Property(e => e.Username)
                    .IsRequired()
                    .HasMaxLength(20);

                entity.HasOne(d => d.Team)
                    .WithMany(p => p.TeamMember)
                    .HasForeignKey(d => d.TeamId)
                    .HasConstraintName("FK_TeamMembers_Teams");

                entity.HasOne(d => d.UsernameNavigation)
                    .WithMany(p => p.TeamMember)
                    .HasForeignKey(d => d.Username)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_TeamMember_Member");
            });
        }
    }
}

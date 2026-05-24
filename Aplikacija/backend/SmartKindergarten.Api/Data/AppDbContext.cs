using Microsoft.EntityFrameworkCore;
using SmartKindergarten.Api.Models;

namespace SmartKindergarten.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Child> Children { get; set; }
        public DbSet<KindergartenGroup> KindergartenGroups{  get; set; }
        public DbSet<ParentChild> ParentChildren { get; set; }
        public DbSet<TeacherGroup> TeacherGroups { get; set; }
        public DbSet<DevelopmentNote> DevelopmentNotes { get; set; }
        public DbSet<DevelopmentAssessment> DevelopmentAssessments { get; set; }
        public DbSet<Attendance> Attendances { get; set; }
        public DbSet<DailyReport> DailyReports { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<NotificationRecipient> NotificationRecipients { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<SystemSettings> SystemSettings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ParentChild>().HasKey(pc => new { pc.ParentId, pc.ChildId });

            modelBuilder.Entity<ParentChild>()
                .HasOne(pc => pc.Parent)
                .WithMany(u => u.ParentChildren)
                .HasForeignKey(pc => pc.ParentId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ParentChild>()
                .HasOne(pc => pc.Child)
                .WithMany(c => c.ParentChildren)
                .HasForeignKey(pc => pc.ChildId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TeacherGroup>().HasKey(tg => new { tg.TeacherId, tg.GroupId });

            modelBuilder.Entity<TeacherGroup>()
                .HasOne(tg => tg.Teacher)
                .WithMany(u => u.TeacherGroups)
                .HasForeignKey(tg => tg.TeacherId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TeacherGroup>()
                .HasOne(tg => tg.Group)
                .WithMany(g => g.TeacherGroups)
                .HasForeignKey(tg => tg.GroupId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Child>()
                .HasOne(c => c.Group)
                .WithMany(g => g.Children)
                .HasForeignKey(c => c.GroupId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<NotificationRecipient>().HasKey(nr => new { nr.NotificationId, nr.UserId });

            modelBuilder.Entity<NotificationRecipient>()
                .HasOne(nr => nr.Notification)
                .WithMany(n => n.Recipients)
                .HasForeignKey(nr => nr.NotificationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<NotificationRecipient>()
                .HasOne(nr => nr.User)
                .WithMany(u => u.NotificationRecipients)
                .HasForeignKey(nr => nr.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
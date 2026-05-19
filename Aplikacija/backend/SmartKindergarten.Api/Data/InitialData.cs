using Microsoft.EntityFrameworkCore;
using SmartKindergarten.Api.Models;

namespace SmartKindergarten.Api.Data
{
    public static class InitialData
    {
        public static async Task InitializeAsync(IServiceProvider serviceProvider)
        {
            using IServiceScope scope = serviceProvider.CreateScope();
            AppDbContext context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            await context.Database.MigrateAsync();
            if (await context.Users.AnyAsync())
            {
                return;
            }

            User admin = new User
            {
                Username = "admin",
                Email = "admin@smartkindergarten.rs",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                FirstName = "Admin",
                LastName = "Korisnik",
                Role = UserRole.Administrator,
                IsActive = true
            };

            User teacher = new User
            {
                Username = "teacher",
                Email = "teacher@smartkindergarten.rs",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("teacher123"),
                FirstName = "Milica",
                LastName = "Janković",
                Role = UserRole.Teacher,
                IsActive = true
            };

            User parent = new User
            {
                Username = "parent",
                Email = "parent@smartkindergarten.rs",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("parent123"),
                FirstName = "Marko",
                LastName = "Petrović",
                Role = UserRole.Parent,
                IsActive = true
            };

            User staff = new User
            {
                Username = "staff",
                Email = "staff@smartkindergarten.rs",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("staff123"),
                FirstName = "Jelena",
                LastName = "Administracija",
                Role = UserRole.AdministrativeStaff,
                IsActive = true
            };

            context.Users.AddRange(admin, teacher, parent, staff);
            await context.SaveChangesAsync();

            KindergartenGroup youngerGroup = new KindergartenGroup
            {
                Name = "Mlađa grupa A",
                Description = "Grupa za decu mlađeg predškolskog uzrasta."
            };

            KindergartenGroup olderGroup = new KindergartenGroup
            {
                Name = "Starija grupa B",
                Description = "Grupa za decu starijeg predškolskog uzrasta."
            };

            context.KindergartenGroups.AddRange(youngerGroup, olderGroup);
            await context.SaveChangesAsync();

            Child childOne = new Child
            {
                FirstName = "Luka",
                LastName = "Petrović",
                DateOfBirth = new DateTime(2020, 5, 14, 0, 0, 0, DateTimeKind.Utc),
                Notes = "Dete je aktivno i dobro se uklapa u grupu.",
                GroupId = youngerGroup.Id
            };

            Child childTwo = new Child
            {
                FirstName = "Ana",
                LastName = "Jovanović",
                DateOfBirth = new DateTime(2019, 9, 3, 0, 0, 0, DateTimeKind.Utc),
                Notes = "Pokazuje interesovanje za kreativne aktivnosti.",
                GroupId = olderGroup.Id
            };

            context.Children.AddRange(childOne, childTwo);
            await context.SaveChangesAsync();

            ParentChild parentChild = new ParentChild
            {
                ParentId = parent.Id,
                Parent = parent,
                ChildId = childOne.Id,
                Child = childOne
            };

            TeacherGroup teacherYoungerGroup = new TeacherGroup
            {
                TeacherId = teacher.Id,
                Teacher = teacher,
                GroupId = youngerGroup.Id,
                Group = youngerGroup
            };

            TeacherGroup teacherOlderGroup = new TeacherGroup
            {
                TeacherId = teacher.Id,
                Teacher = teacher,
                GroupId = olderGroup.Id,
                Group = olderGroup
            };

            context.ParentChildren.Add(parentChild);
            context.TeacherGroups.AddRange(teacherYoungerGroup, teacherOlderGroup);

            DevelopmentNote note = new DevelopmentNote
            {
                ChildId = childOne.Id,
                Child = childOne,
                TeacherId = teacher.Id,
                Teacher = teacher,
                Content = "Luka se danas lepo uključio u grupnu igru i sarađivao sa drugom decom."
            };

            DevelopmentAssessment assessmentOne = new DevelopmentAssessment
            {
                ChildId = childOne.Id,
                Child = childOne,
                TeacherId = teacher.Id,
                Teacher = teacher,
                Area = DevelopmentArea.SocialSkills,
                Score = 4,
                Comment = "Dobro sarađuje sa vršnjacima.",
                AssessmentDate = DateTime.UtcNow.AddDays(-10)
            };

            DevelopmentAssessment assessmentTwo = new DevelopmentAssessment
            {
                ChildId = childOne.Id,
                Child = childOne,
                TeacherId = teacher.Id,
                Teacher = teacher,
                Area = DevelopmentArea.MotorSkills,
                Score = 3,
                Comment = "Potrebno je dodatno vežbati motoriku.",
                AssessmentDate = DateTime.UtcNow.AddDays(-5)
            };

            context.DevelopmentNotes.Add(note);
            context.DevelopmentAssessments.AddRange(assessmentOne, assessmentTwo);

            await context.SaveChangesAsync();
        }
    }
}

using System.Globalization;
using System.Text;
using Microsoft.EntityFrameworkCore;
using SmartKindergarten.Api.Models;

namespace SmartKindergarten.Api.Data
{
    public static class InitialData
    {
        private const decimal MonthlyFee = 15000m;

        private static readonly DevelopmentArea[] DevelopmentAreas =
        {
            DevelopmentArea.SocialSkills,
            DevelopmentArea.CognitiveDevelopment,
            DevelopmentArea.MotorSkills,
            DevelopmentArea.SpeechLanguageDevelopment
        };

        private static readonly DateTime[] AssessmentDates =
        {
            UtcDate(2026, 1, 5),
            UtcDate(2026, 1, 19),
            UtcDate(2026, 2, 2),
            UtcDate(2026, 2, 16),
            UtcDate(2026, 3, 2),
            UtcDate(2026, 3, 16),
            UtcDate(2026, 3, 30),
            UtcDate(2026, 4, 13),
            UtcDate(2026, 4, 27),
            UtcDate(2026, 5, 11),
            UtcDate(2026, 5, 25),
            UtcDate(2026, 6, 8)
        };

        public static async Task InitializeAsync(IServiceProvider serviceProvider)
        {
            using IServiceScope scope = serviceProvider.CreateScope();
            AppDbContext context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            await context.Database.MigrateAsync();

            if (await context.Users.AnyAsync())
            {
                return;
            }

            string adminPasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123");
            string teacherPasswordHash = BCrypt.Net.BCrypt.HashPassword("teacher123");
            string parentPasswordHash = BCrypt.Net.BCrypt.HashPassword("parent123");
            string staffPasswordHash = BCrypt.Net.BCrypt.HashPassword("staff123");

            User director = CreateUser(
                username: "direktor",
                email: "direktor@smartkindergarten.rs",
                firstName: "Jovan",
                lastName: "Petrović",
                role: UserRole.Administrator,
                passwordHash: adminPasswordHash);

            List<User> teachers =
            [
                CreateUser("teacher1", "milica.jankovic@smartkindergarten.rs", "Milica", "Janković", UserRole.Teacher, teacherPasswordHash),
                CreateUser("teacher2", "nemanja.stojanovic@smartkindergarten.rs", "Nemanja", "Stojanović", UserRole.Teacher, teacherPasswordHash),
                CreateUser("teacher3", "ana.nikolic@smartkindergarten.rs", "Ana", "Nikolić", UserRole.Teacher, teacherPasswordHash),
                CreateUser("teacher4", "stefan.ilic@smartkindergarten.rs", "Stefan", "Ilić", UserRole.Teacher, teacherPasswordHash),
                CreateUser("teacher5", "jelena.djordjevic@smartkindergarten.rs", "Jelena", "Đorđević", UserRole.Teacher, teacherPasswordHash),
                CreateUser("teacher6", "nikola.markovic@smartkindergarten.rs", "Nikola", "Marković", UserRole.Teacher, teacherPasswordHash),
                CreateUser("teacher7", "marija.pavlovic@smartkindergarten.rs", "Marija", "Pavlović", UserRole.Teacher, teacherPasswordHash),
                CreateUser("teacher8", "aleksandar.ristic@smartkindergarten.rs", "Aleksandar", "Ristić", UserRole.Teacher, teacherPasswordHash)
            ];

            List<User> administrativeStaff =
            [
                CreateUser("staff1", "ivana.kovacevic@smartkindergarten.rs", "Ivana", "Kovačević", UserRole.AdministrativeStaff, staffPasswordHash),
                CreateUser("staff2", "katarina.vukovic@smartkindergarten.rs", "Katarina", "Vuković", UserRole.AdministrativeStaff, staffPasswordHash),
                CreateUser("staff3", "bojan.lazic@smartkindergarten.rs", "Bojan", "Lazić", UserRole.AdministrativeStaff, staffPasswordHash),
                CreateUser("staff4", "tijana.simic@smartkindergarten.rs", "Tijana", "Simić", UserRole.AdministrativeStaff, staffPasswordHash)
            ];

            context.Users.Add(director);
            context.Users.AddRange(teachers);
            context.Users.AddRange(administrativeStaff);

            context.SystemSettings.AddRange(
                new SystemSettings
                {
                    Key = "KindergartenName",
                    Value = "Vrtić Sunčana Dolina",
                    Description = "Naziv vrtića koji se prikazuje u aplikaciji."
                },
                new SystemSettings
                {
                    Key = "MonthlyFee",
                    Value = MonthlyFee.ToString(CultureInfo.InvariantCulture),
                    Description = "Mesečna članarina po detetu u RSD."
                });

            List<KindergartenGroup> groups =
            [
                new KindergartenGroup
                {
                    Name = "Mlađa grupa Zvezdice",
                    Description = "Grupa za decu mlađeg uzrasta, sa naglaskom na adaptaciju, igru i osnovne socijalne navike."
                },
                new KindergartenGroup
                {
                    Name = "Srednja grupa Pčelice",
                    Description = "Grupa za decu srednjeg uzrasta, sa naglaskom na samostalnost, govor i zajedničke aktivnosti."
                },
                new KindergartenGroup
                {
                    Name = "Starija grupa Leptirići",
                    Description = "Grupa za stariju decu, sa naglaskom na kreativnost, saradnju i pripremu za predškolski program."
                },
                new KindergartenGroup
                {
                    Name = "Predškolska grupa Sovice",
                    Description = "Predškolska grupa, sa naglaskom na grafomotoriku, logičko razmišljanje i pripremu za školu."
                }
            ];

            context.KindergartenGroups.AddRange(groups);
            await context.SaveChangesAsync();

            Dictionary<int, List<User>> teachersByGroupId = new()
            {
                [groups[0].Id] = [teachers[0], teachers[1], teachers[6], teachers[7]],
                [groups[1].Id] = [teachers[0], teachers[1], teachers[2], teachers[3]],
                [groups[2].Id] = [teachers[2], teachers[3], teachers[4], teachers[5]],
                [groups[3].Id] = [teachers[4], teachers[5], teachers[6], teachers[7]]
            };

            List<TeacherGroup> teacherGroups = [];
            foreach (KindergartenGroup group in groups)
            {
                foreach (User teacher in teachersByGroupId[group.Id])
                {
                    teacherGroups.Add(new TeacherGroup
                    {
                        TeacherId = teacher.Id,
                        Teacher = teacher,
                        GroupId = group.Id,
                        Group = group
                    });
                }
            }

            context.TeacherGroups.AddRange(teacherGroups);
            await context.SaveChangesAsync();

            List<(string FirstName, string LastName, DateTime DateOfBirth)>[] childrenByGroup =
            [
                [
                    ("Luka", "Petrović", UtcDate(2021, 2, 14)),
                    ("Sofija", "Jovanović", UtcDate(2021, 3, 8)),
                    ("Vuk", "Nikolić", UtcDate(2021, 1, 24)),
                    ("Mila", "Marković", UtcDate(2021, 5, 17)),
                    ("Relja", "Đorđević", UtcDate(2021, 4, 2)),
                    ("Dunja", "Stojanović", UtcDate(2021, 6, 11)),
                    ("Filip", "Ilić", UtcDate(2021, 7, 6)),
                    ("Tara", "Pavlović", UtcDate(2021, 8, 19)),
                    ("Ognjen", "Ristić", UtcDate(2021, 9, 25)),
                    ("Lena", "Kovačević", UtcDate(2021, 10, 13)),
                    ("Viktor", "Simić", UtcDate(2021, 11, 7)),
                    ("Sara", "Lazić", UtcDate(2021, 12, 3)),
                    ("Lazar", "Vuković", UtcDate(2021, 2, 27)),
                    ("Nina", "Todorović", UtcDate(2021, 4, 21)),
                    ("Uroš", "Milenković", UtcDate(2021, 6, 29))
                ],
                [
                    ("Petar", "Marković", UtcDate(2020, 1, 9)),
                    ("Una", "Matić", UtcDate(2020, 2, 16)),
                    ("Aleksa", "Savić", UtcDate(2020, 3, 22)),
                    ("Teodora", "Stevanović", UtcDate(2020, 4, 18)),
                    ("Vasilije", "Obradović", UtcDate(2020, 5, 5)),
                    ("Anja", "Milošević", UtcDate(2020, 6, 30)),
                    ("Andrej", "Pantić", UtcDate(2020, 7, 13)),
                    ("Iva", "Živković", UtcDate(2020, 8, 26)),
                    ("Pavle", "Radovanović", UtcDate(2020, 9, 14)),
                    ("Maša", "Kostić", UtcDate(2020, 10, 2)),
                    ("Sergej", "Lukić", UtcDate(2020, 11, 11)),
                    ("Nađa", "Ivanović", UtcDate(2020, 12, 6)),
                    ("Bogdan", "Gajić", UtcDate(2020, 1, 28)),
                    ("Iskra", "Krstić", UtcDate(2020, 3, 4)),
                    ("Matija", "Milić", UtcDate(2020, 5, 23))
                ],
                [
                    ("Marko", "Marković", UtcDate(2019, 1, 15)),
                    ("Petra", "Dimitrijević", UtcDate(2019, 2, 9)),
                    ("Danilo", "Lazarević", UtcDate(2019, 3, 27)),
                    ("Kalina", "Perić", UtcDate(2019, 4, 12)),
                    ("Strahinja", "Radosavljević", UtcDate(2019, 5, 20)),
                    ("Minja", "Vasić", UtcDate(2019, 6, 7)),
                    ("Maksim", "Blagojević", UtcDate(2019, 7, 16)),
                    ("Jana", "Mitrović", UtcDate(2019, 8, 3)),
                    ("Dušan", "Jelić", UtcDate(2019, 9, 29)),
                    ("Hana", "Božić", UtcDate(2019, 10, 10)),
                    ("Kosta", "Antić", UtcDate(2019, 11, 23)),
                    ("Mina", "Mladenović", UtcDate(2019, 12, 15)),
                    ("Viktorija", "Denić", UtcDate(2019, 2, 25)),
                    ("Petar", "Sretenović", UtcDate(2019, 4, 30)),
                    ("Lara", "Milovanović", UtcDate(2019, 6, 18))
                ],
                [
                    ("Matea", "Đukić", UtcDate(2018, 1, 6)),
                    ("Đorđe", "Maksimović", UtcDate(2018, 2, 20)),
                    ("Katarina", "Arsić", UtcDate(2018, 3, 11)),
                    ("Vukan", "Nedeljković", UtcDate(2018, 4, 24)),
                    ("Irina", "Rakić", UtcDate(2018, 5, 14)),
                    ("Damjan", "Cvetković", UtcDate(2018, 6, 28)),
                    ("Nika", "Stanković", UtcDate(2018, 7, 19)),
                    ("Miloš", "Damnjanović", UtcDate(2018, 8, 31)),
                    ("Ema", "Jevtić", UtcDate(2018, 9, 12)),
                    ("Marko", "Marinković", UtcDate(2018, 10, 4)),
                    ("Helena", "Đurić", UtcDate(2018, 11, 17)),
                    ("Sava", "Rajić", UtcDate(2018, 12, 9)),
                    ("Jelena", "Tomić", UtcDate(2018, 1, 27)),
                    ("Ognjena", "Grujić", UtcDate(2018, 3, 21)),
                    ("Milan", "Bojović", UtcDate(2018, 5, 30))
                ]
            ];

            string[] motherNames =
            [
                "Marija", "Jelena", "Ana", "Ivana", "Milena", "Tamara", "Katarina", "Nataša",
                "Sanja", "Dragana", "Maja", "Tijana", "Nevena", "Biljana", "Olivera"
            ];

            string[] fatherNames =
            [
                "Marko", "Nikola", "Milan", "Aleksandar", "Stefan", "Nemanja", "Ivan", "Miloš",
                "Vladimir", "Bojan", "Petar", "Dušan", "Lazar", "Goran", "Dejan"
            ];

            List<User> parentUsers = [];
            List<Child> children = [];
            List<(Child Child, KindergartenGroup Group, List<User> Teachers, int Index)> childInfos = [];
            List<(Child Child, User PrimaryParent, User? SecondaryParent)> parentLinks = [];

            int childIndex = 0;
            int parentCounter = 1;

            User markovicMother = CreateUser(
                username: $"parent{parentCounter:000}",
                email: $"parent{parentCounter:000}@smartkindergarten.rs",
                firstName: "Marija",
                lastName: "Marković",
                role: UserRole.Parent,
                passwordHash: parentPasswordHash);

            parentCounter++;

            User markovicFather = CreateUser(
                username: $"parent{parentCounter:000}",
                email: $"parent{parentCounter:000}@smartkindergarten.rs",
                firstName: "Vojislav",
                lastName: "Marković",
                role: UserRole.Parent,
                passwordHash: parentPasswordHash);

            parentCounter++;
            parentUsers.AddRange([markovicMother, markovicFather]);

            for (int groupIndex = 0; groupIndex < groups.Count; groupIndex++)
            {
                KindergartenGroup group = groups[groupIndex];
                List<User> groupTeachers = teachersByGroupId[group.Id];

                foreach ((string firstName, string lastName, DateTime dateOfBirth) in childrenByGroup[groupIndex])
                {
                    Child child = new Child
                    {
                        FirstName = firstName,
                        LastName = lastName,
                        DateOfBirth = dateOfBirth,
                        Notes = BuildChildNotes(groupIndex),
                        IsActive = true,
                        GroupId = group.Id,
                        Group = group
                    };

                    children.Add(child);

                    bool isMarkovicSibling =
                        lastName == "Marković" &&
                        (firstName == "Mila" || firstName == "Petar" || firstName == "Marko");

                    User primaryParent = markovicMother;
                    User? secondaryParent = markovicFather;

                    if (!isMarkovicSibling)
                    {
                        primaryParent = CreateUser(
                            username: $"parent{parentCounter:000}",
                            email: $"parent{parentCounter:000}@smartkindergarten.rs",
                            firstName: motherNames[childIndex % motherNames.Length],
                            lastName: lastName,
                            role: UserRole.Parent,
                            passwordHash: parentPasswordHash);

                        parentCounter++;
                        parentUsers.Add(primaryParent);

                        secondaryParent = null;
                        if (childIndex % 3 != 0)
                        {
                            secondaryParent = CreateUser(
                                username: $"parent{parentCounter:000}",
                                email: $"parent{parentCounter:000}@smartkindergarten.rs",
                                firstName: fatherNames[childIndex % fatherNames.Length],
                                lastName: lastName,
                                role: UserRole.Parent,
                                passwordHash: parentPasswordHash);

                            parentCounter++;
                            parentUsers.Add(secondaryParent);
                        }
                    }

                    parentLinks.Add((child, primaryParent, secondaryParent));
                    childInfos.Add((child, group, groupTeachers, childIndex));
                    childIndex++;
                }
            }

            context.Users.AddRange(parentUsers);
            context.Children.AddRange(children);
            await context.SaveChangesAsync();

            List<ParentChild> parentChildren = [];
            foreach ((Child child, User primaryParent, User? secondaryParent) in parentLinks)
            {
                parentChildren.Add(new ParentChild
                {
                    ParentId = primaryParent.Id,
                    Parent = primaryParent,
                    ChildId = child.Id,
                    Child = child
                });

                if (secondaryParent != null)
                {
                    parentChildren.Add(new ParentChild
                    {
                        ParentId = secondaryParent.Id,
                        Parent = secondaryParent,
                        ChildId = child.Id,
                        Child = child
                    });
                }
            }

            context.ParentChildren.AddRange(parentChildren);
            await context.SaveChangesAsync();

            List<DevelopmentAssessment> assessments = [];
            List<DevelopmentNote> notes = [];

            foreach ((Child child, KindergartenGroup group, List<User> groupTeachers, int index) in childInfos)
            {
                User teacher = groupTeachers[index % groupTeachers.Count];
                notes.AddRange(CreateDevelopmentNotes(child, teacher, index));

                for (int areaIndex = 0; areaIndex < DevelopmentAreas.Length; areaIndex++)
                {
                    int previousScore = 0;

                    for (int stepIndex = 0; stepIndex < AssessmentDates.Length; stepIndex++)
                    {
                        int score = CalculateScore(index, areaIndex, stepIndex);
                        DevelopmentArea area = DevelopmentAreas[areaIndex];

                        assessments.Add(new DevelopmentAssessment
                        {
                            ChildId = child.Id,
                            Child = child,
                            TeacherId = teacher.Id,
                            Teacher = teacher,
                            Area = area,
                            Score = score,
                            Comment = BuildAssessmentComment(area, score, previousScore, stepIndex),
                            AssessmentDate = AssessmentDates[stepIndex]
                        });

                        previousScore = score;
                    }
                }
            }

            context.DevelopmentNotes.AddRange(notes);
            context.DevelopmentAssessments.AddRange(assessments);
            await context.SaveChangesAsync();

            context.Attendances.AddRange(CreateAttendances(childInfos));
            context.DailyReports.AddRange(CreateDailyReports(groups, teachersByGroupId));
            context.Payments.AddRange(CreatePayments(childInfos, administrativeStaff));
            context.Notifications.AddRange(CreateNotifications(
                director,
                teachersByGroupId,
                groups,
                parentLinks,
                parentUsers,
                teachers,
                administrativeStaff));

            await context.SaveChangesAsync();
        }

        private static User CreateUser(
            string username,
            string email,
            string firstName,
            string lastName,
            UserRole role,
            string passwordHash)
        {
            return new User
            {
                Username = username,
                Email = email,
                PasswordHash = passwordHash,
                FirstName = firstName,
                LastName = lastName,
                Role = role,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
        }

        private static List<DevelopmentNote> CreateDevelopmentNotes(
            Child child,
            User teacher,
            int childIndex)
        {
            string[] firstNotes =
            [
                "Na početku posmatranja dete se postepeno uključuje u zajedničke aktivnosti i traži dodatnu podršku pri promeni aktivnosti.",
                "Dete se dobro adaptira na ritam grupe i pokazuje spremnost da prihvati jednostavna pravila uz podsećanje.",
                "Uočava se interesovanje za igru sa vršnjacima, uz povremenu potrebu za podrškom vaspitača."
            ];

            string[] secondNotes =
            [
                "Primećuje se veća sigurnost u svakodnevnim rutinama. Dete češće samostalno započinje aktivnost i lakše prihvata dogovor.",
                "Napredak je vidljiv u komunikaciji sa decom iz grupe. Dete jasnije izražava potrebe i bolje prati kraće instrukcije.",
                "Dete pokazuje više strpljenja u grupnim zadacima i lakše završava aktivnost koju je započelo."
            ];

            string[] thirdNotes =
            [
                "U poslednjem periodu dete pokazuje stabilniji napredak, bolju koncentraciju i više samopouzdanja u radu.",
                "Dete se aktivnije uključuje u radionice, sigurnije komunicira sa vršnjacima i prihvata pohvalu kao dodatnu motivaciju.",
                "Vidljiv je kontinuitet u razvoju; dete bolje sarađuje, samostalnije rešava jednostavne zadatke i sigurnije nastupa pred grupom."
            ];

            return
            [
                new DevelopmentNote
                {
                    ChildId = child.Id,
                    Child = child,
                    TeacherId = teacher.Id,
                    Teacher = teacher,
                    Content = firstNotes[childIndex % firstNotes.Length],
                    CreatedAt = UtcDate(2026, 1, 12)
                },
                new DevelopmentNote
                {
                    ChildId = child.Id,
                    Child = child,
                    TeacherId = teacher.Id,
                    Teacher = teacher,
                    Content = secondNotes[childIndex % secondNotes.Length],
                    CreatedAt = UtcDate(2026, 3, 9)
                },
                new DevelopmentNote
                {
                    ChildId = child.Id,
                    Child = child,
                    TeacherId = teacher.Id,
                    Teacher = teacher,
                    Content = thirdNotes[childIndex % thirdNotes.Length],
                    CreatedAt = UtcDate(2026, 5, 18)
                }
            ];
        }

        private static List<Attendance> CreateAttendances(
            List<(Child Child, KindergartenGroup Group, List<User> Teachers, int Index)> childInfos)
        {
            DateTime[] dates =
            {
                UtcDate(2026, 6, 1), UtcDate(2026, 6, 2), UtcDate(2026, 6, 3), UtcDate(2026, 6, 4), UtcDate(2026, 6, 5),
                UtcDate(2026, 6, 8), UtcDate(2026, 6, 9), UtcDate(2026, 6, 10), UtcDate(2026, 6, 11), UtcDate(2026, 6, 12)
            };

            List<Attendance> attendances = [];

            foreach ((Child child, KindergartenGroup group, List<User> teachers, int index) in childInfos)
            {
                User recordedBy = teachers[index % teachers.Count];

                for (int dateIndex = 0; dateIndex < dates.Length; dateIndex++)
                {
                    bool isPresent = ((index + dateIndex) % 9) != 0;

                    attendances.Add(new Attendance
                    {
                        ChildId = child.Id,
                        Child = child,
                        Date = dates[dateIndex],
                        IsPresent = isPresent,
                        RecordedById = recordedBy.Id,
                        RecordedBy = recordedBy
                    });
                }
            }

            return attendances;
        }

        private static List<DailyReport> CreateDailyReports(
            List<KindergartenGroup> groups,
            Dictionary<int, List<User>> teachersByGroupId)
        {
            DateTime[] reportDates =
            {
                UtcDate(2026, 1, 16), UtcDate(2026, 1, 30), UtcDate(2026, 2, 13), UtcDate(2026, 2, 27), UtcDate(2026, 3, 13),
                UtcDate(2026, 3, 27), UtcDate(2026, 4, 10), UtcDate(2026, 4, 24), UtcDate(2026, 5, 8), UtcDate(2026, 5, 22)
            };

            string[] titles =
            {
                "Kreativna radionica i zajednička igra",
                "Aktivnosti za razvoj govora i pažnje",
                "Muzičke igre i pokret",
                "Likovne aktivnosti i rad u paru",
                "Igre za razvoj motorike",
                "Pričaonica i razgovor o emocijama",
                "Istraživačke aktivnosti u grupi",
                "Vežbe samostalnosti i saradnje",
                "Tematski dan o prirodi",
                "Priprema za završne aktivnosti"
            };

            string[] contents =
            {
                "Deca su učestvovala u kreativnoj radionici i kroz zajedničku igru vežbala dogovor, deljenje materijala i strpljenje.",
                "Radili smo kraće govorne igre, imenovanje pojmova i prepričavanje jednostavnih situacija iz svakodnevnog života.",
                "Kroz muzičke igre i pokret deca su razvijala koordinaciju, ritam i sigurnije uključivanje u grupne aktivnosti.",
                "U likovnoj radionici deca su radila u paru, dogovarala izbor boja i vežbala pažljivo završavanje započetog rada.",
                "Aktivnosti su bile usmerene na finu i grubu motoriku kroz poligone, slagalice i igre preciznosti.",
                "Razgovarali smo o emocijama i načinima da se nesporazumi reše razgovorom i traženjem pomoći od odraslih.",
                "Deca su posmatrala promene u prirodi i kroz jednostavne zadatke razvijala zaključivanje i pažnju.",
                "Vežbali smo samostalno odlaganje stvari, pripremu za obrok i poštovanje redosleda aktivnosti u grupi.",
                "Tematski dan je bio posvećen biljkama, životinjama i pravilima ponašanja u prirodi.",
                "Deca su ponavljala pesmice, kratke recitacije i zajedničke igre koje će biti prikazane roditeljima."
            };

            List<DailyReport> reports = [];

            foreach (KindergartenGroup group in groups)
            {
                List<User> teachers = teachersByGroupId[group.Id];

                for (int i = 0; i < reportDates.Length; i++)
                {
                    User teacher = teachers[i % teachers.Count];

                    reports.Add(new DailyReport
                    {
                        GroupId = group.Id,
                        Group = group,
                        TeacherId = teacher.Id,
                        Teacher = teacher,
                        Title = titles[i],
                        Content = contents[i],
                        ImageUrl = null,
                        ReportDate = reportDates[i]
                    });
                }
            }

            return reports;
        }

        private static List<Payment> CreatePayments(
            List<(Child Child, KindergartenGroup Group, List<User> Teachers, int Index)> childInfos,
            List<User> staff)
        {
            List<Payment> payments = [];

            foreach ((Child child, KindergartenGroup group, List<User> teachers, int index) in childInfos)
            {
                User recordedBy = staff[index % staff.Count];

                AddPaymentIfPositive(payments, child, recordedBy, MonthlyFee, UtcDate(2026, 1, 10), "Uplata članarine za januar.");
                AddPaymentIfPositive(payments, child, recordedBy, index % 5 == 0 ? 10000m : MonthlyFee, UtcDate(2026, 2, 10), index % 5 == 0 ? "Delimična uplata članarine za februar." : "Uplata članarine za februar.");
                AddPaymentIfPositive(payments, child, recordedBy, index % 7 == 0 ? 30000m : MonthlyFee, UtcDate(2026, 3, 10), index % 7 == 0 ? "Uplata za mart sa pretplatom za naredni period." : "Uplata članarine za mart.");

                if (index % 4 != 0)
                {
                    AddPaymentIfPositive(payments, child, recordedBy, MonthlyFee, UtcDate(2026, 4, 10), "Uplata članarine za april.");
                }

                AddPaymentIfPositive(payments, child, recordedBy, index % 6 == 0 ? 20000m : MonthlyFee, UtcDate(2026, 5, 10), index % 6 == 0 ? "Uplata članarine za maj sa manjom pretplatom." : "Uplata članarine za maj.");

                if (index % 8 != 0)
                {
                    AddPaymentIfPositive(payments, child, recordedBy, MonthlyFee, UtcDate(2026, 6, 10), "Uplata članarine za jun.");
                }
            }

            return payments;
        }

        private static void AddPaymentIfPositive(
            List<Payment> payments,
            Child child,
            User recordedBy,
            decimal amount,
            DateTime paymentDate,
            string description)
        {
            if (amount <= 0)
            {
                return;
            }

            payments.Add(new Payment
            {
                ChildId = child.Id,
                Child = child,
                Amount = amount,
                PaymentDate = paymentDate,
                Description = description,
                RecordedById = recordedBy.Id,
                RecordedBy = recordedBy
            });
        }

        private static List<Notification> CreateNotifications(
            User director,
            Dictionary<int, List<User>> teachersByGroupId,
            List<KindergartenGroup> groups,
            List<(Child Child, User PrimaryParent, User? SecondaryParent)> parentLinks,
            List<User> parentUsers,
            List<User> teachers,
            List<User> staff)
        {
            List<Notification> notifications = [];

            List<User> allEmployees = teachers.Concat(staff).ToList();
            notifications.Add(CreateNotification(
                sender: director,
                title: "Plan aktivnosti za drugo polugodište",
                content: "Molimo zaposlene da do kraja nedelje provere raspored aktivnosti i unesu eventualne napomene za svoje grupe.",
                createdAt: UtcDate(2026, 1, 8),
                recipients: allEmployees));

            notifications.Add(CreateNotification(
                sender: staff[0],
                title: "Podsetnik za uplatu članarine",
                content: "Poštovani roditelji, molimo vas da članarinu za tekući mesec izmirite do 15. u mesecu. Za dodatne informacije možete se obratiti administraciji vrtića.",
                createdAt: UtcDate(2026, 2, 5),
                recipients: parentUsers));

            notifications.Add(CreateNotification(
                sender: staff[1],
                title: "Ažuriranje kontakt podataka",
                content: "Molimo roditelje da provere da li su kontakt podaci u sistemu tačni, kako bi obaveštenja stizala na odgovarajuće adrese.",
                createdAt: UtcDate(2026, 3, 3),
                recipients: parentUsers));

            foreach (KindergartenGroup group in groups)
            {
                User teacher = teachersByGroupId[group.Id][0];

                List<User> groupParents = parentLinks
                    .Where(link => link.Child.GroupId == group.Id)
                    .SelectMany(link => link.SecondaryParent == null
                        ? new[] { link.PrimaryParent }
                        : new[] { link.PrimaryParent, link.SecondaryParent })
                    .DistinctBy(user => user.Id)
                    .ToList();

                notifications.Add(CreateNotification(
                    sender: teacher,
                    title: $"Obaveštenje za grupu {group.Name}",
                    content: "Poštovani roditelji, u narednom periodu planiramo tematske radionice i molimo vas da deca ponesu udobnu odeću za aktivnosti u sali.",
                    createdAt: UtcDate(2026, 4, 7),
                    recipients: groupParents));
            }

            return notifications;
        }

        private static Notification CreateNotification(
            User sender,
            string title,
            string content,
            DateTime createdAt,
            List<User> recipients)
        {
            Notification notification = new Notification
            {
                Title = title,
                Content = content,
                SenderId = sender.Id,
                Sender = sender,
                CreatedAt = createdAt
            };

            notification.Recipients = recipients
                .Where(user => user.Id != sender.Id)
                .DistinctBy(user => user.Id)
                .Select((user, index) => new NotificationRecipient
                {
                    Notification = notification,
                    UserId = user.Id,
                    User = user,
                    IsRead = index % 3 != 0,
                    ReadAt = index % 3 != 0 ? createdAt.AddDays(1) : null
                })
                .ToList();

            return notification;
        }

        private static string BuildChildNotes(int groupIndex)
        {
            return groupIndex switch
            {
                0 => "Dete se postepeno adaptira na grupu i svakodnevne rutine.",
                1 => "Dete pokazuje interesovanje za zajedničke igre i jednostavne zadatke.",
                2 => "Dete aktivno učestvuje u kreativnim i istraživačkim aktivnostima.",
                _ => "Dete se priprema za školske aktivnosti kroz rad na pažnji, grafomotorici i saradnji."
            };
        }

        private static int CalculateScore(int childIndex, int areaIndex, int stepIndex)
        {
            int startScore = 1 + ((childIndex + areaIndex) % 3);
            int plateauOffset = (childIndex + areaIndex) % 2;
            int progress = Math.Max(0, (stepIndex - plateauOffset) / 3);

            if ((childIndex + areaIndex) % 5 == 0 && stepIndex < 4)
            {
                progress = 0;
            }

            return Math.Min(5, startScore + progress);
        }

        private static string BuildAssessmentComment(
            DevelopmentArea area,
            int score,
            int previousScore,
            int stepIndex)
        {
            string areaText = area switch
            {
                DevelopmentArea.SocialSkills => "socijalnim veštinama",
                DevelopmentArea.CognitiveDevelopment => "kognitivnom razvoju",
                DevelopmentArea.MotorSkills => "motoričkim veštinama",
                DevelopmentArea.SpeechLanguageDevelopment => "govorno-jezičkom razvoju",
                _ => "razvoju"
            };

            if (stepIndex == 0)
            {
                return $"Početna procena u oblasti {areaText}. Dete pokazuje osnovni nivo sigurnosti i potrebno je kontinuirano praćenje kroz igru i usmerene aktivnosti.";
            }

            if (score > previousScore)
            {
                return $"Primećen je napredak u oblasti {areaText}. Dete sigurnije učestvuje u aktivnostima i pokazuje veću samostalnost nego u prethodnom periodu.";
            }

            return $"Razvoj u oblasti {areaText} je stabilan. Ocena ostaje ista, ali se primećuju mali pomaci u sigurnosti, koncentraciji i spremnosti da dete ponovi aktivnost.";
        }

        private static DateTime UtcDate(int year, int month, int day)
        {
            return new DateTime(year, month, day, 0, 0, 0, DateTimeKind.Utc);
        }
    }
}

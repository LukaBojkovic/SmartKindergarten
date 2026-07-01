using Microsoft.EntityFrameworkCore;
using SmartKindergarten.Api.Data;
using SmartKindergarten.Api.DTOs.Notifications;
using SmartKindergarten.Api.Models;

namespace SmartKindergarten.Api.Services
{
    public class NotificationService
    {
        private readonly AppDbContext _context;

        public NotificationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<(bool Success, string? Error, List<NotificationResponseDto> Notifications)> GetAllAsync(
            string currentUserRole)
        {
            if (currentUserRole != UserRole.Administrator.ToString())
                return (false, "Samo administrator može da vidi sve notifikacije.", new List<NotificationResponseDto>());

            List<NotificationResponseDto> notifications = await _context.Notifications
                .Include(n => n.Sender)
                .Include(n => n.Recipients)
                    .ThenInclude(r => r.User)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => ToDto(n))
                .ToListAsync();

            return (true, null, notifications);
        }

        public async Task<(bool Success, string? Error, NotificationResponseDto? Notification)> GetByIdAsync(
            int id,
            int currentUserId,
            string currentUserRole)
        {
            Notification? notification = await _context.Notifications
                .Include(n => n.Sender)
                .Include(n => n.Recipients)
                    .ThenInclude(r => r.User)
                .FirstOrDefaultAsync(n => n.Id == id);

            if (notification == null)
                return (false, "Notifikacija nije pronađena.", null);

            bool isAdmin = currentUserRole == UserRole.Administrator.ToString();
            bool isSender = notification.SenderId == currentUserId;
            bool isRecipient = notification.Recipients.Any(r => r.UserId == currentUserId);

            if (!isAdmin && !isSender && !isRecipient)
                return (false, "Nemate pravo pristupa ovoj notifikaciji.", null);

            return (true, null, ToDto(notification));
        }

        public async Task<(bool Success, string? Error, List<NotificationResponseDto> Notifications)> GetMyNotificationsAsync(
            int currentUserId)
        {
            List<NotificationResponseDto> notifications = await _context.Notifications
                .Include(n => n.Sender)
                .Include(n => n.Recipients)
                    .ThenInclude(r => r.User)
                .Where(n =>
                    n.SenderId == currentUserId ||
                    n.Recipients.Any(r => r.UserId == currentUserId))
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => ToDto(n))
                .ToListAsync();

            return (true, null, notifications);
        }

        public async Task<(bool Success, string? Error, List<NotificationResponseDto> Notifications)> GetUnreadNotificationsAsync(
            int currentUserId)
        {
            List<NotificationResponseDto> notifications = await _context.Notifications
                .Include(n => n.Sender)
                .Include(n => n.Recipients)
                    .ThenInclude(r => r.User)
                .Where(n => n.Recipients.Any(r => r.UserId == currentUserId && !r.IsRead))
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => ToDto(n))
                .ToListAsync();

            return (true, null, notifications);
        }

        public async Task<(bool Success, string? Error, NotificationResponseDto? Notification)> CreateAsync(
            CreateNotificationRequestDto request,
            int senderId,
            string currentUserRole)
        {
            if (string.IsNullOrWhiteSpace(request.Title))
                return (false, "Naslov notifikacije je obavezan.", null);

            if (string.IsNullOrWhiteSpace(request.Content))
                return (false, "Sadržaj notifikacije je obavezan.", null);

            if (request.RecipientUserIds == null || !request.RecipientUserIds.Any())
                return (false, "Morate izabrati bar jednog primaoca notifikacije.", null);

            User? sender = await _context.Users.FindAsync(senderId);

            if (sender == null)
                return (false, "Pošiljalac nije pronađen.", null);

            List<int> allowedRecipientIds = await GetAllowedRecipientIdsAsync(senderId, currentUserRole);

            if (!allowedRecipientIds.Any())
                return (false, "Nemate dostupne primaoce za slanje notifikacije.", null);

            List<int> requestedRecipientIds = request.RecipientUserIds
                .Distinct()
                .ToList();

            bool hasForbiddenRecipient = requestedRecipientIds
                .Any(id => !allowedRecipientIds.Contains(id));

            if (hasForbiddenRecipient)
                return (false, "Nemate pravo da pošaljete notifikaciju jednom ili više izabranih korisnika.", null);

            List<User> recipients = await _context.Users
                .Where(u => requestedRecipientIds.Contains(u.Id) && u.IsActive)
                .ToListAsync();

            if (recipients.Count != requestedRecipientIds.Count)
                return (false, "Jedan ili više primaoca nisu pronađeni ili nisu aktivni.", null);

            Notification notification = new Notification
            {
                Title = request.Title.Trim(),
                Content = request.Content.Trim(),
                SenderId = senderId,
                Sender = sender,
                CreatedAt = DateTime.UtcNow,
                Recipients = recipients.Select(user => new NotificationRecipient
                {
                    UserId = user.Id,
                    User = user,
                    IsRead = false,
                    Notification = null!
                }).ToList()
            };

            foreach (NotificationRecipient recipient in notification.Recipients)
            {
                recipient.Notification = notification;
            }

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            Notification? createdNotification = await _context.Notifications
                .Include(n => n.Sender)
                .Include(n => n.Recipients)
                    .ThenInclude(r => r.User)
                .FirstOrDefaultAsync(n => n.Id == notification.Id);

            return (true, null, ToDto(createdNotification!));
        }

        public async Task<(bool Success, string? Error, NotificationResponseDto? Notification)> UpdateAsync(
            int id,
            UpdateNotificationRequestDto request,
            int currentUserId,
            string currentUserRole)
        {
            if (string.IsNullOrWhiteSpace(request.Title))
                return (false, "Naslov notifikacije je obavezan.", null);

            if (string.IsNullOrWhiteSpace(request.Content))
                return (false, "Sadržaj notifikacije je obavezan.", null);

            Notification? notification = await _context.Notifications
                .Include(n => n.Sender)
                .Include(n => n.Recipients)
                    .ThenInclude(r => r.User)
                .FirstOrDefaultAsync(n => n.Id == id);

            if (notification == null)
                return (false, "Notifikacija nije pronađena.", null);

            bool isSender = notification.SenderId == currentUserId;

            if (!isSender)
                return (false, "Nemate pravo da menjate ovu notifikaciju.", null);

            notification.Title = request.Title.Trim();
            notification.Content = request.Content.Trim();

            await _context.SaveChangesAsync();

            return (true, null, ToDto(notification));
        }

        public async Task<(bool Success, string? Error)> MarkAsReadAsync(
            int id,
            int currentUserId)
        {
            NotificationRecipient? recipient = await _context.NotificationRecipients
                .FirstOrDefaultAsync(r => r.NotificationId == id && r.UserId == currentUserId);

            if (recipient == null)
                return (false, "Notifikacija nije pronađena za trenutnog korisnika.");

            recipient.IsRead = true;
            recipient.ReadAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return (true, null);
        }

        public async Task<(bool Success, string? Error)> DeleteAsync(
            int id,
            int currentUserId,
            string currentUserRole)
        {
            Notification? notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id);

            if (notification == null)
                return (false, "Notifikacija nije pronađena.");

            bool isAdmin = currentUserRole == UserRole.Administrator.ToString();
            bool isSender = notification.SenderId == currentUserId;

            if (!isAdmin && !isSender)
                return (false, "Nemate pravo da obrišete ovu notifikaciju.");

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();

            return (true, null);
        }

        private async Task<List<int>> GetAllowedRecipientIdsAsync(
            int senderId,
            string currentUserRole)
        {
            if (currentUserRole == UserRole.Administrator.ToString())
            {
                return await _context.Users
                    .Where(u => u.IsActive && u.Id != senderId)
                    .Select(u => u.Id)
                    .ToListAsync();
            }

            if (currentUserRole == UserRole.AdministrativeStaff.ToString())
            {
                return await _context.ParentChildren
                    .Where(pc =>
                        pc.Child.IsActive &&
                        pc.Parent.IsActive &&
                        pc.Parent.Role == UserRole.Parent)
                    .Select(pc => pc.ParentId)
                    .Distinct()
                    .ToListAsync();
            }

            if (currentUserRole == UserRole.Teacher.ToString())
            {
                return await _context.Children
                    .Where(c =>
                        c.GroupId.HasValue &&
                        _context.TeacherGroups.Any(tg =>
                            tg.TeacherId == senderId &&
                            tg.GroupId == c.GroupId.Value))
                    .SelectMany(c => c.ParentChildren)
                    .Select(pc => pc.ParentId)
                    .Distinct()
                    .ToListAsync();
            }

            return new List<int>();
        }

        private static NotificationResponseDto ToDto(Notification notification)
        {
            return new NotificationResponseDto
            {
                Id = notification.Id,
                Title = notification.Title,
                Content = notification.Content,
                SenderId = notification.SenderId,
                SenderFullName = $"{notification.Sender.FirstName} {notification.Sender.LastName}",
                CreatedAt = notification.CreatedAt,
                Recipients = notification.Recipients.Select(r => new NotificationRecipientResponseDto
                {
                    UserId = r.UserId,
                    RecipientFullName = $"{r.User.FirstName} {r.User.LastName}",
                    IsRead = r.IsRead,
                    ReadAt = r.ReadAt
                }).ToList()
            };
        }
    }
}

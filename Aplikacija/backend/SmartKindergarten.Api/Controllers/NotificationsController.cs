using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartKindergarten.Api.Data;
using SmartKindergarten.Api.DTOs.Notifications;
using SmartKindergarten.Api.Models;

namespace SmartKindergarten.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NotificationsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Administrator,Teacher,AdministrativeStaff")]
        public async Task<ActionResult<List<NotificationResponseDto>>> GetAll()
        {
            var notifications = await _context.Notifications
                .Include(n => n.Recipients)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new NotificationResponseDto
                {
                    Id = n.Id,
                    Title = n.Title,
                    Content = n.Content,
                    SenderId = n.SenderId,
                    CreatedAt = n.CreatedAt,
                    Recipients = n.Recipients.Select(r => new NotificationRecipientResponseDto
                    {
                        UserId = r.UserId,
                        IsRead = r.IsRead,
                        ReadAt = r.ReadAt
                    }).ToList()
                })
                .ToListAsync();

            return Ok(notifications);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<NotificationResponseDto>> GetById(int id)
        {
            var currentUserId = GetCurrentUserId();
            var currentUserRole = GetCurrentUserRole();

            var notification = await _context.Notifications
                .Include(n => n.Recipients)
                .FirstOrDefaultAsync(n => n.Id == id);

            if (notification == null)
                return NotFound("Notifikacija nije pronađena.");

            var isRecipient = notification.Recipients.Any(r => r.UserId == currentUserId);
            var isSender = notification.SenderId == currentUserId;
            var isAdmin = currentUserRole == "Administrator" || currentUserRole == "AdministrativeStaff";

            if (!isRecipient && !isSender && !isAdmin)
                return Forbid();

            var response = new NotificationResponseDto
            {
                Id = notification.Id,
                Title = notification.Title,
                Content = notification.Content,
                SenderId = notification.SenderId,
                CreatedAt = notification.CreatedAt,
                Recipients = notification.Recipients.Select(r => new NotificationRecipientResponseDto
                {
                    UserId = r.UserId,
                    IsRead = r.IsRead,
                    ReadAt = r.ReadAt
                }).ToList()
            };

            return Ok(response);
        }

        [HttpGet("my")]
        public async Task<ActionResult<List<NotificationResponseDto>>> GetMyNotifications()
        {
            var currentUserId = GetCurrentUserId();

            var notifications = await _context.Notifications
                .Include(n => n.Recipients)
                .Where(n => n.Recipients.Any(r => r.UserId == currentUserId))
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new NotificationResponseDto
                {
                    Id = n.Id,
                    Title = n.Title,
                    Content = n.Content,
                    SenderId = n.SenderId,
                    CreatedAt = n.CreatedAt,
                    Recipients = n.Recipients.Select(r => new NotificationRecipientResponseDto
                    {
                        UserId = r.UserId,
                        IsRead = r.IsRead,
                        ReadAt = r.ReadAt
                    }).ToList()
                })
                .ToListAsync();

            return Ok(notifications);
        }

        [HttpGet("unread")]
        public async Task<ActionResult<List<NotificationResponseDto>>> GetUnreadNotifications()
        {
            var currentUserId = GetCurrentUserId();

            var notifications = await _context.Notifications
                .Include(n => n.Recipients)
                .Where(n => n.Recipients.Any(r => r.UserId == currentUserId && !r.IsRead))
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new NotificationResponseDto
                {
                    Id = n.Id,
                    Title = n.Title,
                    Content = n.Content,
                    SenderId = n.SenderId,
                    CreatedAt = n.CreatedAt,
                    Recipients = n.Recipients.Select(r => new NotificationRecipientResponseDto
                    {
                        UserId = r.UserId,
                        IsRead = r.IsRead,
                        ReadAt = r.ReadAt
                    }).ToList()
                })
                .ToListAsync();

            return Ok(notifications);
        }

        [HttpPost]
        [Authorize(Roles = "Administrator,Teacher,AdministrativeStaff")]
        public async Task<ActionResult<NotificationResponseDto>> Create(CreateNotificationRequestDto request)
        {
            if (request.RecipientUserIds == null || !request.RecipientUserIds.Any())
                return BadRequest("Morate izabrati bar jednog primaoca notifikacije.");

            var senderId = GetCurrentUserId();

            var sender = await _context.Users.FindAsync(senderId);
            if (sender == null)
                return BadRequest("Pošiljalac nije pronađen.");

            var recipientIds = request.RecipientUserIds.Distinct().ToList();

            var recipients = await _context.Users
                .Where(u => recipientIds.Contains(u.Id))
                .ToListAsync();

            if (recipients.Count != recipientIds.Count)
                return BadRequest("Jedan ili više primaoca nisu pronađeni.");

            var notification = new Notification
            {
                Title = request.Title,
                Content = request.Content,
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

            foreach (var recipient in notification.Recipients)
            {
                recipient.Notification = notification;
            }

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            var response = new NotificationResponseDto
            {
                Id = notification.Id,
                Title = notification.Title,
                Content = notification.Content,
                SenderId = notification.SenderId,
                CreatedAt = notification.CreatedAt,
                Recipients = notification.Recipients.Select(r => new NotificationRecipientResponseDto
                {
                    UserId = r.UserId,
                    IsRead = r.IsRead,
                    ReadAt = r.ReadAt
                }).ToList()
            };

            return Ok(response);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Administrator,Teacher,AdministrativeStaff")]
        public async Task<ActionResult<NotificationResponseDto>> Update(
            int id,
            UpdateNotificationRequestDto request)
        {
            var currentUserId = GetCurrentUserId();
            var currentUserRole = GetCurrentUserRole();

            var notification = await _context.Notifications
                .Include(n => n.Recipients)
                .FirstOrDefaultAsync(n => n.Id == id);

            if (notification == null)
                return NotFound("Notifikacija nije pronađena.");

            var isAdmin = currentUserRole == "Administrator" || currentUserRole == "AdministrativeStaff";
            var isSender = notification.SenderId == currentUserId;

            if (!isAdmin && !isSender)
                return Forbid();

            notification.Title = request.Title;
            notification.Content = request.Content;

            await _context.SaveChangesAsync();

            var response = new NotificationResponseDto
            {
                Id = notification.Id,
                Title = notification.Title,
                Content = notification.Content,
                SenderId = notification.SenderId,
                CreatedAt = notification.CreatedAt,
                Recipients = notification.Recipients.Select(r => new NotificationRecipientResponseDto
                {
                    UserId = r.UserId,
                    IsRead = r.IsRead,
                    ReadAt = r.ReadAt
                }).ToList()
            };

            return Ok(response);
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var currentUserId = GetCurrentUserId();

            var recipient = await _context.NotificationRecipients
                .FirstOrDefaultAsync(r => r.NotificationId == id && r.UserId == currentUserId);

            if (recipient == null)
                return NotFound("Notifikacija nije pronađena za trenutnog korisnika.");

            recipient.IsRead = true;
            recipient.ReadAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrator,Teacher,AdministrativeStaff")]
        public async Task<IActionResult> Delete(int id)
        {
            var currentUserId = GetCurrentUserId();
            var currentUserRole = GetCurrentUserRole();

            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id);

            if (notification == null)
                return NotFound("Notifikacija nije pronađena.");

            var isAdmin = currentUserRole == "Administrator" || currentUserRole == "AdministrativeStaff";
            var isSender = notification.SenderId == currentUserId;

            if (!isAdmin && !isSender)
                return Forbid();

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private int GetCurrentUserId()
        {
            string? userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userId))
                throw new InvalidOperationException("User ID nije pronađen u tokenu.");

            return int.Parse(userId);
        }

        private string GetCurrentUserRole()
        {
            string? role = User.FindFirstValue(ClaimTypes.Role);

            if (string.IsNullOrWhiteSpace(role))
                throw new InvalidOperationException("Korisnička uloga nije pronađena u tokenu.");

            return role;
        }
    }
}
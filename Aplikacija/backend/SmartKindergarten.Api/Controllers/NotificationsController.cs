using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartKindergarten.Api.DTOs.Notifications;
using SmartKindergarten.Api.Services;

namespace SmartKindergarten.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly NotificationService _notificationService;

        public NotificationsController(NotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult<List<NotificationResponseDto>>> GetAll()
        {
            var result = await _notificationService.GetAllAsync(GetCurrentUserRole());

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Notifications);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<NotificationResponseDto>> GetById(int id)
        {
            var result = await _notificationService.GetByIdAsync(
                id,
                GetCurrentUserId(),
                GetCurrentUserRole());

            if (!result.Success)
                return NotFound(result.Error);

            return Ok(result.Notification);
        }

        [HttpGet("my")]
        public async Task<ActionResult<List<NotificationResponseDto>>> GetMyNotifications()
        {
            var result = await _notificationService.GetMyNotificationsAsync(GetCurrentUserId());

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Notifications);
        }

        [HttpGet("unread")]
        public async Task<ActionResult<List<NotificationResponseDto>>> GetUnreadNotifications()
        {
            var result = await _notificationService.GetUnreadNotificationsAsync(GetCurrentUserId());

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Notifications);
        }

        [HttpPost]
        [Authorize(Roles = "Administrator,Teacher,AdministrativeStaff")]
        public async Task<ActionResult<NotificationResponseDto>> Create(CreateNotificationRequestDto request)
        {
            var result = await _notificationService.CreateAsync(
                request,
                GetCurrentUserId(),
                GetCurrentUserRole());

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Notification);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Administrator,Teacher,AdministrativeStaff")]
        public async Task<ActionResult<NotificationResponseDto>> Update(
            int id,
            UpdateNotificationRequestDto request)
        {
            var result = await _notificationService.UpdateAsync(
                id,
                request,
                GetCurrentUserId(),
                GetCurrentUserRole());

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Notification);
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var result = await _notificationService.MarkAsReadAsync(
                id,
                GetCurrentUserId());

            if (!result.Success)
                return BadRequest(result.Error);

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrator,Teacher,AdministrativeStaff")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _notificationService.DeleteAsync(
                id,
                GetCurrentUserId(),
                GetCurrentUserRole());

            if (!result.Success)
                return BadRequest(result.Error);

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
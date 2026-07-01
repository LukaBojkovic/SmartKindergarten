using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartKindergarten.Api.Data;
using SmartKindergarten.Api.DTOs.Payments;
using SmartKindergarten.Api.Models;

namespace SmartKindergarten.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PaymentsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Administrator,AdministrativeStaff")]
        public async Task<ActionResult<List<PaymentResponseDto>>> GetAll()
        {
            var payments = await _context.Payments
                .Include(p => p.Child)
                .Include(p => p.RecordedBy)
                .OrderByDescending(p => p.PaymentDate)
                .Select(p => ToDto(p))
                .ToListAsync();

            return Ok(payments);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Administrator,AdministrativeStaff,Parent")]
        public async Task<ActionResult<PaymentResponseDto>> GetById(int id)
        {
            var currentUserId = GetCurrentUserId();
            var currentUserRole = GetCurrentUserRole();

            var payment = await _context.Payments
                .Include(p => p.Child)
                    .ThenInclude(c => c.ParentChildren)
                .Include(p => p.RecordedBy)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (payment == null)
                return NotFound("Uplata nije pronađena.");

            if (!CanViewPayment(payment, currentUserId, currentUserRole))
                return Forbid();

            return Ok(ToDto(payment));
        }

        [HttpGet("child/{childId}")]
        [Authorize(Roles = "Administrator,AdministrativeStaff,Parent")]
        public async Task<ActionResult<List<PaymentResponseDto>>> GetByChild(int childId)
        {
            var currentUserId = GetCurrentUserId();
            var currentUserRole = GetCurrentUserRole();

            bool canViewChildFinance = await CanViewChildFinanceAsync(childId, currentUserId, currentUserRole);

            if (!canViewChildFinance)
                return Forbid();

            var payments = await _context.Payments
                .Include(p => p.Child)
                .Include(p => p.RecordedBy)
                .Where(p => p.ChildId == childId)
                .OrderByDescending(p => p.PaymentDate)
                .Select(p => ToDto(p))
                .ToListAsync();

            return Ok(payments);
        }

        [HttpGet("child/{childId}/status")]
        [Authorize(Roles = "Administrator,AdministrativeStaff,Parent")]
        public async Task<ActionResult<ChildFinanceStatusDto>> GetChildFinanceStatus(
            int childId,
            [FromQuery] decimal? expectedAmount)
        {
            var currentUserId = GetCurrentUserId();
            var currentUserRole = GetCurrentUserRole();

            bool canViewChildFinance = await CanViewChildFinanceAsync(childId, currentUserId, currentUserRole);

            if (!canViewChildFinance)
                return Forbid();

            var child = await _context.Children
                .FirstOrDefaultAsync(c => c.Id == childId);

            if (child == null)
                return NotFound("Dete nije pronađeno.");

            var childPayments = await _context.Payments
                .Where(p => p.ChildId == childId)
                .ToListAsync();

            decimal totalPaid = childPayments.Sum(p => p.Amount);

            var status = new ChildFinanceStatusDto
            {
                ChildId = child.Id,
                ChildFullName = $"{child.FirstName} {child.LastName}",
                TotalPaid = totalPaid,
                ExpectedAmount = expectedAmount,
                Balance = expectedAmount.HasValue ? expectedAmount.Value - totalPaid : null,
                PaymentCount = childPayments.Count,
                LastPaymentDate = childPayments
                    .OrderByDescending(p => p.PaymentDate)
                    .Select(p => (DateTime?)p.PaymentDate)
                    .FirstOrDefault()
            };

            return Ok(status);
        }

        [HttpPost]
        [Authorize(Roles = "AdministrativeStaff")]
        public async Task<ActionResult<PaymentResponseDto>> Create(CreatePaymentRequestDto request)
        {
            if (request.Amount <= 0)
                return BadRequest("Iznos uplate mora biti veći od 0.");

            var child = await _context.Children.FindAsync(request.ChildId);

            if (child == null)
                return BadRequest("Dete nije pronađeno.");

            var recordedById = GetCurrentUserId();

            var recordedBy = await _context.Users.FindAsync(recordedById);

            if (recordedBy == null)
                return BadRequest("Korisnik koji evidentira uplatu nije pronađen.");

            var payment = new Payment
            {
                ChildId = request.ChildId,
                Child = child,
                Amount = request.Amount,
                PaymentDate = request.PaymentDate.HasValue
                    ? DateTime.SpecifyKind(request.PaymentDate.Value, DateTimeKind.Utc)
                    : DateTime.UtcNow,
                Description = request.Description,
                RecordedById = recordedById,
                RecordedBy = recordedBy
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            var createdPayment = await _context.Payments
                .Include(p => p.Child)
                .Include(p => p.RecordedBy)
                .FirstOrDefaultAsync(p => p.Id == payment.Id);

            return Ok(ToDto(createdPayment!));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "AdministrativeStaff")]
        public async Task<ActionResult<PaymentResponseDto>> Update(
            int id,
            UpdatePaymentRequestDto request)
        {
            var payment = await _context.Payments
                .Include(p => p.Child)
                .Include(p => p.RecordedBy)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (payment == null)
                return NotFound("Uplata nije pronađena.");

            if (payment.RecordedById != GetCurrentUserId())
                return Forbid();

            if (request.Amount.HasValue)
            {
                if (request.Amount.Value <= 0)
                    return BadRequest("Iznos uplate mora biti veći od 0.");

                payment.Amount = request.Amount.Value;
            }

            if (request.PaymentDate.HasValue)
                payment.PaymentDate = DateTime.SpecifyKind(request.PaymentDate.Value, DateTimeKind.Utc);

            if (request.Description != null)
                payment.Description = request.Description;

            await _context.SaveChangesAsync();

            return Ok(ToDto(payment));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "AdministrativeStaff")]
        public async Task<IActionResult> Delete(int id)
        {
            var payment = await _context.Payments.FindAsync(id);

            if (payment == null)
                return NotFound("Uplata nije pronađena.");

            if (payment.RecordedById != GetCurrentUserId())
                return Forbid();

            _context.Payments.Remove(payment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private async Task<bool> CanViewChildFinanceAsync(
            int childId,
            int currentUserId,
            string currentUserRole)
        {
            if (currentUserRole == UserRole.Administrator.ToString() ||
                currentUserRole == UserRole.AdministrativeStaff.ToString())
            {
                return await _context.Children.AnyAsync(c => c.Id == childId);
            }

            if (currentUserRole == UserRole.Parent.ToString())
            {
                return await _context.ParentChildren
                    .AnyAsync(pc => pc.ChildId == childId && pc.ParentId == currentUserId);
            }

            return false;
        }

        private static bool CanViewPayment(
            Payment payment,
            int currentUserId,
            string currentUserRole)
        {
            if (currentUserRole == UserRole.Administrator.ToString() ||
                currentUserRole == UserRole.AdministrativeStaff.ToString())
            {
                return true;
            }

            if (currentUserRole == UserRole.Parent.ToString())
            {
                return payment.Child.ParentChildren
                    .Any(pc => pc.ParentId == currentUserId);
            }

            return false;
        }

        private static PaymentResponseDto ToDto(Payment payment)
        {
            return new PaymentResponseDto
            {
                Id = payment.Id,
                ChildId = payment.ChildId,
                ChildFullName = $"{payment.Child.FirstName} {payment.Child.LastName}",
                Amount = payment.Amount,
                PaymentDate = payment.PaymentDate,
                Description = payment.Description,
                RecordedById = payment.RecordedById,
                RecordedByFullName = $"{payment.RecordedBy.FirstName} {payment.RecordedBy.LastName}"
            };
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

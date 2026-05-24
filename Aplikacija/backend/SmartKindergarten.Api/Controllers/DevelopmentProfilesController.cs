using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartKindergarten.Api.DTOs.DevelopmentProfiles;
using SmartKindergarten.Api.Services;

namespace SmartKindergarten.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DevelopmentProfilesController : ControllerBase
    {
        private readonly DevelopmentProfileService _developmentProfileService;

        public DevelopmentProfilesController(DevelopmentProfileService developmentProfileService)
        {
            _developmentProfileService = developmentProfileService;
        }

        [HttpGet("children/{childId}/notes")]
        public async Task<ActionResult<List<DevelopmentNoteResponseDto>>> GetNotes(int childId)
        {
            var result = await _developmentProfileService.GetNotesAsync(childId, GetCurrentUserId(), GetCurrentUserRole());

            if (!result.Success)
                return NotFound(result.Error);

            return Ok(result.Notes);
        }

        [HttpPost("children/{childId}/notes")]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<DevelopmentNoteResponseDto>> 
            CreateNote(int childId, CreateDevelopmentNoteRequestDto request)
        {
            var result = await _developmentProfileService.CreateNoteAsync(childId, GetCurrentUserId(), request);

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Note);
        }

        [HttpPut("notes/{noteId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<DevelopmentNoteResponseDto>> 
            UpdateNote(int noteId, UpdateDevelopmentNoteRequestDto request)
        {
            var result = await _developmentProfileService.UpdateNoteAsync(noteId, GetCurrentUserId(), request);

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Note);
        }

        [HttpDelete("notes/{noteId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> DeleteNote(int noteId)
        {
            var result = await _developmentProfileService.DeleteNoteAsync(noteId, GetCurrentUserId());

            if (!result.Success)
                return BadRequest(result.Error);

            return NoContent();
        }

        [HttpGet("children/{childId}/assessments")]
        public async Task<ActionResult<List<DevelopmentAssessmentResponseDto>>> 
            GetAssessments(int childId, [FromQuery] string? area)
        {
            var result = await _developmentProfileService
                .GetAssessmentsAsync(childId, GetCurrentUserId(), GetCurrentUserRole(), area);

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Assessments);
        }

        [HttpPost("children/{childId}/assessments")]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<DevelopmentAssessmentResponseDto>> 
            CreateAssessment(int childId, CreateDevelopmentAssessmentRequestDto request)
        {
            var result = await _developmentProfileService.CreateAssessmentAsync(childId, GetCurrentUserId(), request);

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Assessment);
        }

        [HttpPut("assessments/{assessmentId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<DevelopmentAssessmentResponseDto>> 
            UpdateAssessment(int assessmentId, UpdateDevelopmentAssessmentRequestDto request)
        {
            var result = await _developmentProfileService.UpdateAssessmentAsync(assessmentId, GetCurrentUserId(), request);

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Assessment);
        }

        [HttpDelete("assessments/{assessmentId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> DeleteAssessment(int assessmentId)
        {
            var result = await _developmentProfileService.DeleteAssessmentAsync(assessmentId, GetCurrentUserId());

            if (!result.Success)
                return BadRequest(result.Error);

            return NoContent();
        }

        [HttpGet("children/{childId}/progress")]
        public async Task<ActionResult<List<DevelopmentProgressPointDto>>> GetProgress(int childId, [FromQuery] string? area)
        {
            var result = await _developmentProfileService
                .GetProgressAsync(childId, GetCurrentUserId(), GetCurrentUserRole(), area);

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Points);
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
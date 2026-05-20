using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace SmartKindergarten.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestAccessController : ControllerBase
    {
        [HttpGet("authenticated")]
        [Authorize]
        public IActionResult AuthenticatedOnly()
        {
            return Ok("Pristup dozvoljen za svakog prijavljenog korisnika.");
        }

        [HttpGet("admin")]
        [Authorize(Roles = "Administrator")]
        public IActionResult AdminOnly()
        {
            return Ok("Pristup dozvoljen samo administratoru.");
        }

        [HttpGet("teacher")]
        [Authorize(Roles = "Teacher")]
        public IActionResult TeacherOnly()
        {
            return Ok("Pristup dozvoljen samo vaspitaču.");
        }

        [HttpGet("parent")]
        [Authorize(Roles = "Parent")]
        public IActionResult ParentOnly()
        {
            return Ok("Pristup dozvoljen samo roditelju.");
        }

        [HttpGet("staff")]
        [Authorize(Roles = "AdministrativeStaff")]
        public IActionResult StaffOnly()
        {
            return Ok("Pristup dozvoljen samo administrativnom osoblju.");
        }
    }
}
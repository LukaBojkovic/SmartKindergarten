using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartKindergarten.Api.DTOs.SystemSettings;
using SmartKindergarten.Api.Services;

namespace SmartKindergarten.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SystemSettingsController : ControllerBase
    {
        private readonly SystemSettingsService _systemSettingsService;

        public SystemSettingsController(SystemSettingsService systemSettingsService)
        {
            _systemSettingsService = systemSettingsService;
        }

        [HttpGet]
        [Authorize(Roles = "Administrator,AdministrativeStaff")]
        public async Task<ActionResult<List<SystemSettingResponseDto>>> GetAll()
        {
            var settings = await _systemSettingsService.GetAllAsync();

            return Ok(settings);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Administrator,AdministrativeStaff")]
        public async Task<ActionResult<SystemSettingResponseDto>> GetById(int id)
        {
            var setting = await _systemSettingsService.GetByIdAsync(id);

            if (setting == null)
                return NotFound("Podešavanje nije pronađeno.");

            return Ok(setting);
        }

        [HttpGet("key/{key}")]
        [Authorize(Roles = "Administrator,AdministrativeStaff")]
        public async Task<ActionResult<SystemSettingResponseDto>> GetByKey(string key)
        {
            var setting = await _systemSettingsService.GetByKeyAsync(key);

            if (setting == null)
                return NotFound("Podešavanje nije pronađeno.");

            return Ok(setting);
        }

        [HttpPost]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult<SystemSettingResponseDto>> Create(CreateSystemSettingRequestDto request)
        {
            var result = await _systemSettingsService.CreateAsync(request);

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Setting);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult<SystemSettingResponseDto>> Update(
            int id,
            UpdateSystemSettingRequestDto request)
        {
            var result = await _systemSettingsService.UpdateAsync(id, request);

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Setting);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _systemSettingsService.DeleteAsync(id);

            if (!result.Success)
                return BadRequest(result.Error);

            return NoContent();
        }
    }
}
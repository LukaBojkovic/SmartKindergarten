using Microsoft.EntityFrameworkCore;
using SmartKindergarten.Api.Data;
using SmartKindergarten.Api.DTOs.SystemSettings;
using SmartKindergarten.Api.Models;

namespace SmartKindergarten.Api.Services
{
    public class SystemSettingsService
    {
        private readonly AppDbContext _context;

        public SystemSettingsService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<SystemSettingResponseDto>> GetAllAsync()
        {
            return await _context.SystemSettings
                .OrderBy(s => s.Key)
                .Select(s => ToDto(s))
                .ToListAsync();
        }

        public async Task<SystemSettingResponseDto?> GetByIdAsync(int id)
        {
            SystemSettings? setting = await _context.SystemSettings.FindAsync(id);

            if (setting == null)
                return null;

            return ToDto(setting);
        }

        public async Task<SystemSettingResponseDto?> GetByKeyAsync(string key)
        {
            if (string.IsNullOrWhiteSpace(key))
                return null;

            string normalizedKey = key.Trim();

            SystemSettings? setting = await _context.SystemSettings
                .FirstOrDefaultAsync(s => s.Key == normalizedKey);

            if (setting == null)
                return null;

            return ToDto(setting);
        }

        public async Task<(bool Success, string? Error, SystemSettingResponseDto? Setting)> CreateAsync(
            CreateSystemSettingRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Key))
                return (false, "Ključ podešavanja je obavezan.", null);

            if (string.IsNullOrWhiteSpace(request.Value))
                return (false, "Vrednost podešavanja je obavezna.", null);

            string normalizedKey = request.Key.Trim();

            bool keyExists = await _context.SystemSettings
                .AnyAsync(s => s.Key == normalizedKey);

            if (keyExists)
                return (false, "Podešavanje sa ovim ključem već postoji.", null);

            SystemSettings setting = new SystemSettings
            {
                Key = normalizedKey,
                Value = request.Value.Trim(),
                Description = request.Description
            };

            _context.SystemSettings.Add(setting);
            await _context.SaveChangesAsync();

            return (true, null, ToDto(setting));
        }

        public async Task<(bool Success, string? Error, SystemSettingResponseDto? Setting)> UpdateAsync(
            int id,
            UpdateSystemSettingRequestDto request)
        {
            SystemSettings? setting = await _context.SystemSettings.FindAsync(id);

            if (setting == null)
                return (false, "Podešavanje nije pronađeno.", null);

            if (request.Key != null)
            {
                if (string.IsNullOrWhiteSpace(request.Key))
                    return (false, "Ključ podešavanja ne sme biti prazan.", null);

                string normalizedKey = request.Key.Trim();

                bool keyExists = await _context.SystemSettings
                    .AnyAsync(s => s.Key == normalizedKey && s.Id != id);

                if (keyExists)
                    return (false, "Podešavanje sa ovim ključem već postoji.", null);

                setting.Key = normalizedKey;
            }

            if (request.Value != null)
            {
                if (string.IsNullOrWhiteSpace(request.Value))
                    return (false, "Vrednost podešavanja ne sme biti prazna.", null);

                setting.Value = request.Value.Trim();
            }

            if (request.Description != null)
                setting.Description = request.Description;

            await _context.SaveChangesAsync();

            return (true, null, ToDto(setting));
        }

        public async Task<(bool Success, string? Error)> DeleteAsync(int id)
        {
            SystemSettings? setting = await _context.SystemSettings.FindAsync(id);

            if (setting == null)
                return (false, "Podešavanje nije pronađeno.");

            _context.SystemSettings.Remove(setting);
            await _context.SaveChangesAsync();

            return (true, null);
        }

        private static SystemSettingResponseDto ToDto(SystemSettings setting)
        {
            return new SystemSettingResponseDto
            {
                Id = setting.Id,
                Key = setting.Key,
                Value = setting.Value,
                Description = setting.Description
            };
        }
    }
}
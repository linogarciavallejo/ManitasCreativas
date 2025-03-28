namespace ManitasCreativas.Infrastructure.Repositories;

using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class ContactoRepository : IContactoRepository
{
    private readonly AppDbContext _context;

    public ContactoRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Contacto?> GetByIdAsync(int id)
    {
        return await _context.Contactos.FindAsync(id);
    }

    public async Task<IEnumerable<Contacto>> GetAllAsync()
    {
        return await _context.Contactos.ToListAsync();
    }

    public async Task AddAsync(Contacto contacto)
    {
        await _context.Contactos.AddAsync(contacto);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Contacto contacto)
    {
        _context.Contactos.Update(contacto);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var contacto = await GetByIdAsync(id);
        if (contacto != null)
        {
            _context.Contactos.Remove(contacto);
            await _context.SaveChangesAsync();
        }
    }
}
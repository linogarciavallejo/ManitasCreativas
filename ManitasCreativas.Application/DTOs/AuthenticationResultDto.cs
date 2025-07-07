namespace ManitasCreativas.Application.DTOs;

public class AuthenticationResultDto
{
    public bool IsSuccessful { get; set; }
    public UsuarioDto? Usuario { get; set; }
    public string? ErrorMessage { get; set; }
    public AuthenticationErrorType ErrorType { get; set; }
}

public enum AuthenticationErrorType
{
    None = 0,
    InvalidCredentials = 1,
    UserInactive = 2,
    UserBlocked = 3
}

﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ManitasCreativas.Application.Interfaces.Services
{
    public interface IEmailService
    {
        public Task SendEmailAsync(string recipientName, string recipientEmail, string teamName, string subject, string body, string? ccName, string? ccEmail);

    }
}

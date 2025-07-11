using MimeKit;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using MailKit.Net.Smtp;
using SmtpClient = MailKit.Net.Smtp.SmtpClient;
using Microsoft.Extensions.Configuration;
using ManitasCreativas.Application.Interfaces.Services;

namespace ManitasCreativas.Infrastructure.Shared.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string recipientName, string recipientEmail, string teamName, string subject, string body, string? ccName, string? ccEmail)
        {
            var message = new MimeMessage();
            var senderEmail = _configuration["EmailConfiguration:SenderEmail"];
            var senderName = _configuration["EmailConfiguration:SenderName"];
            var senderPassword = _configuration["EmailConfiguration:Password"];
            var smtpServer = _configuration["EmailConfiguration:SmtpServer"];
            var smtpPort = int.Parse(_configuration["EmailConfiguration:SmtpPort"] ?? "587");

            message.From.Add(new MailboxAddress(senderName, senderEmail));
            message.To.Add(new MailboxAddress(recipientName, recipientEmail));
            if (!string.IsNullOrEmpty(ccEmail))
            {
                message.Cc.Add(new MailboxAddress(ccName, ccEmail));
            }
            message.Subject = subject;

            body = string.Format(body, recipientName, teamName);

            message.Body = new TextPart("plain")
            {
                Text = body
            };

            using (var client = new SmtpClient())
            {
                await client.ConnectAsync(smtpServer, smtpPort, MailKit.Security.SecureSocketOptions.StartTlsWhenAvailable);
                await client.AuthenticateAsync(senderEmail, senderPassword);

                await client.SendAsync(message);
                await client.DisconnectAsync(true);
            }

            Console.WriteLine("Email sent successfully!");
        }
    }
}

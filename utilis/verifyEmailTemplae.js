const verifyEmailTemplate = ({ name, url }) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p>Dear ${name},</p>
        <p>Thank you for registering with DeshBd Grocery Market Shop. Please verify your email by clicking the button below:</p>

        <table align="center" width="100%" cellspacing="0" cellpadding="0">
            <tr>
                <td align="center" style="padding: 20px;">
                    <a href="${url}" 
                        style="text-decoration: none; background-color: orange; color: white; 
                        padding: 12px 24px; font-size: 16px; border-radius: 5px; 
                        display: inline-block; margin-top: 10px;">
                        Verify Email
                    </a>
                </td>
            </tr>
        </table>

        <p>If you didn’t request this, please ignore this email.</p>
        <p>Best regards,</p>
        <p><strong>DashBd Team</strong></p>
        <p><strong>Maharun Nesa Puspo</strong></p>
        <p><strong>Admin</strong></p>
    </body>
    </html>
    `;
};

module.exports = verifyEmailTemplate;

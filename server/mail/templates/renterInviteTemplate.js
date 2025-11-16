exports.renterInviteTemplate = (landlordName, inviteLink) => {
	return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="UTF-8">
        <title>Renter Invitation from Roomly</title>
        <style>
            body {
                background-color: #ffffff;
                font-family: Arial, sans-serif;
                font-size: 16px;
                line-height: 1.4;
                color: #333333;
                margin: 0;
                padding: 0;
            }
    
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
            }
    
            .logo {
                max-width: 200px;
                margin-bottom: 20px;
            }
    
            .message {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
            }
    
            .body {
                font-size: 16px;
                margin-bottom: 20px;
                text-align: left;
            }
    
            .cta {
                display: inline-block;
                padding: 12px 24px;
                background-color: #FFD60A;
                color: #000000;
                text-decoration: none;
                border-radius: 5px;
                font-size: 16px;
                font-weight: bold;
                margin-top: 20px;
            }
    
            .support {
                font-size: 14px;
                color: #999999;
                margin-top: 20px;
            }
        </style>
    
    </head>
    
    <body>
        <div class="container">
            <div class="message">You've been invited to Roomly!</div>
            <div class="body">
                <p>Hello,</p>
                <p><strong>${landlordName}</strong> has invited you to join Roomly as a renter.</p>
                <p>Click the button below to accept the invitation and create your account:</p>
                <div style="text-align: center;">
                    <a href="${inviteLink}" class="cta">Accept Invitation</a>
                </div>
                <p style="margin-top: 20px;">This invitation link will expire in 7 days.</p>
                <p>If you did not expect this invitation, you can safely ignore this email.</p>
            </div>
            <div class="support">If you have any questions, please contact us at <a href="mailto:erankitkr011@gmail.com">erankitkr011@gmail.com</a></div>
        </div>
    </body>
    
    </html>`;
};


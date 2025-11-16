exports.passwordResetTemplate = (resetLink) => {
	return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="UTF-8">
        <title>Password Reset Request - Roomly</title>
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
    
            .warning {
                background-color: #fff3cd;
                border: 1px solid #ffc107;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
                color: #856404;
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
            <div class="message">Password Reset Request</div>
            <div class="body">
                <p>Hello,</p>
                <p>We received a request to reset your password for your Roomly account.</p>
                <p>Click the button below to reset your password:</p>
                <div style="text-align: center;">
                    <a href="${resetLink}" class="cta">Reset Password</a>
                </div>
                <div class="warning">
                    <strong>Important:</strong> This link will expire in 1 hour. If you did not request a password reset, please ignore this email and your password will remain unchanged.
                </div>
            </div>
            <div class="support">If you have any questions, please contact us at <a href="mailto:erankitkr011@gmail.com">erankitkr011@gmail.com</a></div>
        </div>
    </body>
    
    </html>`;
};


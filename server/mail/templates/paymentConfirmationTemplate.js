exports.paymentConfirmationTemplate = (renterName, amount, billMonth, paymentMethod) => {
	return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="UTF-8">
        <title>Payment Confirmation - Roomly</title>
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
                color: #28a745;
            }
    
            .body {
                font-size: 16px;
                margin-bottom: 20px;
                text-align: left;
            }
    
            .details {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
    
            .detail-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #dee2e6;
            }
    
            .detail-row:last-child {
                border-bottom: none;
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
            <div class="message">Payment Confirmed ✓</div>
            <div class="body">
                <p>Dear ${renterName},</p>
                <p>Your payment has been successfully received.</p>
                <div class="details">
                    <div class="detail-row">
                        <strong>Amount:</strong>
                        <span>₹${amount}</span>
                    </div>
                    <div class="detail-row">
                        <strong>Bill Month:</strong>
                        <span>${billMonth}</span>
                    </div>
                    <div class="detail-row">
                        <strong>Payment Method:</strong>
                        <span>${paymentMethod}</span>
                    </div>
                </div>
                <p>Thank you for your payment. You can download the invoice from your dashboard.</p>
            </div>
            <div class="support">If you have any questions, please contact us at <a href="mailto:erankitkr011@gmail.com">erankitkr011@gmail.com</a></div>
        </div>
    </body>
    
    </html>`;
};


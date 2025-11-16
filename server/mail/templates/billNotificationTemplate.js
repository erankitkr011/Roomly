exports.billNotificationTemplate = (renterName, billMonth, totalAmount, dueDate) => {
	return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="UTF-8">
        <title>New Bill Generated - Roomly</title>
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
    
            .amount {
                font-size: 24px;
                font-weight: bold;
                color: #dc3545;
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
            <div class="message">New Bill Generated</div>
            <div class="body">
                <p>Dear ${renterName},</p>
                <p>A new bill has been generated for your property.</p>
                <div class="details">
                    <div class="detail-row">
                        <strong>Bill Month:</strong>
                        <span>${billMonth}</span>
                    </div>
                    <div class="detail-row">
                        <strong>Total Amount:</strong>
                        <span class="amount">₹${totalAmount}</span>
                    </div>
                    ${dueDate ? `<div class="detail-row">
                        <strong>Due Date:</strong>
                        <span>${dueDate}</span>
                    </div>` : ''}
                </div>
                <p>Please review and pay the bill from your dashboard.</p>
                <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/renter/bills" class="cta">View Bill</a>
                </div>
            </div>
            <div class="support">If you have any questions, please contact your landlord or reach out to us at <a href="mailto:erankitkr011@gmail.com">erankitkr011@gmail.com</a></div>
        </div>
    </body>
    
    </html>`;
};


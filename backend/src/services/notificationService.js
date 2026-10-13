const nodemailer = require('nodemailer');

// Create reusable transporter if SMTP credentials are provided
let transporter = null;

function getTransporter() {
    if (transporter) return transporter;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    return transporter;
}

const FROM_ADDRESS = process.env.FROM_EMAIL 
    ? `"${process.env.FROM_NAME || 'Vastra Marketplace'}" <${process.env.FROM_EMAIL}>` 
    : '"Vastra Marketplace" <no-reply@vastra.in>';

/**
 * Generic email sender with fallback to console logging
 */
async function sendEmail({ to, subject, html, text }) {
    try {
        const mailer = getTransporter();
        if (mailer) {
            const info = await mailer.sendMail({
                from: FROM_ADDRESS,
                to,
                subject,
                text: text || html.replace(/<[^>]*>?/gm, ''),
                html,
            });
            console.log(`[Notification] Email sent to ${to}: ${info.messageId}`);
            return { success: true, messageId: info.messageId };
        } else {
            console.log(`[Notification Mock] Email to: ${to} | Subject: "${subject}"`);
            console.log(`[Notification Mock Body]:\n${text || html.replace(/<[^>]*>?/gm, '')}`);
            return { success: true, mock: true };
        }
    } catch (err) {
        console.error(`[Notification Error] Failed to send email to ${to}:`, err.message);
        return { success: false, error: err.message };
    }
}

/**
 * Send 6-digit OTP verification email
 */
async function sendOtpEmail({ to, name, otp, purpose = 'Verification' }) {
    const subject = `Your Vastra OTP: ${otp} (Valid for 10 minutes)`;
    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #8B5CF6, #6D28D9); padding: 28px; text-align: center; color: #ffffff;">
                <h1 style="margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 1px;">VASTRA</h1>
                <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Custom Tailoring Marketplace</p>
            </div>
            <div style="padding: 32px 28px; color: #1f2937;">
                <p style="font-size: 16px; margin: 0 0 16px;">Hello <strong>${name || 'there'}</strong>,</p>
                <p style="font-size: 15px; color: #4b5563; line-height: 1.5; margin: 0 0 24px;">
                    Use the one-time passcode below to complete your ${purpose.toLowerCase()}. This code is valid for <strong>10 minutes</strong>.
                </p>
                <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 0 0 24px;">
                    <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #6D28D9;">${otp}</span>
                </div>
                <p style="font-size: 13px; color: #6b7280; line-height: 1.4; margin: 0;">
                    If you did not request this OTP, you can safely ignore this email. Never share your OTP with anyone.
                </p>
            </div>
            <div style="background: #fafafa; border-top: 1px solid #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
                &copy; ${new Date().getFullYear()} Vastra Marketplace. Handcrafted bespoke tailoring across India.
            </div>
        </div>
    `;
    return sendEmail({ to, subject, html });
}

/**
 * Send Welcome notification to newly registered users
 */
async function sendWelcomeEmail({ to, name, role = 'customer' }) {
    const isTailor = role === 'tailor';
    const subject = isTailor 
        ? 'Welcome to the Vastra Artisan Community!' 
        : 'Welcome to Vastra – Bespoke Tailoring at Your Doorstep';

    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #8B5CF6, #6D28D9); padding: 28px; text-align: center; color: #ffffff;">
                <h1 style="margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 1px;">VASTRA</h1>
                <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">${isTailor ? 'Artisan Partner Platform' : 'Bespoke Tailoring Marketplace'}</p>
            </div>
            <div style="padding: 32px 28px; color: #1f2937;">
                <p style="font-size: 16px; margin: 0 0 16px;">Namaste <strong>${name}</strong>,</p>
                <p style="font-size: 15px; color: #4b5563; line-height: 1.5; margin: 0 0 20px;">
                    ${isTailor 
                        ? 'Thank you for registering as a master tailor on Vastra! Complete your profile with your specializations, workshop address, and UPI ID to start receiving custom stitching orders from customers across India.'
                        : 'Welcome to Vastra! You can now explore India\'s top master tailors, customize traditional and western outfits, submit your measurements online, and have tailor-made clothes delivered to your home.'}
                </p>
                <div style="text-align: center; margin: 28px 0;">
                    <a href="${process.env.CLIENT_URL || 'https://vastra-marketplace.vercel.app'}" style="background: #6D28D9; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
                        ${isTailor ? 'Go to Tailor Dashboard' : 'Explore Tailors & Products'}
                    </a>
                </div>
            </div>
            <div style="background: #fafafa; border-top: 1px solid #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
                &copy; ${new Date().getFullYear()} Vastra Marketplace. Handcrafted bespoke tailoring across India.
            </div>
        </div>
    `;
    return sendEmail({ to, subject, html });
}

/**
 * Send Order Confirmation Email
 */
async function sendOrderConfirmationEmail({ to, customerName, order, tailorName }) {
    const subject = `Order Confirmed: #${order._id.toString().slice(-6).toUpperCase()} on Vastra`;
    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 24px; text-align: center; color: #ffffff;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Order Confirmed! 🎉</h1>
                <p style="margin: 4px 0 0; font-size: 14px; opacity: 0.9;">Order #${order._id.toString().slice(-6).toUpperCase()}</p>
            </div>
            <div style="padding: 28px; color: #1f2937;">
                <p style="font-size: 15px; margin: 0 0 16px;">Hello <strong>${customerName}</strong>,</p>
                <p style="font-size: 14px; color: #4b5563; margin: 0 0 20px;">
                    Your custom tailoring order has been confirmed and assigned to <strong>${tailorName || 'our master tailor'}</strong>.
                </p>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr style="background: #f9fafb; border-bottom: 1px solid #e5e7eb; text-align: left; font-size: 13px; color: #6b7280;">
                            <th style="padding: 10px;">Item</th>
                            <th style="padding: 10px; text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(order.items || []).map(item => `
                            <tr style="border-bottom: 1px solid #f3f4f6; font-size: 14px;">
                                <td style="padding: 10px;">${item.name || 'Custom Garment'}</td>
                                <td style="padding: 10px; text-align: right; font-weight: 600;">₹${item.price || item.total || 0}</td>
                            </tr>
                        `).join('')}
                        <tr style="border-top: 2px solid #e5e7eb; font-size: 15px; font-weight: 700;">
                            <td style="padding: 12px 10px;">Total Paid</td>
                            <td style="padding: 12px 10px; text-align: right; color: #059669;">₹${order.totalAmount || order.pricing?.finalTotal || 0}</td>
                        </tr>
                    </tbody>
                </table>

                <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 13px; color: #4b5563;">
                    <p style="margin: 0 0 6px;"><strong>Payment Method:</strong> ${order.paymentMethod || 'Online (UPI / Card)'}</p>
                    <p style="margin: 0 0 6px;"><strong>Status:</strong> ${order.status || 'Confirmed'}</p>
                    <p style="margin: 0;"><strong>Estimated Completion:</strong> ${order.estimatedCompletion ? new Date(order.estimatedCompletion).toLocaleDateString() : '7-10 Business Days'}</p>
                </div>

                <div style="text-align: center;">
                    <a href="${process.env.CLIENT_URL || 'https://vastra-marketplace.vercel.app'}/dashboard/orders/${order._id}" style="background: #6D28D9; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
                        Track Order in Dashboard
                    </a>
                </div>
            </div>
            <div style="background: #fafafa; border-top: 1px solid #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
                &copy; ${new Date().getFullYear()} Vastra Marketplace. For queries, reply to this email or visit our Help Center.
            </div>
        </div>
    `;
    return sendEmail({ to, subject, html });
}

/**
 * Send SMS / WhatsApp notification (simulated with logger, ready for Twilio / MSG91)
 */
async function sendSmsOrWhatsApp({ phone, message, channel = 'sms' }) {
    console.log(`[${channel.toUpperCase()} Notification to ${phone}]: ${message}`);
    // Ready for MSG91 or Twilio integration:
    // if (process.env.MSG91_AUTH_KEY) { ... }
    return { success: true, phone, channel };
}

module.exports = {
    sendEmail,
    sendOtpEmail,
    sendWelcomeEmail,
    sendOrderConfirmationEmail,
    sendSmsOrWhatsApp,
};

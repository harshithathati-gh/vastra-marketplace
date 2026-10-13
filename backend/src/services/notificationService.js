const nodemailer = require('nodemailer');
const https = require('https');

// Create reusable transporter if SMTP credentials are provided
let transporter = null;

function getTransporter() {
    if (transporter) return transporter;

    if (process.env.SMTP_SERVICE && process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
            service: process.env.SMTP_SERVICE,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    } else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
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
    : '"Vastra Marketplace" <orders@vastra.in>';

const CLIENT_BASE_URL = process.env.CLIENT_URL || 'https://vastra-marketplace.vercel.app';

/**
 * Generic email sender with fallback to console logging
 */
async function sendEmail({ to, subject, html, text }) {
    if (!to) return { success: false, error: 'Recipient email missing' };

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
            console.log(`[Notification Email Sent] To: ${to} | Subject: "${subject}" | MsgId: ${info.messageId}`);
            return { success: true, messageId: info.messageId };
        } else {
            console.log(`\n================== [EMAIL DISPATCH SIMULATOR] ==================`);
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`From: ${FROM_ADDRESS}`);
            console.log(`----------------------------------------------------------------`);
            console.log(text || html.replace(/<[^>]*>?/gm, ''));
            console.log(`================================================================\n`);
            return { success: true, mock: true };
        }
    } catch (err) {
        console.error(`[Notification Error] Failed to send email to ${to}:`, err.message);
        return { success: false, error: err.message };
    }
}

/**
 * SMS & WhatsApp notification dispatcher
 * Supports Fast2SMS (Indian Gateway), Twilio, or formatted fallback logging
 */
async function sendSmsOrWhatsApp({ phone, message, channel = 'sms' }) {
    if (!phone) return { success: false, error: 'Phone number missing' };

    const cleanDigits = phone.replace(/[^0-9]/g, '');
    const tenDigitPhone = cleanDigits.length > 10 ? cleanDigits.slice(-10) : cleanDigits;

    // 1. Fast2SMS Integration (Popular Indian SMS Gateway)
    if (process.env.FAST2SMS_API_KEY && channel === 'sms') {
        try {
            const postData = JSON.stringify({
                route: 'v3',
                sender_id: 'TXTIND',
                message,
                language: 'english',
                flash: 0,
                numbers: tenDigitPhone,
            });

            const req = https.request('https://www.fast2sms.com/dev/bulkV2', {
                method: 'POST',
                headers: {
                    'authorization': process.env.FAST2SMS_API_KEY,
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            });
            req.write(postData);
            req.end();
            console.log(`[Fast2SMS Dispatched] +91-${tenDigitPhone}`);
            return { success: true, provider: 'fast2sms', phone: tenDigitPhone };
        } catch (e) {
            console.error('[Fast2SMS Error]', e.message);
        }
    }

    // 2. Fallback Logger (Ready for Live SMS gateway)
    console.log(`\n================== [${channel.toUpperCase()} DISPATCH NOTIFICATION] ==================`);
    console.log(`Recipient: +91 ${tenDigitPhone}`);
    console.log(`Channel: ${channel.toUpperCase()}`);
    console.log(`Message:\n"${message}"`);
    console.log(`===================================================================\n`);

    return { success: true, mock: true, phone: tenDigitPhone, channel };
}

/**
 * Creates 1-click WhatsApp share link for tailors or customer service
 */
function createWhatsAppShareLink({ phone, message }) {
    if (!phone) return '';
    const cleanDigits = phone.replace(/[^0-9]/g, '');
    const fullNumber = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
    return `https://wa.me/${fullNumber}?text=${encodeURIComponent(message)}`;
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
                    <a href="${CLIENT_BASE_URL}" style="background: #6D28D9; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
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
 * 1. Send Order Placed Notification (To Customer)
 */
async function sendOrderPlacedEmail({ to, customerName, order, tailorName }) {
    const orderNum = order._id.toString().slice(-6).toUpperCase();
    const subject = `Order Placed: #${orderNum} - ${order.product?.name || 'Custom Garment'}`;
    const trackingUrl = `${CLIENT_BASE_URL}/dashboard/orders/${order._id}`;

    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #3B82F6, #2563EB); padding: 24px; text-align: center; color: #ffffff;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Order Placed Successfully! 🧵</h1>
                <p style="margin: 4px 0 0; font-size: 14px; opacity: 0.9;">Order #${orderNum}</p>
            </div>
            <div style="padding: 28px; color: #1f2937;">
                <p style="font-size: 15px; margin: 0 0 16px;">Namaste <strong>${customerName}</strong>,</p>
                <p style="font-size: 14px; color: #4b5563; line-height: 1.5; margin: 0 0 20px;">
                    We have received your custom tailoring request and forwarded it to <strong>${tailorName || 'the assigned tailor'}</strong>. The tailor will review your measurements and provide a quote or accept the stitching request shortly.
                </p>

                <div style="background: #f9fafb; border-radius: 8px; padding: 18px; margin-bottom: 24px; border: 1px solid #f3f4f6;">
                    <h3 style="margin: 0 0 12px; font-size: 15px; color: #1e3a8a;">Order Summary</h3>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                        <span style="color: #6b7280;">Garment:</span>
                        <strong style="color: #111827;">${order.product?.name || 'Custom Garment'}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                        <span style="color: #6b7280;">Tailor:</span>
                        <strong style="color: #111827;">${tailorName || 'Master Tailor'}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                        <span style="color: #6b7280;">Delivery Type:</span>
                        <span style="color: #111827; text-transform: capitalize;">${order.deliveryType === 'self_pickup' ? 'Self Pickup at Workshop' : 'Doorstep Courier'}</span>
                    </div>
                    ${order.deliveryAddress?.city ? `
                        <div style="display: flex; justify-content: space-between; font-size: 14px;">
                            <span style="color: #6b7280;">Delivery City:</span>
                            <span style="color: #111827;">${order.deliveryAddress.city}, ${order.deliveryAddress.state || ''}</span>
                        </div>
                    ` : ''}
                </div>

                <div style="text-align: center; margin: 24px 0 12px;">
                    <a href="${trackingUrl}" style="background: #2563EB; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
                        View Order Details
                    </a>
                </div>
            </div>
            <div style="background: #fafafa; border-top: 1px solid #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
                &copy; ${new Date().getFullYear()} Vastra Marketplace. Handcrafted with care in India.
            </div>
        </div>
    `;

    return sendEmail({ to, subject, html });
}

/**
 * 2. Send New Order Alert (To Tailor)
 */
async function sendTailorNewOrderEmail({ to, tailorName, order, customerName }) {
    const orderNum = order._id.toString().slice(-6).toUpperCase();
    const subject = `🔔 New Tailoring Request: #${orderNum} from ${customerName}`;
    const tailorDashboardUrl = `${CLIENT_BASE_URL}/tailor/orders`;

    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #8B5CF6, #6D28D9); padding: 24px; text-align: center; color: #ffffff;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 700;">New Stitching Request Received! ✂️</h1>
                <p style="margin: 4px 0 0; font-size: 14px; opacity: 0.9;">Order #${orderNum}</p>
            </div>
            <div style="padding: 28px; color: #1f2937;">
                <p style="font-size: 15px; margin: 0 0 16px;">Namaste <strong>${tailorName}</strong>,</p>
                <p style="font-size: 14px; color: #4b5563; line-height: 1.5; margin: 0 0 20px;">
                    Customer <strong>${customerName}</strong> has placed a new custom order with your workshop. Please review the customer's design preferences and send a price quote or accept the order.
                </p>

                <div style="background: #f9fafb; border-radius: 8px; padding: 18px; margin-bottom: 24px; border: 1px solid #f3f4f6;">
                    <div style="margin-bottom: 8px; font-size: 14px;"><strong>Garment:</strong> ${order.product?.name || 'Custom Garment'}</div>
                    <div style="margin-bottom: 8px; font-size: 14px;"><strong>Fabric Preference:</strong> ${order.fabricPreference === 'tailor_provided' ? 'Tailor provided' : 'Customer sending fabric'}</div>
                    ${order.specialInstructions ? `<div style="margin-bottom: 8px; font-size: 14px; font-style: italic;"><strong>Customer Notes:</strong> "${order.specialInstructions}"</div>` : ''}
                    ${order.preferredDeliveryDate ? `<div style="font-size: 14px;"><strong>Target Date:</strong> ${new Date(order.preferredDeliveryDate).toLocaleDateString('en-IN')}</div>` : ''}
                </div>

                <div style="text-align: center; margin: 24px 0 12px;">
                    <a href="${tailorDashboardUrl}" style="background: #6D28D9; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
                        Open Tailor Dashboard
                    </a>
                </div>
            </div>
            <div style="background: #fafafa; border-top: 1px solid #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
                &copy; ${new Date().getFullYear()} Vastra Marketplace. Empowering Indian Master Tailors.
            </div>
        </div>
    `;

    return sendEmail({ to, subject, html });
}

/**
 * 3. Send Price Quote Notification (To Customer)
 */
async function sendOrderQuotedEmail({ to, customerName, order, tailorName, quotedPrice, shippingCost, estimatedDelivery }) {
    const orderNum = order._id.toString().slice(-6).toUpperCase();
    const totalAmount = (quotedPrice || 0) + (shippingCost || 0);
    const subject = `Price Quote: ₹${totalAmount} for Order #${orderNum} from ${tailorName}`;
    const orderUrl = `${CLIENT_BASE_URL}/dashboard/orders/${order._id}`;

    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #F59E0B, #D97706); padding: 24px; text-align: center; color: #ffffff;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Price Quote Received 💰</h1>
                <p style="margin: 4px 0 0; font-size: 14px; opacity: 0.9;">Order #${orderNum}</p>
            </div>
            <div style="padding: 28px; color: #1f2937;">
                <p style="font-size: 15px; margin: 0 0 16px;">Hello <strong>${customerName}</strong>,</p>
                <p style="font-size: 14px; color: #4b5563; line-height: 1.5; margin: 0 0 20px;">
                    Master Tailor <strong>${tailorName}</strong> has reviewed your order and provided a custom tailoring quote. Your payment is 100% protected in Vastra Escrow until your garment is stitched to perfection.
                </p>

                <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 18px; margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                        <span>Stitching & Tailoring:</span>
                        <strong>₹${quotedPrice}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                        <span>Shipping & Delivery:</span>
                        <strong>${shippingCost > 0 ? `₹${shippingCost}` : 'FREE'}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-top: 1px dashed #d97706; padding-top: 8px; font-size: 16px; font-weight: 700; color: #92400e;">
                        <span>Total Payable:</span>
                        <span>₹${totalAmount}</span>
                    </div>
                    ${estimatedDelivery ? `
                        <div style="margin-top: 12px; font-size: 13px; color: #78350f;">
                            📅 Estimated Delivery: <strong>${new Date(estimatedDelivery).toLocaleDateString('en-IN')}</strong>
                        </div>
                    ` : ''}
                </div>

                <div style="text-align: center; margin: 24px 0 12px;">
                    <a href="${orderUrl}" style="background: #D97706; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
                        Approve & Pay via UPI / Card
                    </a>
                </div>
            </div>
            <div style="background: #fafafa; border-top: 1px solid #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
                &copy; ${new Date().getFullYear()} Vastra Marketplace. 100% Escrow Protection Guaranteed.
            </div>
        </div>
    `;

    return sendEmail({ to, subject, html });
}

/**
 * 4. Send Order Confirmation Email (Payment Verified / Escrow Secured)
 */
async function sendOrderConfirmationEmail({ to, customerName, order, tailorName }) {
    const orderNum = order._id.toString().slice(-6).toUpperCase();
    const subject = `Payment Confirmed: Order #${orderNum} on Vastra`;
    const orderUrl = `${CLIENT_BASE_URL}/dashboard/orders/${order._id}`;

    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 24px; text-align: center; color: #ffffff;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Order Confirmed & Secured! 🎉</h1>
                <p style="margin: 4px 0 0; font-size: 14px; opacity: 0.9;">Order #${orderNum}</p>
            </div>
            <div style="padding: 28px; color: #1f2937;">
                <p style="font-size: 15px; margin: 0 0 16px;">Hello <strong>${customerName}</strong>,</p>
                <p style="font-size: 14px; color: #4b5563; line-height: 1.5; margin: 0 0 20px;">
                    Your payment of <strong>₹${order.totalAmount || order.quotedPrice || 0}</strong> has been secured in Vastra Escrow. <strong>${tailorName || 'Our master tailor'}</strong> has been notified and has commenced tailoring!
                </p>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr style="background: #f9fafb; border-bottom: 1px solid #e5e7eb; text-align: left; font-size: 13px; color: #6b7280;">
                            <th style="padding: 10px;">Item</th>
                            <th style="padding: 10px; text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid #f3f4f6; font-size: 14px;">
                            <td style="padding: 10px;">${order.product?.name || 'Custom Garment'}</td>
                            <td style="padding: 10px; text-align: right; font-weight: 600;">₹${order.totalAmount || order.quotedPrice || 0}</td>
                        </tr>
                        <tr style="border-top: 2px solid #e5e7eb; font-size: 15px; font-weight: 700;">
                            <td style="padding: 12px 10px;">Total Escrow Secured</td>
                            <td style="padding: 12px 10px; text-align: right; color: #059669;">₹${order.totalAmount || order.quotedPrice || 0}</td>
                        </tr>
                    </tbody>
                </table>

                <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 13px; color: #065f46;">
                    <p style="margin: 0 0 6px;"><strong>Payment Method:</strong> ${order.paymentMethod || 'UPI (Google Pay / BHIM)'}</p>
                    <p style="margin: 0 0 6px;"><strong>Transaction ID:</strong> ${order.upiTransactionId || 'Verified'}</p>
                    <p style="margin: 0;"><strong>Escrow Status:</strong> Funds safely held until delivery & inspection</p>
                </div>

                <div style="text-align: center;">
                    <a href="${orderUrl}" style="background: #059669; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
                        Track Order in Dashboard
                    </a>
                </div>
            </div>
            <div style="background: #fafafa; border-top: 1px solid #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
                &copy; ${new Date().getFullYear()} Vastra Marketplace. For queries, reply to this email or chat via WhatsApp.
            </div>
        </div>
    `;

    return sendEmail({ to, subject, html });
}

/**
 * 5. Send Order Status Update Email (To Customer)
 */
async function sendOrderStatusUpdateEmail({ to, customerName, order, newStatus, tailorName, note, trackingInfo }) {
    const orderNum = order._id.toString().slice(-6).toUpperCase();
    const orderUrl = `${CLIENT_BASE_URL}/dashboard/orders/${order._id}`;

    const STATUS_MAP = {
        accepted: {
            title: 'Order Accepted by Tailor! ✂️',
            bg: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
            desc: `Master Tailor <strong>${tailorName || 'your tailor'}</strong> has accepted your order and begun pattern planning & preparation.`,
        },
        in_progress: {
            title: 'Stitching in Progress! 🪡',
            bg: 'linear-gradient(135deg, #6366F1, #4F46E5)',
            desc: `Your custom garment is actively being stitched and crafted by <strong>${tailorName || 'your tailor'}</strong>.`,
        },
        shipped: {
            title: 'Your Outfit Has Been Shipped! 📦',
            bg: 'linear-gradient(135deg, #06B6D4, #0891B2)',
            desc: `Your handcrafted garment is finished and on its way to your doorstep!`,
        },
        delivered: {
            title: 'Order Delivered! 🎊',
            bg: 'linear-gradient(135deg, #10B981, #059669)',
            desc: `Your custom garment has been marked as delivered. We hope you enjoy the perfect bespoke fit!`,
        },
        rejected: {
            title: 'Order Update: Request Declined',
            bg: 'linear-gradient(135deg, #EF4444, #DC2626)',
            desc: `The tailor was unable to accept this custom request. Any pre-authorized charges will be refunded.`,
        },
        cancelled: {
            title: 'Order Cancelled',
            bg: 'linear-gradient(135deg, #6B7280, #4B5563)',
            desc: `Your order #${orderNum} has been marked as cancelled.`,
        }
    };

    const statusConfig = STATUS_MAP[newStatus] || {
        title: `Order Status Update: ${newStatus}`,
        bg: 'linear-gradient(135deg, #6B7280, #4B5563)',
        desc: `Status of order #${orderNum} updated to ${newStatus}.`,
    };

    const subject = `Order #${orderNum} Status: ${newStatus.toUpperCase().replace('_', ' ')} | Vastra`;

    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <div style="background: ${statusConfig.bg}; padding: 24px; text-align: center; color: #ffffff;">
                <h1 style="margin: 0; font-size: 22px; font-weight: 700;">${statusConfig.title}</h1>
                <p style="margin: 4px 0 0; font-size: 14px; opacity: 0.9;">Order #${orderNum}</p>
            </div>
            <div style="padding: 28px; color: #1f2937;">
                <p style="font-size: 15px; margin: 0 0 16px;">Hello <strong>${customerName}</strong>,</p>
                <p style="font-size: 14px; color: #4b5563; line-height: 1.5; margin: 0 0 20px;">
                    ${statusConfig.desc}
                </p>

                ${note ? `
                    <div style="background: #f9fafb; border-left: 4px solid #6366F1; padding: 12px 16px; margin-bottom: 20px; font-size: 14px; color: #374151;">
                        <strong>Note from Tailor:</strong> "${note}"
                    </div>
                ` : ''}

                ${newStatus === 'shipped' && trackingInfo ? `
                    <div style="background: #ecfeff; border: 1px solid #a5f3fc; border-radius: 8px; padding: 18px; margin-bottom: 24px;">
                        <h4 style="margin: 0 0 10px; color: #0e7490; font-size: 15px;">Tracking Information</h4>
                        <div style="font-size: 14px; margin-bottom: 6px;"><strong>Courier Partner:</strong> ${trackingInfo.courierPartner || 'Direct Courier'}</div>
                        <div style="font-size: 14px; margin-bottom: 12px;"><strong>Tracking Number:</strong> <code style="background: #fff; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${trackingInfo.trackingNumber}</code></div>
                        ${trackingInfo.trackingUrl ? `
                            <a href="${trackingInfo.trackingUrl}" target="_blank" style="background: #0891B2; color: #ffffff; text-decoration: none; padding: 8px 18px; border-radius: 6px; font-weight: 600; font-size: 13px; display: inline-block;">
                                Live Track Package &rarr;
                            </a>
                        ` : ''}
                    </div>
                ` : ''}

                ${newStatus === 'delivered' ? `
                    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: center;">
                        <p style="margin: 0 0 10px; font-size: 14px; color: #166534; font-weight: 600;">How does your outfit fit?</p>
                        <a href="${orderUrl}" style="background: #16a34a; color: #ffffff; text-decoration: none; padding: 10px 22px; border-radius: 6px; font-weight: 600; font-size: 13px; display: inline-block;">
                            Rate & Review Your Tailor ⭐
                        </a>
                    </div>
                ` : ''}

                <div style="text-align: center; margin: 24px 0 12px;">
                    <a href="${orderUrl}" style="background: #4B5563; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
                        View Order in Dashboard
                    </a>
                </div>
            </div>
            <div style="background: #fafafa; border-top: 1px solid #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
                &copy; ${new Date().getFullYear()} Vastra Marketplace. Handcrafted with passion in India.
            </div>
        </div>
    `;

    return sendEmail({ to, subject, html });
}

module.exports = {
    sendEmail,
    sendOtpEmail,
    sendWelcomeEmail,
    sendOrderPlacedEmail,
    sendTailorNewOrderEmail,
    sendOrderQuotedEmail,
    sendOrderConfirmationEmail,
    sendOrderStatusUpdateEmail,
    sendSmsOrWhatsApp,
    createWhatsAppShareLink,
};

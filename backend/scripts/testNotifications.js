require('dotenv').config({ path: './.env' });
const { sendEmail, sendSmsOrWhatsApp } = require('../src/services/notificationService');

async function testNotificationSystem() {
    console.log('====================================================');
    console.log('         VASTRA NOTIFICATION DIAGNOSTIC TOOL        ');
    console.log('====================================================\n');

    console.log('1. Checking Email Configuration:');
    console.log('   SMTP_SERVICE :', process.env.SMTP_SERVICE || '(none)');
    console.log('   SMTP_HOST    :', process.env.SMTP_HOST || '(none)');
    console.log('   SMTP_PORT    :', process.env.SMTP_PORT || '587');
    console.log('   SMTP_USER    :', process.env.SMTP_USER ? `${process.env.SMTP_USER.slice(0, 3)}***@***` : '(NOT SET)');
    console.log('   SMTP_PASS    :', process.env.SMTP_PASS ? '********' : '(NOT SET)');
    console.log('   FROM_EMAIL   :', process.env.FROM_EMAIL || 'orders@vastra.in');

    const testEmailRecipient = process.env.TEST_EMAIL_RECIPIENT || process.env.SMTP_USER || 'vastra123.connect@gmail.com';

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        console.log(`\n[*] Dispatching live test email to: ${testEmailRecipient}...`);
        const emailResult = await sendEmail({
            to: testEmailRecipient,
            subject: 'Vastra Live Test Email: Credentials Verified! 🧵',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; max-width: 500px;">
                    <h2 style="color: #6D28D9;">Vastra Marketplace Notification Test</h2>
                    <p>Namaste! Your SMTP email service is <strong>properly configured and live</strong>.</p>
                    <p style="color: #4b5563;">Timestamp: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
                    <hr style="border: none; border-top: 1px solid #f3f4f6;" />
                    <p style="font-size: 12px; color: #9ca3af;">Vastra Tailoring Marketplace • From local hands to your homes !</p>
                </div>
            `
        });
        if (emailResult.success && !emailResult.mock) {
            console.log('   ✅ Email sent successfully! Message ID:', emailResult.messageId);
        } else if (emailResult.mock) {
            console.log('   ⚠️ Email was simulated (SMTP credentials missing or incomplete).');
        } else {
            console.log('   ❌ Failed to send email:', emailResult.error);
        }
    } else {
        console.log('   ⚠️ SMTP credentials not set in backend/.env yet. Emails will be simulated in console.');
    }

    console.log('\n2. Checking SMS Gateway Configuration:');
    console.log('   FAST2SMS_API_KEY :', process.env.FAST2SMS_API_KEY ? '********' : '(NOT SET)');
    const testPhone = process.env.TEST_PHONE_RECIPIENT || '9490216284';

    if (process.env.FAST2SMS_API_KEY) {
        console.log(`\n[*] Dispatching live test SMS to: +91 ${testPhone}...`);
        const smsResult = await sendSmsOrWhatsApp({
            phone: testPhone,
            message: `Vastra Alert: SMS credentials verified successfully! System is ready for live order notifications.`
        });
        if (smsResult.success && !smsResult.mock) {
            console.log('   ✅ SMS dispatched successfully to gateway!');
        } else {
            console.log('   ⚠️ SMS simulated in console.');
        }
    } else {
        console.log('   ⚠️ FAST2SMS_API_KEY not set in backend/.env yet. SMS alerts will be simulated in console.');
    }

    console.log('\n====================================================');
    console.log('                DIAGNOSTIC COMPLETE                 ');
    console.log('====================================================');
}

testNotificationSystem().catch(console.error);

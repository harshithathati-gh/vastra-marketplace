const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();

    page.on('response', async (response) => {
        const url = response.url();
        if (url.startsWith('https://sdmntprcentralus') && url.includes('/raw?se=')) {
            console.log("Intercepted HD logo response!");
            try {
                const buffer = await response.buffer();
                if (buffer.length > 5000) {
                    fs.writeFileSync('d:/PersonalProjects/Vastra/web/public/logo.png', buffer);
                    console.log("Successfully securely saved logo! Bytes: " + buffer.length);
                    process.exit(0);
                } else {
                    console.log("Ignored small buffer: " + buffer.length);
                }
            } catch (err) {
                console.error("Buffer error:", err);
            }
        }
    });

    try {
        console.log("Navigating to ChatGPT...");
        await page.goto('https://chatgpt.com/s/m_6ab24f9a913081918ac1ccc9a278fcd4', { waitUntil: 'networkidle2' });

        console.log("Clicking the image coordinate to trigger full-res load...");
        await page.mouse.click(490, 223); // Standard pixel coordinate from subagent tests

        await new Promise(r => setTimeout(r, 8000));
    } catch (err) {
        console.error("Puppeteer navigation error:", err);
    }

    console.log("Closing browser.");
    await browser.close();
})();

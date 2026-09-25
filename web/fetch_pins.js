const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    const urls = [
        { id: '1093108140833387077', name: 'trouser_p1.jpg' },
        { id: '923519467372385574', name: 'trouser_p2.jpg' }
    ];

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    for (let u of urls) {
        try {
            console.log(`Fetching ${u.id}...`);
            await page.goto(`https://in.pinterest.com/pin/${u.id}/`, { waitUntil: 'networkidle2', timeout: 30000 });
            await new Promise(r => setTimeout(r, 4000));

            let src = await page.evaluate(() => {
                const img = document.querySelector('div[data-test-id="pin-visual-wrapper"] img') ||
                    document.querySelector('img[src*="736x"]');
                return img ? img.src : null;
            });

            if (src) {
                console.log(`Found image URL for ${u.id}: ${src}`);
                const element = await page.$('div[data-test-id="pin-visual-wrapper"] img') || await page.$('img[src*="736x"]');
                if (element) {
                    await element.screenshot({ path: `d:/PersonalProjects/Vastra/web/public/images/products/${u.name}` });
                    console.log(`Saved screenshot to ${u.name}`);
                }
            } else {
                console.log(`Could not locate image for ${u.id}`);
                await page.screenshot({ path: `d:/PersonalProjects/Vastra/web/public/images/products/debug_${u.name}` });
            }
        } catch (e) {
            console.error(`Error on ${u.id}:`, e.message);
        }
    }

    await browser.close();
})();

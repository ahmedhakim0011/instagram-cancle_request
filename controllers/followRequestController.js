const puppeteer = require('puppeteer');
const FollowRequestModel = require('../models/followRequestModel');

// Controller to handle the Instagram login and cancellation process
const FollowRequestController = {
    cancelFollowRequests: async (req, res) => {
        const file = req.file;
        const credentials = req.body;

        if (!file || !credentials.username || !credentials.password) {
            return res.status(400).send("Missing file or credentials");
        }

        try {
            const usernames = FollowRequestModel.parseFollowRequests(file.path);

            const browser = await puppeteer.launch({ headless: false });
            const page = await browser.newPage();
            await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle2' });

            // Log in to Instagram
            await page.type('input[name="username"]', credentials.username);
            await page.type('input[name="password"]', credentials.password);
            await page.click('button[type="submit"]');
            await page.waitForNavigation({ waitUntil: 'networkidle2' });

            // Loop through and cancel follow requests
            for (const username of usernames) {
                if (!username) continue;
                console.log(`Processing ${username}`);
                await page.goto(`https://www.instagram.com/${username}/`, { waitUntil: 'networkidle2' });

                // Check for 'Requested' button
                const cancelButton = await page.evaluate(() => {
                    const buttons = Array.from(document.querySelectorAll('button'));
                    return buttons.find(button => button.textContent.includes('Requested'));
                });

                if (cancelButton) {
                    await cancelButton.click();
                    console.log(`Follow request cancelled for ${username}`);
                } else {
                    console.log(`No follow request found for ${username}`);
                }
            }

            await browser.close();
            res.send('Follow requests canceled');
        } catch (error) {
            console.error(error);
            res.status(500).send('An error occurred');
        }
    }
};

module.exports = FollowRequestController;

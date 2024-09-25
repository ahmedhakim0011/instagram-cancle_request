

const puppeteer = require('puppeteer');
const fs = require('fs');

// Load JSON file
const followRequests = JSON.parse(fs.readFileSync('follow_requests.json', 'utf-8'));

// Extract usernames from the JSON data
const usernames = followRequests.relationships_follow_requests_sent
    .map(request => request.string_list_data[0].value);

(async () => {
    // Launch the browser
    const browser = await puppeteer.launch({ headless: false }); // Set headless: true for no UI
    const page = await browser.newPage();

    // Go to Instagram login page
    await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle2' });

    // Wait for the login form to load and input credentials
    await page.waitForSelector('input[name="username"]');
    await page.type('input[name="username"]', 'instagram_user_name', { delay: 100 });
    await page.type('input[name="password"]', 'instagram_password', { delay: 100 });

    // Click login button and wait for navigation
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Loop through usernames and cancel follow requests
    for (const username of usernames) {
        if (!username) continue; // Skip empty lines

        try {
            console.log(`Processing ${username}`);
            
            // Go to the user's profile
            await page.goto(`https://www.instagram.com/${username}/`, { waitUntil: 'networkidle2' });

            // Wait for the 'Requested' button to appear
            await page.waitForSelector('button', { timeout: 5000 });

            // Click the 'Requested' button to trigger the unfollow action
            const requestedButtonClicked = await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const requestedButton = buttons.find(button => button.textContent.includes('Requested'));
                if (requestedButton) {
                    requestedButton.click();
                    return true;
                }
                return false;
            });

            if (requestedButtonClicked) {
                console.log(`Requested button clicked for ${username}`);

                // Wait for the 'Unfollow' button to appear
                await page.waitForSelector('button', { timeout: 5000 });

                // Click the 'Unfollow' button to remove the follow request
                const unfollowButtonClicked = await page.evaluate(() => {
                    const buttons = Array.from(document.querySelectorAll('button'));
                    const unfollowButton = buttons.find(button => button.textContent.includes('Unfollow'));
                    if (unfollowButton) {
                        unfollowButton.click();
                        return true;
                    }
                    return false;
                });

                if (unfollowButtonClicked) {
                    console.log(`Follow request cancelled for ${username}`);
                } else {
                    console.log(`Unfollow button not found for ${username}`);
                }
            } else {
                console.log(`No follow request found for ${username}`);
            }

            // Wait between requests to avoid being flagged for spam
            await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
        } catch (error) {
            console.error(`Error processing ${username}: ${error.message}`);
        }
    }

    // Close the browser after completing the task
    await browser.close();
})();



const fs = require('fs');

// Model to handle the uploaded file and parse it
const FollowRequestModel = {
    parseFollowRequests: (filePath) => {
        try {
            const fileData = fs.readFileSync(filePath, 'utf-8');
            const followRequests = JSON.parse(fileData);
            const usernames = followRequests.relationships_follow_requests_sent.map(req => req.string_list_data[0].value);
            return usernames;
        } catch (error) {
            throw new Error('Error parsing follow requests file');
        }
    }
};

module.exports = FollowRequestModel;

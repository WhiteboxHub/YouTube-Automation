const { getAuthToken } = require('./apiAuth');

async function testAuth() {
    try {
        console.log('Testing WhiteBox Learning API authentication...\n');

        const token = await getAuthToken();

        console.log('\n✅ Authentication successful!');
        console.log('Token (first 50 chars):', token.substring(0, 50) + '...');

        return true;
    } catch (error) {
        console.error('\n❌ Authentication failed!');
        console.error('Error:', error.message);

        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }

        return false;
    }
}

// Run the test
testAuth().then(success => {
    process.exit(success ? 0 : 1);
});

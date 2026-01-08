const { createRecording, createSession, getRecordings, getSessions } = require('./apiClient');

async function testApiClient() {
    console.log('🧪 Testing WhiteBox Learning API Client\n');

    let passed = 0;
    let failed = 0;

    // Test 1: Get Recordings
    try {
        console.log('Test 1: Fetching recordings...');
        const recordings = await getRecordings();
        console.log(`✅ Success! Found ${recordings.length} recordings`);
        if (recordings.length > 0) {
            console.log('   Sample recording:', {
                id: recordings[0].id,
                filename: recordings[0].filename,
                subject: recordings[0].subject
            });
        }
        passed++;
    } catch (error) {
        console.error('❌ Failed:', error.message);
        failed++;
    }

    console.log('');

    // Test 2: Get Sessions
    try {
        console.log('Test 2: Fetching sessions...');
        const sessions = await getSessions();
        console.log(`✅ Success! Found ${sessions.length} sessions`);
        if (sessions.length > 0) {
            console.log('   Sample session:', {
                sessionid: sessions[0].sessionid,
                title: sessions[0].title,
                type: sessions[0].type
            });
        }
        passed++;
    } catch (error) {
        console.error('❌ Failed:', error.message);
        failed++;
    }

    console.log('');

    // Test 3: Search Recordings
    try {
        console.log('Test 3: Searching recordings (search: "Class")...');
        const searchResults = await getRecordings('Class');
        console.log(`✅ Success! Found ${searchResults.length} matching recordings`);
        passed++;
    } catch (error) {
        console.error('❌ Failed:', error.message);
        failed++;
    }

    console.log('');

    // Summary
    console.log('═══════════════════════════════════════');
    console.log(`Tests Passed: ${passed}`);
    console.log(`Tests Failed: ${failed}`);
    console.log('═══════════════════════════════════════');

    if (failed === 0) {
        console.log('\n✅ All API tests passed! The API integration is working correctly.');
        return true;
    } else {
        console.log('\n⚠️  Some tests failed. Please check your API configuration.');
        return false;
    }
}

// Run the tests
testApiClient().then(success => {
    process.exit(success ? 0 : 1);
});

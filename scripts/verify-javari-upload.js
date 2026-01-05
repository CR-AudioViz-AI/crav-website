#!/usr/bin/env node
// =============================================================================
// JAVARI UPLOAD VERIFICATION SCRIPT
// npm run verify:javari-upload
// =============================================================================

const https = require('https');
const http = require('http');

const BASE_URL = process.env.VERIFY_URL || 'https://craudiovizai.com';

console.log('========================================');
console.log('JAVARI UPLOAD VERIFICATION');
console.log('========================================');
console.log(`Timestamp: ${new Date().toISOString()}`);
console.log(`Target: ${BASE_URL}`);
console.log('');

async function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

async function postJson(url, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(JSON.stringify(body));
    req.end();
  });
}

const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function test(name, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${name}`);
  if (details) console.log(`   ${details}`);
  results.tests.push({ name, passed, details });
  if (passed) results.passed++; else results.failed++;
}

async function run() {
  try {
    // Test 1: Page loads
    console.log('\n--- Test 1: Page Load ---');
    const page = await fetchUrl(`${BASE_URL}/javari`);
    test('Javari page loads', page.status === 200, `Status: ${page.status}`);

    // Test 2: Upload zone present
    console.log('\n--- Test 2: Upload UI ---');
    const hasUpload = page.data.includes('Drop files') || page.data.includes('upload');
    test('Upload zone present', hasUpload);

    // Test 3: Provider selector
    console.log('\n--- Test 3: Provider Selector ---');
    const hasProviders = page.data.includes('Auto') && page.data.includes('provider');
    test('Provider selector present', hasProviders);

    // Test 4: Document system
    console.log('\n--- Test 4: Document System ---');
    const hasDocs = page.data.toLowerCase().includes('document');
    test('Document system present', hasDocs);

    // Test 5: Citation system
    console.log('\n--- Test 5: Citation System ---');
    const hasCitations = page.data.toLowerCase().includes('citation');
    test('Citation system present', hasCitations);

    // Test 6: Chat interface
    console.log('\n--- Test 6: Chat Interface ---');
    const hasChat = page.data.includes('message') || page.data.includes('Send');
    test('Chat interface present', hasChat);

    // Test 7: API endpoints exist
    console.log('\n--- Test 7: API Endpoints ---');
    try {
      const askResult = await postJson(`${BASE_URL}/api/docs/ask`, { question: 'test' });
      test('Ask API responds', askResult.status === 200, `Status: ${askResult.status}`);
    } catch (e) {
      test('Ask API responds', false, e.message);
    }

    // Test 8: Providers API
    console.log('\n--- Test 8: Providers API ---');
    try {
      const providersResult = await fetchUrl(`${BASE_URL}/api/providers`);
      test('Providers API responds', providersResult.status === 200, `Status: ${providersResult.status}`);
    } catch (e) {
      test('Providers API responds', false, e.message);
    }

  } catch (error) {
    console.error('Verification failed:', error.message);
    results.failed++;
  }

  // Summary
  console.log('\n========================================');
  console.log('VERIFICATION SUMMARY');
  console.log('========================================');
  console.log(`Total: ${results.passed + results.failed}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log('');
  
  if (results.failed === 0) {
    console.log('✅ ALL TESTS PASSED');
    process.exit(0);
  } else {
    console.log('❌ SOME TESTS FAILED');
    process.exit(1);
  }
}

run();

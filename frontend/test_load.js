#!/usr/bin/env node

/**
 * Záťažový test pre SLZA.sk
 * Testuje výkon a stabilitu webovej stránky
 */

const https = require('https');
const http = require('http');

const CONFIG = {
  baseUrl: process.env.TEST_URL || 'http://localhost:3000',
  concurrentUsers: 50,
  requestsPerUser: 10,
  timeoutMs: 10000,
};

const ENDPOINTS = [
  '/',
  '/produkty',
  '/kontakt',
  '/produkt/vizitky',
  '/produkt/letaky',
  '/produkt/nalepky',
  '/produkt/baner',
  '/api/orders/generate-number',
];

class LoadTester {
  constructor() {
    this.results = {
      total: 0,
      success: 0,
      failed: 0,
      timeout: 0,
      totalTime: 0,
      minTime: Infinity,
      maxTime: 0,
      errors: [],
      statusCodes: {},
    };
  }

  async makeRequest(url) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const urlObj = new URL(url);
      const protocol = urlObj.protocol === 'https:' ? https : http;

      const req = protocol.get(url, { timeout: CONFIG.timeoutMs }, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          const endTime = Date.now();
          const duration = endTime - startTime;

          resolve({
            success: true,
            statusCode: res.statusCode,
            duration,
            size: data.length,
          });
        });
      });

      req.on('error', (error) => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        resolve({
          success: false,
          error: error.message,
          duration,
        });
      });

      req.on('timeout', () => {
        req.destroy();
        const endTime = Date.now();
        const duration = endTime - startTime;

        resolve({
          success: false,
          timeout: true,
          duration,
        });
      });
    });
  }

  async runSingleUser(userId) {
    const userResults = [];

    for (let i = 0; i < CONFIG.requestsPerUser; i++) {
      const endpoint = ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)];
      const url = `${CONFIG.baseUrl}${endpoint}`;

      const result = await this.makeRequest(url);
      userResults.push(result);

      this.results.total++;

      if (result.success) {
        this.results.success++;
        this.results.totalTime += result.duration;
        this.results.minTime = Math.min(this.results.minTime, result.duration);
        this.results.maxTime = Math.max(this.results.maxTime, result.duration);

        const code = result.statusCode || 0;
        this.results.statusCodes[code] = (this.results.statusCodes[code] || 0) + 1;
      } else {
        this.results.failed++;
        if (result.timeout) {
          this.results.timeout++;
        }
        this.results.errors.push({
          endpoint,
          error: result.error || 'Timeout',
          duration: result.duration,
        });
      }

      // Random delay between requests (100-500ms)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * 400 + 100)
      );
    }

    return userResults;
  }

  async runTest() {
    console.log('🚀 Starting Load Test');
    console.log(`URL: ${CONFIG.baseUrl}`);
    console.log(`Concurrent Users: ${CONFIG.concurrentUsers}`);
    console.log(`Requests per User: ${CONFIG.requestsPerUser}`);
    console.log(`Total Requests: ${CONFIG.concurrentUsers * CONFIG.requestsPerUser}`);
    console.log('─'.repeat(60));

    const startTime = Date.now();

    // Create array of user promises
    const userPromises = [];
    for (let i = 0; i < CONFIG.concurrentUsers; i++) {
      userPromises.push(this.runSingleUser(i));
    }

    // Run all users concurrently
    await Promise.all(userPromises);

    const endTime = Date.now();
    const totalDuration = (endTime - startTime) / 1000;

    this.printResults(totalDuration);
  }

  printResults(totalDuration) {
    console.log('\n📊 Test Results');
    console.log('─'.repeat(60));
    console.log(`Total Requests: ${this.results.total}`);
    console.log(`✅ Successful: ${this.results.success} (${((this.results.success / this.results.total) * 100).toFixed(2)}%)`);
    console.log(`❌ Failed: ${this.results.failed} (${((this.results.failed / this.results.total) * 100).toFixed(2)}%)`);
    console.log(`⏱️  Timeout: ${this.results.timeout}`);
    console.log('\n⏱️  Response Times:');
    console.log(`   Average: ${(this.results.totalTime / this.results.success).toFixed(2)}ms`);
    console.log(`   Min: ${this.results.minTime}ms`);
    console.log(`   Max: ${this.results.maxTime}ms`);
    console.log('\n📈 Performance Metrics:');
    console.log(`   Total Duration: ${totalDuration.toFixed(2)}s`);
    console.log(`   Requests/sec: ${(this.results.total / totalDuration).toFixed(2)}`);
    console.log('\n📊 Status Codes:');
    Object.entries(this.results.statusCodes)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([code, count]) => {
        console.log(`   ${code}: ${count}`);
      });

    if (this.results.errors.length > 0) {
      console.log('\n❌ Errors (first 10):');
      this.results.errors.slice(0, 10).forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.endpoint}`);
        console.log(`      Error: ${error.error}`);
        console.log(`      Duration: ${error.duration}ms`);
      });
    }

    console.log('\n' + '─'.repeat(60));

    // Assessment
    const successRate = (this.results.success / this.results.total) * 100;
    const avgResponseTime = this.results.totalTime / this.results.success;

    console.log('\n🎯 Assessment:');
    if (successRate >= 99 && avgResponseTime < 1000) {
      console.log('   ✅ EXCELLENT - Website performs very well under load');
    } else if (successRate >= 95 && avgResponseTime < 2000) {
      console.log('   ✅ GOOD - Website performs well with minor issues');
    } else if (successRate >= 90 && avgResponseTime < 3000) {
      console.log('   ⚠️  FAIR - Website has some performance issues');
    } else {
      console.log('   ❌ POOR - Website has significant performance problems');
    }

    if (avgResponseTime > 3000) {
      console.log('   ⚠️  Warning: Average response time is too high (>3s)');
    }
    if (this.results.timeout > 0) {
      console.log(`   ⚠️  Warning: ${this.results.timeout} requests timed out`);
    }
    if (successRate < 95) {
      console.log('   ⚠️  Warning: Success rate is below 95%');
    }
  }
}

// Run the test
const tester = new LoadTester();
tester.runTest().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});

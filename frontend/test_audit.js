#!/usr/bin/env node

/**
 * Audit nástroj pre SLZA.sk
 * Kontroluje SEO, výkon, bezpečnosť a prístupnosť
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

class WebsiteAuditor {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.results = {
      seo: [],
      performance: [],
      security: [],
      accessibility: [],
      errors: [],
    };
  }

  async fetchPage(path) {
    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}${path}`;
      const urlObj = new URL(url);
      const protocol = urlObj.protocol === 'https:' ? https : http;

      const startTime = Date.now();
      const req = protocol.get(url, { timeout: 10000 }, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          const endTime = Date.now();
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
            duration: endTime - startTime,
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  checkSEO(page, html) {
    const issues = [];

    // Check title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (!titleMatch) {
      issues.push({ severity: 'high', message: 'Missing <title> tag', page });
    } else {
      const title = titleMatch[1];
      if (title.length < 30) {
        issues.push({ severity: 'medium', message: `Title too short (${title.length} chars)`, page });
      } else if (title.length > 60) {
        issues.push({ severity: 'low', message: `Title too long (${title.length} chars)`, page });
      }
    }

    // Check meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (!descMatch) {
      issues.push({ severity: 'high', message: 'Missing meta description', page });
    } else {
      const desc = descMatch[1];
      if (desc.length < 120) {
        issues.push({ severity: 'medium', message: `Meta description too short (${desc.length} chars)`, page });
      } else if (desc.length > 160) {
        issues.push({ severity: 'low', message: `Meta description too long (${desc.length} chars)`, page });
      }
    }

    // Check h1
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (!h1Match) {
      issues.push({ severity: 'medium', message: 'Missing <h1> tag', page });
    }

    // Check canonical
    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*>/i);
    if (!canonicalMatch) {
      issues.push({ severity: 'low', message: 'Missing canonical URL', page });
    }

    // Check Open Graph
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*>/i);
    if (!ogTitleMatch) {
      issues.push({ severity: 'medium', message: 'Missing og:title', page });
    }

    // Check robots meta
    const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*>/i);
    if (robotsMatch && robotsMatch[0].includes('noindex')) {
      issues.push({ severity: 'high', message: 'Page set to noindex', page });
    }

    // Check structured data
    const structuredDataMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>/i);
    if (!structuredDataMatch) {
      issues.push({ severity: 'low', message: 'Missing structured data (JSON-LD)', page });
    }

    // Check image alt texts
    const imgMatches = html.match(/<img[^>]*>/gi) || [];
    let imagesWithoutAlt = 0;
    imgMatches.forEach(img => {
      if (!img.match(/alt=["'][^"']*["']/i)) {
        imagesWithoutAlt++;
      }
    });
    if (imagesWithoutAlt > 0) {
      issues.push({ severity: 'medium', message: `${imagesWithoutAlt} images without alt text`, page });
    }

    return issues;
  }

  checkPerformance(page, response) {
    const issues = [];

    // Response time
    if (response.duration > 3000) {
      issues.push({ severity: 'high', message: `Slow response time: ${response.duration}ms`, page });
    } else if (response.duration > 1000) {
      issues.push({ severity: 'medium', message: `Response time: ${response.duration}ms`, page });
    }

    // Page size
    const sizeKB = response.body.length / 1024;
    if (sizeKB > 1000) {
      issues.push({ severity: 'high', message: `Large page size: ${sizeKB.toFixed(2)} KB`, page });
    } else if (sizeKB > 500) {
      issues.push({ severity: 'medium', message: `Page size: ${sizeKB.toFixed(2)} KB`, page });
    }

    // Check compression
    if (!response.headers['content-encoding']) {
      issues.push({ severity: 'medium', message: 'Compression not enabled', page });
    }

    // Check caching
    if (!response.headers['cache-control']) {
      issues.push({ severity: 'low', message: 'No cache-control header', page });
    }

    return issues;
  }

  checkSecurity(page, response, html) {
    const issues = [];

    // HTTPS
    if (!this.baseUrl.startsWith('https://')) {
      issues.push({ severity: 'high', message: 'Website not using HTTPS', page: 'all' });
    }

    // Security headers
    if (!response.headers['x-frame-options']) {
      issues.push({ severity: 'medium', message: 'Missing X-Frame-Options header', page });
    }

    if (!response.headers['x-content-type-options']) {
      issues.push({ severity: 'medium', message: 'Missing X-Content-Type-Options header', page });
    }

    if (!response.headers['strict-transport-security'] && this.baseUrl.startsWith('https://')) {
      issues.push({ severity: 'medium', message: 'Missing HSTS header', page });
    }

    if (!response.headers['content-security-policy']) {
      issues.push({ severity: 'low', message: 'Missing Content-Security-Policy header', page });
    }

    // Check for inline scripts
    const inlineScripts = (html.match(/<script(?![^>]*src=)[^>]*>/gi) || []).length;
    if (inlineScripts > 5) {
      issues.push({ severity: 'low', message: `${inlineScripts} inline scripts found`, page });
    }

    return issues;
  }

  checkAccessibility(page, html) {
    const issues = [];

    // Check lang attribute
    if (!html.match(/<html[^>]*lang=/i)) {
      issues.push({ severity: 'high', message: 'Missing lang attribute on <html>', page });
    }

    // Check for skip links
    if (!html.match(/skip[- ]to[- ]content/i)) {
      issues.push({ severity: 'low', message: 'Missing skip-to-content link', page });
    }

    // Check heading structure
    const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
    if (h1Count === 0) {
      issues.push({ severity: 'high', message: 'No <h1> heading found', page });
    } else if (h1Count > 1) {
      issues.push({ severity: 'medium', message: `Multiple <h1> headings (${h1Count})`, page });
    }

    // Check form labels
    const inputs = (html.match(/<input[^>]*>/gi) || []).filter(
      input => !input.match(/type=["'](hidden|submit|button)["']/i)
    );
    const labels = (html.match(/<label[^>]*>/gi) || []).length;
    if (inputs.length > labels) {
      issues.push({ severity: 'medium', message: 'Some form inputs may be missing labels', page });
    }

    // Check contrast (basic check for color keywords)
    if (html.match(/color:\s*(white|#fff|#ffffff)/i) && html.match(/background:\s*(white|#fff|#ffffff)/i)) {
      issues.push({ severity: 'low', message: 'Potential contrast issue detected', page });
    }

    return issues;
  }

  async auditPage(path) {
    try {
      console.log(`\n🔍 Auditing: ${path}`);
      const response = await this.fetchPage(path);

      if (response.statusCode !== 200) {
        this.results.errors.push({
          page: path,
          message: `HTTP ${response.statusCode}`,
        });
        return;
      }

      const seoIssues = this.checkSEO(path, response.body);
      const perfIssues = this.checkPerformance(path, response);
      const secIssues = this.checkSecurity(path, response, response.body);
      const a11yIssues = this.checkAccessibility(path, response.body);

      this.results.seo.push(...seoIssues);
      this.results.performance.push(...perfIssues);
      this.results.security.push(...secIssues);
      this.results.accessibility.push(...a11yIssues);

      const totalIssues = seoIssues.length + perfIssues.length + secIssues.length + a11yIssues.length;
      console.log(`   Found ${totalIssues} issues`);
    } catch (error) {
      this.results.errors.push({
        page: path,
        message: error.message,
      });
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 AUDIT RESULTS');
    console.log('='.repeat(60));

    const categories = [
      { name: 'SEO', icon: '🔍', issues: this.results.seo },
      { name: 'Performance', icon: '⚡', issues: this.results.performance },
      { name: 'Security', icon: '🔒', issues: this.results.security },
      { name: 'Accessibility', icon: '♿', issues: this.results.accessibility },
    ];

    categories.forEach(category => {
      console.log(`\n${category.icon} ${category.name.toUpperCase()}`);
      console.log('─'.repeat(60));

      if (category.issues.length === 0) {
        console.log('   ✅ No issues found');
        return;
      }

      const high = category.issues.filter(i => i.severity === 'high');
      const medium = category.issues.filter(i => i.severity === 'medium');
      const low = category.issues.filter(i => i.severity === 'low');

      if (high.length > 0) {
        console.log(`\n   🔴 High Priority (${high.length}):`);
        high.forEach(issue => {
          console.log(`      • ${issue.message} (${issue.page})`);
        });
      }

      if (medium.length > 0) {
        console.log(`\n   🟡 Medium Priority (${medium.length}):`);
        medium.forEach(issue => {
          console.log(`      • ${issue.message} (${issue.page})`);
        });
      }

      if (low.length > 0) {
        console.log(`\n   🟢 Low Priority (${low.length}):`);
        low.forEach(issue => {
          console.log(`      • ${issue.message} (${issue.page})`);
        });
      }
    });

    if (this.results.errors.length > 0) {
      console.log('\n❌ ERRORS');
      console.log('─'.repeat(60));
      this.results.errors.forEach(error => {
        console.log(`   • ${error.page}: ${error.message}`);
      });
    }

    // Overall score
    const totalIssues = this.results.seo.length + this.results.performance.length +
                        this.results.security.length + this.results.accessibility.length;
    const highIssues = [...this.results.seo, ...this.results.performance,
                        ...this.results.security, ...this.results.accessibility]
                        .filter(i => i.severity === 'high').length;

    console.log('\n' + '='.repeat(60));
    console.log('🎯 OVERALL ASSESSMENT');
    console.log('─'.repeat(60));
    console.log(`   Total Issues: ${totalIssues}`);
    console.log(`   High Priority: ${highIssues}`);

    if (highIssues === 0 && totalIssues < 10) {
      console.log('   ✅ EXCELLENT - Website is well optimized');
    } else if (highIssues === 0 && totalIssues < 20) {
      console.log('   ✅ GOOD - Minor improvements recommended');
    } else if (highIssues < 5 && totalIssues < 30) {
      console.log('   ⚠️  FAIR - Several issues need attention');
    } else {
      console.log('   ❌ POOR - Significant improvements needed');
    }

    console.log('='.repeat(60));
  }

  async run() {
    console.log('🚀 Starting Website Audit');
    console.log(`URL: ${this.baseUrl}`);
    console.log('─'.repeat(60));

    const pages = [
      '/',
      '/produkty',
      '/kontakt',
      '/produkt/vizitky',
      '/produkt/letaky',
    ];

    for (const page of pages) {
      await this.auditPage(page);
    }

    this.printResults();
  }
}

// Run the audit
const auditor = new WebsiteAuditor(BASE_URL);
auditor.run().catch(error => {
  console.error('Audit failed:', error);
  process.exit(1);
});

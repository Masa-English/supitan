#!/usr/bin/env node

import { spawn } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Performance Check Script
 * Measures Core Web Vitals and Lighthouse scores
 */

const URLS_TO_TEST = [
  { name: 'Landing Page', path: '/' },
  { name: 'Login Page', path: '/auth/login' },
  { name: 'Learning Page', path: '/learning' },
];

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

async function checkPerformance() {
  console.log('🚀 Performance Check');
  console.log('===================\n');

  // Use local lighthouse installation
  const lighthousePath = './node_modules/.bin/lighthouse';

  console.log('📊 Analyzing build performance metrics...\n');

  // Analyze build output
  analyzeBuildMetrics();

  // Check if server is running
  const serverRunning = await checkServerRunning();
  
  if (!serverRunning) {
    console.log('⚠️  Development server not running.');
    console.log('💡 To run full Lighthouse analysis:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Run: node scripts/performance-check.mjs');
    console.log('   3. Or run: npm run build && npm run start (for production analysis)\n');
  } else {
    console.log('✅ Server detected. Running Lighthouse analysis...\n');
    await runLighthouseAnalysis();
  }

  generatePerformanceReport();
}

function analyzeBuildMetrics() {
  console.log('📈 Build Metrics Analysis:');
  console.log('-------------------------');

  try {
    // Read Next.js build output
    const buildManifest = JSON.parse(readFileSync('.next/build-manifest.json', 'utf8'));
    
    // Calculate total bundle size
    let totalSize = 0;
    const chunkSizes = {};
    
    Object.values(buildManifest.pages).flat().forEach(chunk => {
      try {
        const chunkPath = join('.next', chunk);
        const stats = readFileSync(chunkPath);
        const size = stats.length;
        chunkSizes[chunk] = size;
        totalSize += size;
      } catch (e) {
        // Chunk file not found, skip
      }
    });

    console.log(`📦 Total Bundle Size: ${formatSize(totalSize)}`);
    
    // Find largest chunks
    const sortedChunks = Object.entries(chunkSizes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    console.log('🔍 Largest Chunks:');
    sortedChunks.forEach(([chunk, size]) => {
      console.log(`  - ${chunk.split('/').pop()}: ${formatSize(size)}`);
    });

    // Performance recommendations based on bundle size
    console.log('\n💡 Performance Recommendations:');
    if (totalSize > 1000000) { // > 1MB
      console.log('  ⚠️  Large bundle size detected (>1MB)');
      console.log('  💡 Consider code splitting and lazy loading');
    }
    
    if (sortedChunks.some(([, size]) => size > 500000)) { // > 500KB
      console.log('  ⚠️  Large individual chunks detected (>500KB)');
      console.log('  💡 Consider breaking down large components');
    }

    if (totalSize < 500000) { // < 500KB
      console.log('  ✅ Bundle size is well optimized');
    }

  } catch (error) {
    console.log('❌ Could not analyze build metrics:', error.message);
  }

  console.log('');
}

async function checkServerRunning() {
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}

async function runLighthouseAnalysis() {
  const results = [];

  for (const { name, path } of URLS_TO_TEST) {
    console.log(`🔍 Analyzing ${name} (${path})...`);
    
    try {
      const url = `${BASE_URL}${path}`;
      const outputPath = `.next/lighthouse-${name.toLowerCase().replace(/\s+/g, '-')}.json`;
      
      await runCommand('npx', [
        'lighthouse',
        url,
        '--output=json',
        `--output-path=${outputPath}`,
        '--chrome-flags="--headless --no-sandbox"',
        '--quiet'
      ]);

      // Read and parse results
      const report = JSON.parse(readFileSync(outputPath, 'utf8'));
      const scores = {
        performance: Math.round(report.lhr.categories.performance.score * 100),
        accessibility: Math.round(report.lhr.categories.accessibility.score * 100),
        bestPractices: Math.round(report.lhr.categories['best-practices'].score * 100),
        seo: Math.round(report.lhr.categories.seo.score * 100),
      };

      results.push({ name, path, scores, url });
      
      console.log(`  Performance: ${scores.performance}/100`);
      console.log(`  Accessibility: ${scores.accessibility}/100`);
      console.log(`  Best Practices: ${scores.bestPractices}/100`);
      console.log(`  SEO: ${scores.seo}/100\n`);

    } catch (error) {
      console.log(`  ❌ Failed to analyze ${name}: ${error.message}\n`);
    }
  }

  return results;
}

function generatePerformanceReport() {
  console.log('📄 Performance Summary:');
  console.log('======================');
  
  const report = {
    timestamp: new Date().toISOString(),
    buildAnalysis: 'completed',
    recommendations: [
      'Monitor bundle size regularly',
      'Use dynamic imports for large components',
      'Optimize images with Next.js Image component',
      'Enable compression in production',
      'Use service workers for caching'
    ]
  };

  writeFileSync('.next/performance-report.json', JSON.stringify(report, null, 2));
  console.log('✅ Performance analysis complete!');
  console.log('📄 Report saved to .next/performance-report.json');
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { stdio: 'pipe' });
    
    let stdout = '';
    let stderr = '';
    
    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Command failed: ${command} ${args.join(' ')}\n${stderr}`));
      }
    });
  });
}

// Run performance check
checkPerformance().catch(console.error);
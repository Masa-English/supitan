#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Bundle Analysis Script
 * Analyzes the Next.js build output and generates a report
 */

function analyzeBundleSize() {
  console.log('🔍 Bundle Size Analysis');
  console.log('========================\n');

  try {
    // Read build manifest
    const buildManifest = JSON.parse(
      readFileSync('.next/build-manifest.json', 'utf8')
    );

    // Read app build manifest
    const appBuildManifest = JSON.parse(
      readFileSync('.next/app-build-manifest.json', 'utf8')
    );

    console.log('📊 Build Statistics:');
    console.log('-------------------');

    // Analyze main chunks
    const pages = buildManifest.pages || {};
    const sortedPages = Object.entries(pages).sort((a, b) => {
      const aSize = a[1].reduce((sum, chunk) => sum + getChunkSize(chunk), 0);
      const bSize = b[1].reduce((sum, chunk) => sum + getChunkSize(chunk), 0);
      return bSize - aSize;
    });

    console.log('\n🏠 Top Pages by Bundle Size:');
    sortedPages.slice(0, 10).forEach(([page, chunks]) => {
      const totalSize = chunks.reduce((sum, chunk) => sum + getChunkSize(chunk), 0);
      console.log(`  ${page}: ${formatSize(totalSize)}`);
    });

    // Analyze shared chunks
    console.log('\n📦 Shared Chunks:');
    const sharedChunks = Object.entries(buildManifest.pages)
      .flatMap(([, chunks]) => chunks)
      .reduce((acc, chunk) => {
        acc[chunk] = (acc[chunk] || 0) + 1;
        return acc;
      }, {});

    const sortedSharedChunks = Object.entries(sharedChunks)
      .filter(([, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    sortedSharedChunks.forEach(([chunk, count]) => {
      const size = getChunkSize(chunk);
      console.log(`  ${chunk}: ${formatSize(size)} (used by ${count} pages)`);
    });

    // Check for potential optimizations
    console.log('\n💡 Optimization Recommendations:');
    console.log('--------------------------------');

    const recommendations = [];

    // Check for large individual chunks
    const largeChunks = Object.keys(sharedChunks)
      .map(chunk => ({ chunk, size: getChunkSize(chunk) }))
      .filter(({ size }) => size > 100000) // > 100KB
      .sort((a, b) => b.size - a.size);

    if (largeChunks.length > 0) {
      recommendations.push('🔍 Large chunks detected (>100KB):');
      largeChunks.slice(0, 5).forEach(({ chunk, size }) => {
        recommendations.push(`  - ${chunk}: ${formatSize(size)}`);
      });
    }

    // Check for duplicate dependencies
    const vendorChunks = Object.keys(sharedChunks)
      .filter(chunk => chunk.includes('vendor') || chunk.includes('node_modules'));

    if (vendorChunks.length > 1) {
      recommendations.push('📦 Multiple vendor chunks detected - consider consolidation');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Bundle appears well-optimized!');
    }

    recommendations.forEach(rec => console.log(rec));

    // Generate summary report
    const report = {
      timestamp: new Date().toISOString(),
      totalPages: Object.keys(pages).length,
      sharedChunks: Object.keys(sharedChunks).length,
      largeChunks: largeChunks.length,
      recommendations: recommendations
    };

    writeFileSync('.next/bundle-analysis-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved to .next/bundle-analysis-report.json');

  } catch (error) {
    console.error('❌ Error analyzing bundle:', error.message);
    process.exit(1);
  }
}

function getChunkSize(chunkPath) {
  try {
    const fullPath = join('.next', chunkPath);
    const stats = readFileSync(fullPath);
    return stats.length;
  } catch {
    return 0;
  }
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Run analysis
analyzeBundleSize();
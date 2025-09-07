/**
 * Scripts Directory Index
 * 
 * This directory contains utility scripts organized by category:
 * 
 * ## Development Scripts (./development/)
 * - deploy-check.mjs: Deployment readiness check
 * - update-import-paths.mjs: Update import paths after restructuring
 * 
 * ## Database Scripts (./database/)
 * - db-check.mjs: Database connectivity and health check
 * 
 * ## Audio Scripts (./audio/)
 * - check-audio-storage.mjs: Check audio file storage status
 * - detailed-audio-check.mjs: Detailed audio file analysis
 * - fix-audio-files.mjs: Fix corrupted or missing audio files
 * - fix-audio-paths.mjs: Fix audio file path references
 * - test-audio-paths.mjs: Test audio file path accessibility
 * - update-audio-paths.mjs: Update audio file paths after changes
 * 
 * ## Usage
 * Run scripts from the project root using Node.js:
 * ```bash
 * node scripts/[category]/[script-name].mjs
 * ```
 * 
 * Example:
 * ```bash
 * node scripts/development/deploy-check.mjs
 * node scripts/database/db-check.mjs
 * node scripts/audio/check-audio-storage.mjs
 * ```
 */

export {};
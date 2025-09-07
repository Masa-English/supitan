#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// Import path mappings based on the new folder structure
const importMappings = [
  // Component imports - specific paths first
  { from: '@/components/ui/button', to: '@/components/ui/button' },
  { from: '@/components/ui/card', to: '@/components/ui/card' },
  { from: '@/components/ui/modal', to: '@/components/ui/modal' },
  { from: '@/components/ui/input', to: '@/components/ui/form/input' },
  { from: '@/components/ui/label', to: '@/components/ui/form/label' },
  { from: '@/components/ui/checkbox', to: '@/components/ui/form/checkbox' },
  { from: '@/components/ui/progress', to: '@/components/ui/feedback/progress' },
  { from: '@/components/ui/skeleton', to: '@/components/ui/feedback/skeleton' },
  { from: '@/components/ui/badge', to: '@/components/ui/navigation/badge' },
  { from: '@/components/ui/dropdown-menu', to: '@/components/ui/navigation/dropdown-menu' },
  
  // Auth components
  { from: '@/components/auth', to: '@/components/features/auth' },
  
  // Shared components
  { from: '@/components/shared/theme-switcher', to: '@/components/shared/theme-switcher' },
  { from: '@/components/shared/audio-controls', to: '@/components/shared/audio-controls' },
  { from: '@/components/shared/error-boundary', to: '@/components/shared/error-boundary' },
  { from: '@/components/shared/loading-spinner', to: '@/components/shared/loading-spinner' },
  { from: '@/components/shared/suspense-wrapper', to: '@/components/shared/suspense-wrapper' },
  { from: '@/components/shared/navigation-events', to: '@/components/shared/navigation-events' },
  { from: '@/components/shared/navigation-overlay', to: '@/components/shared/navigation-overlay' },
  { from: '@/components/shared/reload-button', to: '@/components/shared/reload-button' },
  { from: '@/components/shared/contact-form', to: '@/components/shared/contact-form' },
  { from: '@/components/shared/category-badge', to: '@/components/shared/category-badge' },
  { from: '@/components/shared/tutorial-modal', to: '@/components/shared/tutorial-modal' },
  { from: '@/components/shared/statistics-wrapper', to: '@/components/shared/statistics-wrapper' },
  
  // Layout components
  { from: '@/components/layout', to: '@/components/layout' },
  
  // Library imports - specific paths first
  { from: '@/lib/database', to: '@/lib/api/database' },
  { from: '@/lib/api/supabase/client', to: '@/lib/api/supabase/client' },
  { from: '@/lib/api/supabase/server', to: '@/lib/api/supabase/server' },
  { from: '@/lib/stores/user-store', to: '@/lib/stores/user-store' },
  { from: '@/lib/stores/data-store', to: '@/lib/stores/data-store' },
  { from: '@/lib/stores/audio-store', to: '@/lib/stores/audio-store' },
  { from: '@/lib/stores/ui-store', to: '@/lib/stores/ui-store' },
  { from: '@/lib/stores/navigation-store', to: '@/lib/stores/navigation-store' },
  { from: '@/lib/stores/settings-store', to: '@/lib/stores/settings-store' },
  { from: '@/lib/stores', to: '@/lib/stores' },
  { from: '@/lib/hooks/use-auth', to: '@/lib/hooks/use-auth' },
  { from: '@/lib/hooks/use-learning', to: '@/lib/hooks/use-learning' },
  { from: '@/lib/hooks/use-page-data', to: '@/lib/hooks/use-page-data' },
  { from: '@/lib/hooks/use-audio', to: '@/lib/hooks/use-audio' },
  { from: '@/lib/hooks/use-local-storage', to: '@/lib/hooks/use-local-storage' },
  { from: '@/lib/utils', to: '@/lib/utils' },
  { from: '@/lib/types', to: '@/lib/types' },
  { from: '@/lib/constants', to: '@/lib/constants' },
  { from: '@/lib/categories', to: '@/lib/constants/categories' },
  { from: '@/lib/static-data', to: '@/lib/constants/static-data' },
  { from: '@/lib/audio-utils', to: '@/lib/utils/audio' },
  { from: '@/lib/error-handling', to: '@/lib/utils/error-handling' },
  { from: '@/lib/performance-monitor', to: '@/lib/utils/performance' },
  { from: '@/lib/auth/session-utils', to: '@/lib/auth/session-utils' },
  { from: '@/lib/contexts', to: '@/lib/contexts' },
];

function getAllFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = [];
  
  function traverse(currentDir) {
    const items = readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = join(currentDir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and .git directories
        if (item !== 'node_modules' && item !== '.git' && item !== '.next') {
          traverse(fullPath);
        }
      } else if (extensions.includes(extname(item))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function updateImportsInFile(filePath) {
  try {
    let content = readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    for (const mapping of importMappings) {
      // Handle both single and double quotes, and different import styles
      const patterns = [
        // import { ... } from '...'
        new RegExp(`(import\\s+{[^}]*}\\s+from\\s+['"])${mapping.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"])`, 'g'),
        // import ... from '...'
        new RegExp(`(import\\s+[^{][^']*\\s+from\\s+['"])${mapping.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"])`, 'g'),
        // import('...')
        new RegExp(`(import\\s*\\(\\s*['"])${mapping.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"]\\s*\\))`, 'g'),
      ];
      
      for (const pattern of patterns) {
        const newContent = content.replace(pattern, `$1${mapping.to}$2`);
        if (newContent !== content) {
          content = newContent;
          hasChanges = true;
        }
      }
    }
    
    if (hasChanges) {
      writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('Starting import path updates...');
  
  const files = getAllFiles('.');
  let updatedCount = 0;
  
  for (const file of files) {
    if (updateImportsInFile(file)) {
      updatedCount++;
    }
  }
  
  console.log(`\nCompleted! Updated ${updatedCount} files out of ${files.length} total files.`);
}

main();
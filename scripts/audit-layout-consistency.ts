#!/usr/bin/env tsx

/**
 * Layout Consistency Audit Script
 *
 * This script audits all pages in the application to ensure they follow
 * standardized layout patterns and use the PageLayout component consistently.
 */

import { readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { readFileSync } from 'fs';

interface LayoutIssue {
  page: string;
  issue: string;
  severity: 'low' | 'medium' | 'high';
  suggestion?: string;
}

interface PageAnalysis {
  name: string;
  path: string;
  usesLayout: boolean;
  usesPageLayout: boolean;
  hasCustomLayout: boolean;
  layoutPattern: string;
  issues: LayoutIssue[];
}

/**
 * Analyze a single page file
 */
function analyzePage(filePath: string): PageAnalysis {
  const content = readFileSync(filePath, 'utf-8');
  const fileName = filePath.split('/').pop()?.replace('.tsx', '') || '';

  const analysis: PageAnalysis = {
    name: fileName,
    path: filePath,
    usesLayout: false,
    usesPageLayout: false,
    hasCustomLayout: false,
    layoutPattern: 'unknown',
    issues: []
  };

  // Check for Layout component usage
  if (content.includes('import.*Layout.*from.*layout/Layout') || content.includes('<Layout')) {
    analysis.usesLayout = true;
  }

  // Check for PageLayout component usage
  if (content.includes('import.*PageLayout.*from.*layout/PageLayout') || content.includes('<PageLayout')) {
    analysis.usesPageLayout = true;
  }

  // Detect custom layout patterns
  const customPatterns = [
    /min-h-screen.*bg-/,
    /max-w-7xl.*mx-auto.*px-/,
    /container.*mx-auto.*px-/,
    /py-8.*min-h-screen/
  ];

  analysis.hasCustomLayout = customPatterns.some(pattern => pattern.test(content));

  // Determine layout pattern
  if (analysis.usesPageLayout) {
    analysis.layoutPattern = 'standardized';
  } else if (analysis.usesLayout) {
    analysis.layoutPattern = 'legacy-layout';
  } else if (analysis.hasCustomLayout) {
    analysis.layoutPattern = 'custom-inline';
  } else {
    analysis.layoutPattern = 'minimal';
  }

  // Generate issues
  if (!analysis.usesPageLayout && !analysis.usesLayout) {
    if (analysis.hasCustomLayout) {
      analysis.issues.push({
        page: fileName,
        issue: 'Uses custom inline layout instead of standardized PageLayout',
        severity: 'high',
        suggestion: 'Replace custom layout with <PageLayout> component'
      });
    } else {
      analysis.issues.push({
        page: fileName,
        issue: 'Missing layout wrapper - content renders without consistent structure',
        severity: 'medium',
        suggestion: 'Wrap content with <PageLayout> or <Layout> component'
      });
    }
  }

  if (analysis.usesLayout && !analysis.usesPageLayout) {
    analysis.issues.push({
      page: fileName,
      issue: 'Uses legacy Layout component instead of standardized PageLayout',
      severity: 'low',
      suggestion: 'Consider migrating to PageLayout for consistency'
    });
  }

  return analysis;
}

/**
 * Find all page files in the pages directory
 */
function findPageFiles(dirPath: string): string[] {
  const files: string[] = [];

  function scanDir(currentPath: string) {
    const items = readdirSync(currentPath);

    for (const item of items) {
      const fullPath = join(currentPath, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (stat.isFile() && extname(item) === '.tsx') {
        files.push(fullPath);
      }
    }
  }

  scanDir(dirPath);
  return files;
}

/**
 * Main audit function
 */
function auditLayoutConsistency() {
  console.log('🔍 Auditing Layout Consistency Across Pages\n');

  const pagesDir = join(process.cwd(), 'src', 'pages');
  const pageFiles = findPageFiles(pagesDir);

  const analyses: PageAnalysis[] = pageFiles.map(analyzePage);

  // Summary statistics
  const totalPages = analyses.length;
  const standardizedPages = analyses.filter(a => a.layoutPattern === 'standardized').length;
  const legacyPages = analyses.filter(a => a.layoutPattern === 'legacy-layout').length;
  const customPages = analyses.filter(a => a.layoutPattern === 'custom-inline').length;
  const minimalPages = analyses.filter(a => a.layoutPattern === 'minimal').length;

  const allIssues = analyses.flatMap(a => a.issues);
  const highSeverity = allIssues.filter(i => i.severity === 'high').length;
  const mediumSeverity = allIssues.filter(i => i.severity === 'medium').length;
  const lowSeverity = allIssues.filter(i => i.severity === 'low').length;

  console.log('📊 Summary:');
  console.log(`   Total Pages: ${totalPages}`);
  console.log(`   ✅ Standardized (PageLayout): ${standardizedPages}`);
  console.log(`   ⚠️  Legacy (Layout): ${legacyPages}`);
  console.log(`   ❌ Custom Inline: ${customPages}`);
  console.log(`   ❓ Minimal: ${minimalPages}`);
  console.log('');

  console.log('🚨 Issues Found:');
  console.log(`   🔴 High Severity: ${highSeverity}`);
  console.log(`   🟡 Medium Severity: ${mediumSeverity}`);
  console.log(`   🔵 Low Severity: ${lowSeverity}`);
  console.log('');

  if (allIssues.length > 0) {
    console.log('📋 Detailed Issues:');
    allIssues.forEach((issue, index) => {
      const severityIcon = issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🔵';
      console.log(`${index + 1}. ${severityIcon} ${issue.page}: ${issue.issue}`);
      if (issue.suggestion) {
        console.log(`   💡 ${issue.suggestion}`);
      }
      console.log('');
    });
  } else {
    console.log('✅ No layout consistency issues found!');
  }

  // Recommendations
  console.log('🎯 Recommendations:');
  if (highSeverity > 0) {
    console.log('   • Address high-severity issues first (custom layouts)');
    console.log('   • Replace inline layout code with PageLayout components');
  }
  if (mediumSeverity > 0) {
    console.log('   • Add layout wrappers to pages missing them');
    console.log('   • Ensure consistent spacing and responsive behavior');
  }
  if (lowSeverity > 0) {
    console.log('   • Consider migrating legacy Layout usage to PageLayout');
    console.log('   • Update for better consistency across the application');
  }

  const complianceRate = ((standardizedPages + legacyPages) / totalPages * 100).toFixed(1);
  console.log(`\n📈 Layout Compliance Rate: ${complianceRate}%`);

  if (parseFloat(complianceRate) < 80) {
    console.log('⚠️  Consider prioritizing layout standardization in upcoming sprints');
  } else if (parseFloat(complianceRate) >= 95) {
    console.log('🎉 Excellent layout consistency achieved!');
  }
}

// Run the audit
auditLayoutConsistency();
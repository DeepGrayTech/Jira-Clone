const fs = require('fs');

const coverage = JSON.parse(fs.readFileSync('./coverage/coverage-final.json', 'utf-8'));

const p0Files = [
  'LoginForm.tsx',
  'GoalContext.tsx',
  'contexts/index.ts',
  'TasksView.tsx',
  'useDataLoader.ts'
];

console.log('=== P0 文件覆盖率报告 ===\n');

for (const [path, data] of Object.entries(coverage)) {
  const fileName = path.split('\\').pop();
  if (p0Files.includes(fileName)) {
    const statements = data.s || {};
    const branches = data.b || {};
    
    const totalStatements = Object.keys(statements).length;
    const coveredStatements = Object.values(statements).filter(v => v > 0).length;
    const statementCoverage = totalStatements > 0 
      ? ((coveredStatements / totalStatements) * 100).toFixed(2) 
      : 'N/A';
    
    let branchTotal = 0;
    let branchCovered = 0;
    for (const [, values] of Object.entries(branches)) {
      branchTotal += values.length;
      branchCovered += values.filter(v => v > 0).length;
    }
    const branchCoverage = branchTotal > 0 
      ? ((branchCovered / branchTotal) * 100).toFixed(2) 
      : 'N/A';
    
    console.log(`${fileName}:`);
    console.log(`  语句覆盖率: ${statementCoverage}% (${coveredStatements}/${totalStatements})`);
    console.log(`  分支覆盖率: ${branchCoverage}% (${branchCovered}/${branchTotal})`);
    console.log(`  达标: ${parseFloat(statementCoverage) >= 80 ? '✓' : '✗'}\n`);
  }
}
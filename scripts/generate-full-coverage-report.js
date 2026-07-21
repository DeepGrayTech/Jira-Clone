const fs = require('fs');

const coverage = JSON.parse(fs.readFileSync('./coverage/coverage-final.json', 'utf-8'));

const fileStats = [];

for (const [path, data] of Object.entries(coverage)) {
  const statements = data.s || {};
  const branches = data.b || {};
  const functions = data.f || {};
  
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
  
  const totalFunctions = Object.keys(functions).length;
  const coveredFunctions = Object.values(functions).filter(v => v > 0).length;
  const functionCoverage = totalFunctions > 0 
    ? ((coveredFunctions / totalFunctions) * 100).toFixed(2) 
    : 'N/A';
  
  const fileName = path.split('\\').pop();
  const dirParts = path.split('\\');
  const dirName = dirParts[dirParts.length - 2] || 'root';
  
  const uncoveredLines = [];
  if (data.statementMap) {
    for (const [key, stat] of Object.entries(data.statementMap)) {
      if (statements[key] === 0) {
        uncoveredLines.push(stat.start.line);
      }
    }
  }
  
  fileStats.push({
    path: fileName,
    dir: dirName,
    statements: totalStatements,
    coveredStatements: coveredStatements,
    statementCoverage: parseFloat(statementCoverage),
    branchCoverage: parseFloat(branchCoverage),
    functionCoverage: parseFloat(functionCoverage),
    uncoveredLines: [...new Set(uncoveredLines)].sort((a, b) => a - b)
  });
}

fileStats.sort((a, b) => a.statementCoverage - b.statementCoverage);

console.log('=== 测试覆盖率详细报告 ===\n');
console.log('1. 低覆盖率文件 (覆盖率 < 60%)\n');
console.log('─────────────────────────────────────────────────────────────────────');
console.log(`${'文件'.padEnd(35)} ${'语句'.padEnd(8)} ${'分支'.padEnd(8)} ${'函数'.padEnd(8)} ${'未覆盖行'}`);
console.log('─────────────────────────────────────────────────────────────────────');

const lowCoverage = fileStats.filter(f => f.statementCoverage < 60 && !isNaN(f.statementCoverage));
if (lowCoverage.length === 0) {
  console.log('  (无)');
} else {
  lowCoverage.forEach(f => {
    const lines = f.uncoveredLines.length > 0 
      ? f.uncoveredLines.slice(0, 10).join(', ') + (f.uncoveredLines.length > 10 ? '...' : '') 
      : '';
    console.log(`${f.path.padEnd(35)} ${f.statementCoverage.toFixed(1).padEnd(7)}% ${f.branchCoverage.toFixed(1).padEnd(7)}% ${f.functionCoverage.toFixed(1).padEnd(7)}% ${lines}`);
  });
}

console.log('\n2. 中等覆盖率文件 (60% ≤ 覆盖率 < 80%)\n');
console.log('─────────────────────────────────────────────────────────────────────');
console.log(`${'文件'.padEnd(35)} ${'语句'.padEnd(8)} ${'分支'.padEnd(8)} ${'函数'.padEnd(8)} ${'未覆盖行'}`);
console.log('─────────────────────────────────────────────────────────────────────');

const mediumCoverage = fileStats.filter(f => f.statementCoverage >= 60 && f.statementCoverage < 80 && !isNaN(f.statementCoverage));
if (mediumCoverage.length === 0) {
  console.log('  (无)');
} else {
  mediumCoverage.forEach(f => {
    const lines = f.uncoveredLines.length > 0 
      ? f.uncoveredLines.slice(0, 10).join(', ') + (f.uncoveredLines.length > 10 ? '...' : '') 
      : '';
    console.log(`${f.path.padEnd(35)} ${f.statementCoverage.toFixed(1).padEnd(7)}% ${f.branchCoverage.toFixed(1).padEnd(7)}% ${f.functionCoverage.toFixed(1).padEnd(7)}% ${lines}`);
  });
}

console.log('\n3. 高覆盖率文件 (覆盖率 ≥ 80%)\n');
console.log('─────────────────────────────────────────────────────────────────────');
console.log(`${'文件'.padEnd(35)} ${'语句'.padEnd(8)} ${'分支'.padEnd(8)} ${'函数'.padEnd(8)}`);
console.log('─────────────────────────────────────────────────────────────────────');

const highCoverage = fileStats.filter(f => f.statementCoverage >= 80 && !isNaN(f.statementCoverage));
if (highCoverage.length === 0) {
  console.log('  (无)');
} else {
  highCoverage.forEach(f => {
    console.log(`${f.path.padEnd(35)} ${f.statementCoverage.toFixed(1).padEnd(7)}% ${f.branchCoverage.toFixed(1).padEnd(7)}% ${f.functionCoverage.toFixed(1).padEnd(7)}%`);
  });
}

console.log('\n4. 按目录分组统计\n');
const dirStats = {};
fileStats.forEach(f => {
  if (!dirStats[f.dir]) {
    dirStats[f.dir] = { files: 0, total: 0, covered: 0 };
  }
  dirStats[f.dir].files++;
  dirStats[f.dir].total += f.statements;
  dirStats[f.dir].covered += f.coveredStatements;
});

for (const [dir, stats] of Object.entries(dirStats).sort()) {
  const coverage = stats.total > 0 ? ((stats.covered / stats.total) * 100).toFixed(1) : 'N/A';
  console.log(`${dir.padEnd(20)} 文件数: ${stats.files.toString().padEnd(3)} 覆盖率: ${coverage}%`);
}

console.log('\n5. 总体统计\n');
const totalFiles = fileStats.length;
const totalStatements = fileStats.reduce((sum, f) => sum + f.statements, 0);
const totalCovered = fileStats.reduce((sum, f) => sum + f.coveredStatements, 0);
const overallCoverage = totalStatements > 0 ? ((totalCovered / totalStatements) * 100).toFixed(1) : 'N/A';

const lowCount = lowCoverage.length;
const mediumCount = mediumCoverage.length;
const highCount = highCoverage.length;

console.log(`总文件数: ${totalFiles}`);
console.log(`总语句数: ${totalStatements} (已覆盖: ${totalCovered})`);
console.log(`总体覆盖率: ${overallCoverage}%`);
console.log(`\n覆盖率分布:`);
console.log(`  < 60%: ${lowCount} 个文件`);
console.log(`  60%-80%: ${mediumCount} 个文件`);
console.log(`  ≥ 80%: ${highCount} 个文件`);
console.log(`\n需要优化的文件数: ${lowCount + mediumCount} 个`);
// Test script to validate chart utility fixes
const { transformDataForChart } = require('./src/lib/chart-utils.ts');

// Test data
const sampleRows = [
  ['Name', 'Age', 'Salary', 'Gender'],
  ['John', 25, 50000, 'Male'],
  ['Jane', 30, 60000, 'Female'],
  ['Bob', 35, 70000, 'Male'],
  ['Alice', 28, 55000, 'Female']
];

// Test configurations that might cause the original errors
const testConfigs = [
  {
    type: 'pie',
    title: 'Gender Distribution',
    description: 'Distribution by gender',
    xAxis: 'Gender', // This should work
    yAxis: undefined, // This was causing issues
    dataKey: undefined, // This should work for pie charts
    priority: 1,
    analyticalValue: 'High'
  },
  {
    type: 'bar',
    title: 'Age Analysis',
    description: 'Age distribution',
    xAxis: undefined, // This should cause a validation error
    yAxis: 'Age',
    dataKey: 'Age',
    priority: 2,
    analyticalValue: 'Medium'
  }
];

console.log('Testing chart utility fixes...');

testConfigs.forEach((config, index) => {
  console.log(`\nTest ${index + 1}: ${config.title}`);
  try {
    const result = transformDataForChart(sampleRows, config, true);
    if (result) {
      console.log('✓ Success - Chart data generated');
    } else {
      console.log('⚠ Failed - No chart data generated (expected for invalid configs)');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
});

console.log('\nTest completed!');
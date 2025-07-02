const { execSync } = require('child_process');

try {
  // Run TypeScript compiler with strict settings
  const result = execSync('npx tsc --noEmit --strict --noImplicitAny --noImplicitReturns --noImplicitThis', {
    encoding: 'utf8',
    stdio: 'pipe'
  });
  console.log('No TypeScript errors found!');
  console.log(result);
} catch (error) {
  console.log('TypeScript errors found:');
  console.log(error.stdout);
  console.log(error.stderr);
}

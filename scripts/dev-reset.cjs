const { execSync } = require('node:child_process');
const { existsSync, rmSync } = require('node:fs');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function cleanDistWithRetry() {
  if (!existsSync('dist')) return true;

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      try {
        execSync('attrib -R /S /D dist\\*', { stdio: 'ignore' });
      } catch {
        // Ignore attrib failures and still try removing dist.
      }

      rmSync('dist', { recursive: true, force: true });
      return true;
    } catch {
      if (attempt === 5) {
        console.warn('dev:reset: nao foi possivel remover dist (arquivo bloqueado).');
        console.warn('dev:reset: feche processos Node/Nest e pause o OneDrive, depois rode novamente.');
        return false;
      }

      await sleep(300);
    }
  }

  return false;
}

(async () => {
  await cleanDistWithRetry();
  process.exit(0);
})();

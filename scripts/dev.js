const { spawn } = require('child_process');

const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';

const commands = [
  {
    name: 'backend',
    args: ['run', 'dev', '--prefix', 'backend']
  },
  {
    name: 'frontend',
    args: ['run', 'dev', '--prefix', 'frontend']
  }
];

let shuttingDown = false;

const children = commands.map((command) => {
  const child = spawn(npmCommand, command.args, {
    stdio: 'pipe',
    shell: false
  });

  child.stdout.on('data', (chunk) => {
    process.stdout.write(`[${command.name}] ${chunk}`);
  });

  child.stderr.on('data', (chunk) => {
    process.stderr.write(`[${command.name}] ${chunk}`);
  });

  child.on('error', (error) => {
    if (!shuttingDown) {
      console.error(`[${command.name}] failed to start: ${error.message}`);
      shutdown();
    }
  });

  child.on('exit', (code) => {
    if (code !== 0 && !shuttingDown) {
      console.error(`[${command.name}] exited with code ${code}`);
      shutdown();
    }
  });

  return child;
});

function shutdown() {
  shuttingDown = true;
  children.forEach((child) => {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  });
}

process.on('SIGINT', () => {
  shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  shutdown();
  process.exit(0);
});

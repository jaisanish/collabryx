import { Request, Response } from 'express';
import { spawn } from 'child_process';
import { AuthRequest } from '../middlewares/authMiddleware';

/**
 * executeCode Controller
 * 
 * Securely executes user-submitted code in isolated Docker containers with 
 * resource limits, network isolation, and timeout protection.
 */
export const executeCode = async (req: AuthRequest, res: Response) => {
  const { code, language, input } = req.body;

  if (!code || !language) {
    res.status(400).json({ error: 'Code and language are required' });
    return;
  }

  // Configuration for different languages
  const config: Record<string, { image: string; command: string }> = {
    javascript: {
      image: 'node:18-alpine',
      command: `node -e ${JSON.stringify(code)}`
    },
    python: {
      image: 'python:3-alpine',
      command: `python3 -c ${JSON.stringify(code)}`
    },
    java: {
      image: 'eclipse-temurin:17-jdk-alpine',
      command: "CLASS_NAME=$(echo \"$CODE\" | grep -m 1 -oE 'class [a-zA-Z0-9_]+' | awk '{print $2}' || echo 'Main'); printf '%s' \"$CODE\" > \"$CLASS_NAME.java\" && javac \"$CLASS_NAME.java\" && java \"$CLASS_NAME\""
    },
    'c++': {
      image: 'frolvlad/alpine-gxx',
      command: "printf '%s' \"$CODE\" > main.cpp && g++ main.cpp -o main && ./main"
    },
    text: {
       image: 'busybox',
       command: `echo ${JSON.stringify(code)}`
    }
  };

  const langConfig = config[language.toLowerCase()];
  if (!langConfig && language.toLowerCase() !== 'text') {
    res.status(400).json({ error: `Unsupported language: ${language}` });
    return;
  }

  const startTime = Date.now();

  /**
   * Secure Docker Arguments Configuration:
   * 
   * -i: Keep stdin open even if not attached. Required for providing user input.
   * -i: Keep stdin open even if not attached. Required for providing user input.
   * --rm: Automatically remove the container file system when it exits. Prevents disk bloat.
   * --memory=64m: Hard limit on RAM. Prevents "Out of Memory" attacks on the host machine.
   * --cpus=0.5: Fractions of CPU allowed. Prevents malicious code from pinning host CPUs to 100%.
   * --network=none: Complete isolation from the internet and local network. Blocks data exfiltration.
   * --pids-limit=64: Limits the number of processes/threads. Prevents "fork bomb" resource exhaustion.
   */
  let finalArgs: string[] = [
    'run', '-i', '--rm', 
    '--memory=64m', 
    '--cpus=0.5', 
    '--network=none', 
    '--pids-limit=64',
  ];

  if (language.toLowerCase() === 'python' || language.toLowerCase() === 'javascript' || language.toLowerCase() === 'text') {
    finalArgs.push(langConfig.image);
    const mainCmd = language.toLowerCase() === 'python' ? 'python3' : (language.toLowerCase() === 'javascript' ? 'node' : 'echo');
    const flag = language.toLowerCase() === 'python' ? '-c' : (language.toLowerCase() === 'javascript' ? '-e' : '');
    
    if (flag) {
      finalArgs.push(mainCmd, flag, code);
    } else {
      finalArgs.push(mainCmd, code);
    }
  } else {
    // Java and C++ use sh -c to chain commands safely.
    // We pass the code as an environment variable to avoid shell escaping issues.
    // The environment variable MUST be defined before the image name.
    finalArgs.push('--env', `CODE=${code}`, langConfig.image, 'sh', '-c', langConfig.command);
  }

  const child = spawn('docker', finalArgs);

  // Pipe user input to the container's stdin
  if (input) {
    child.stdin.write(input);
  }
  child.stdin.end();

  let stdout = '';
  let stderr = '';

  // 10-second timeout to kill infinite loops or hung processes
  const timeout = setTimeout(() => {
    child.kill();
    if (!res.headersSent) {
      res.status(400).json({ 
        error: 'Execution timed out (10s limit exceeded)', 
        executionTime: Date.now() - startTime,
        output: stdout
      });
    }
  }, 10000);

  child.stdout.on('data', (data) => {
    stdout += data.toString();
  });

  child.stderr.on('data', (data) => {
    stderr += data.toString();
  });

  child.on('close', (codeStatus) => {
    clearTimeout(timeout);
    const executionTime = Date.now() - startTime;

    if (res.headersSent) return;

    if (codeStatus !== 0) {
      res.status(400).json({ 
        error: stderr || `Execution failed with code ${codeStatus}`, 
        executionTime,
        output: stdout 
      });
      return;
    }

    res.status(200).json({
      output: stdout,
      executionTime,
      error: stderr || null
    });
  });
};


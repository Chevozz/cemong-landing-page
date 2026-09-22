import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

try {
  const { stdout, stderr } = await execFileAsync(
    process.execPath,
    ["node_modules/typescript/lib/tsc.js", "--noEmit"],
    { cwd: process.cwd() }
  );
  if (stdout) console.log(stdout);
  if (stderr) console.log(stderr);
  console.log("TSC_OK");
} catch (err) {
  const e = err;
  if (e.stdout) console.log(String(e.stdout));
  if (e.stderr) console.log(String(e.stderr));
  console.log("TSC_FAILED");
  process.exitCode = 1;
}

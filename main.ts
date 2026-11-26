// Deadpan Forecasts for Cities That Do Not Exist
// make.fun program/v1 entry: writes exactly one forecast line to $OUTPUT_DIR/entry.txt.
// Deterministic by design: the line is fixed text, no randomness, no clock, no network.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const FORECAST =
  "In Yesteryear, snow from 1987 finally arrives this afternoon, 39 years late, bringing light flurries and a formal apology from the clouds.";

// Gate: the forecast must be valid UTF-8 text of 1-160 characters,
// not only whitespace, and a single line (no CR or LF inside it).
function validate(line: string): void {
  const bytes = Buffer.from(line, "utf8");
  if (bytes.toString("utf8") !== line) {
    throw new Error("forecast must be valid UTF-8 text");
  }
  if (line.length < 1 || line.length > 160) {
    throw new Error(`forecast must be 1-160 characters, got ${line.length}`);
  }
  if (!line.trim()) {
    throw new Error("forecast must not be only whitespace");
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("forecast must be a single line");
  }
}

// Read the file back and confirm it holds exactly the forecast line:
// byte-identical apart from the single trailing newline the writer adds.
function verify(filePath: string, expected: string): void {
  const raw = readFileSync(filePath);
  const written = raw.toString("utf8");
  if (written !== `${expected}\n`) {
    throw new Error(
      `entry.txt mismatch: wrote ${JSON.stringify(written)}, expected ${JSON.stringify(expected)} plus one trailing newline`,
    );
  }
  if (raw.length !== Buffer.byteLength(expected, "utf8") + 1) {
    throw new Error("entry.txt has unexpected byte length");
  }
}

const outDir = process.env.OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
validate(FORECAST);
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, `${FORECAST}\n`, "utf8");
verify(outPath, FORECAST);
console.log(`wrote ${outPath} (${FORECAST.length} characters)`);

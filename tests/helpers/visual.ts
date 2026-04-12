import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

export interface VisualDiffOptions {
  threshold?: number;
  maxDiffPixels?: number;
}

export interface VisualDiffResult {
  match: boolean;
  diffPixels: number;
  totalPixels: number;
  baselineExisted: boolean;
}

const SNAPSHOT_ROOT = join(process.cwd(), 'tests/visual/__snapshots__');

function snapshotPath(name: string): string {
  return join(SNAPSHOT_ROOT, `${name}.png`);
}

export async function compareSnapshot(
  name: string,
  candidate: Buffer,
  options: VisualDiffOptions = {}
): Promise<VisualDiffResult> {
  const { threshold = 0.1, maxDiffPixels = 100 } = options;
  const target = snapshotPath(name);
  const updateMode = process.env.UPDATE_SNAPSHOTS === '1';

  if (!existsSync(target) || updateMode) {
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, candidate);
    return {
      match: true,
      diffPixels: 0,
      totalPixels: 0,
      baselineExisted: existsSync(target) && !updateMode,
    };
  }

  const baselineBuf = await readFile(target);
  const baseline = PNG.sync.read(baselineBuf);
  const compare = PNG.sync.read(candidate);

  if (baseline.width !== compare.width || baseline.height !== compare.height) {
    return {
      match: false,
      diffPixels: baseline.width * baseline.height,
      totalPixels: baseline.width * baseline.height,
      baselineExisted: true,
    };
  }

  const diff = new PNG({ width: baseline.width, height: baseline.height });
  const diffPixels = pixelmatch(
    baseline.data,
    compare.data,
    diff.data,
    baseline.width,
    baseline.height,
    { threshold }
  );

  return {
    match: diffPixels <= maxDiffPixels,
    diffPixels,
    totalPixels: baseline.width * baseline.height,
    baselineExisted: true,
  };
}

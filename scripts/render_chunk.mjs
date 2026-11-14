import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v];
  })
);

const shard = Number(args.shard ?? 0);
const totalShards = Number(args['total-shards'] ?? 4);
const fps = Number(args.fps ?? 60);
const duration = Number(args.duration ?? 60);
const outFile = args.out ?? `out/chunk_${shard}.mp4`;

const totalFrames = Math.round(fps * duration);
const framesPerShard = Math.ceil(totalFrames / totalShards);
const startFrame = shard * framesPerShard;
const endFrame = Math.min(totalFrames, (shard + 1) * framesPerShard);

fs.mkdirSync(path.dirname(outFile), { recursive: true });

console.log(`[Shard ${shard}/${totalShards}] Rendering frames ${startFrame} -> ${endFrame - 1} (${endFrame - startFrame} frames)...`);

const browser = await chromium.launch({
  headless: true,
  args: ['--disable-dev-shm-usage', '--no-sandbox', '--enable-gpu-rasterization']
});

const page = await browser.newPage({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1
});

const htmlPath = 'file://' + path.resolve('index.html');
await page.goto(htmlPath, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

// Pipe raw JPEG/PNG buffers directly into FFmpeg stdin (Zero temp image files on disk, <1.2GB RAM)
const ffmpeg = spawn('ffmpeg', [
  '-y',
  '-f', 'image2pipe',
  '-vcodec', 'png',
  '-r', String(fps),
  '-i', '-',
  '-c:v', 'libx264',
  '-pix_fmt', 'yuv420p',
  '-preset', 'fast',
  '-crf', '18',
  outFile
], { stdio: ['pipe', 'inherit', 'inherit'] });

for (let f = startFrame; f < endFrame; f++) {
  const t = f / fps;
  await page.evaluate((timeSec) => window.renderFrameAt(timeSec), t);
  const buf = await page.screenshot({ type: 'png', omitBackground: false });
  const canWrite = ffmpeg.stdin.write(buf);
  if (!canWrite) {
    await new Promise((resolve) => ffmpeg.stdin.once('drain', resolve));
  }
  if ((f - startFrame) % 120 === 0) {
    console.log(`[Shard ${shard}] Progress: ${f - startFrame}/${endFrame - startFrame} frames`);
  }
}

ffmpeg.stdin.end();
await new Promise((resolve, reject) => {
  ffmpeg.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`FFmpeg exited ${code}`))));
});

await browser.close();
console.log(`[Shard ${shard}] Saved ${outFile}`);

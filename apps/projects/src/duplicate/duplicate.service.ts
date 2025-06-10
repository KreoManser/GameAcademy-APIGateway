import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createHash } from 'crypto';
import JSZip from 'jszip';
import { brotliDecompressSync, gunzipSync } from 'zlib';
import { Duplicate, DuplicateDocument } from './schemas/duplicate.schema';

interface CheckOpts {
  dryRun?: boolean;
}

const JACCARD_THRESHOLD = Number(process.env.JACCARD || 0.5);

function tryDecompress(entryName: string, buf: Buffer): Buffer {
  const isBr = entryName.endsWith('.br');
  const isGz = entryName.endsWith('.gz') || entryName.endsWith('.unityweb');

  if (!isBr && !isGz) return buf;

  try {
    return isBr ? brotliDecompressSync(buf) : gunzipSync(buf);
  } catch {
    return buf;
  }
}

function mapValues(recorded: unknown): string[] {
  if (recorded instanceof Map) return Array.from(recorded.values());
  if (recorded && typeof recorded === 'object') return Object.values(recorded as Record<string, string>);
  return [];
}

function encodePath(path: string): string {
  return path
    .replace(/^__MACOSX\/.*$/, '')
    .replace(/\.(br|gz|unityweb)$/i, '')
    .replace(/\./g, '|');
}

function jaccard(a: Set<string>, b: Set<string>): number {
  const inter = [...a].filter((x) => b.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : inter / union;
}

@Injectable()
export class DuplicateService {
  constructor(
    @InjectModel(Duplicate.name)
    private readonly dupModel: Model<DuplicateDocument>,
  ) {}

  computeHash(buf: Buffer) {
    return createHash('sha256').update(buf).digest('hex');
  }

  private isZip(buf: Buffer) {
    return buf.length > 3 && buf[0] === 0x50 && buf[1] === 0x4b;
  }

  private async buildSignature(buffer: Buffer) {
    const zip = await JSZip.loadAsync(buffer);

    const fileHashes: Record<string, string> = {};
    let author = '';
    let productName = '';

    await Promise.all(
      Object.values(zip.files).map(async (entry) => {
        if (entry.dir) return;

        const raw = await entry.async('nodebuffer');
        const content = tryDecompress(entry.name, raw);

        const key = encodePath(entry.name);
        fileHashes[key] = this.computeHash(content);

        if (/loader\.js/i.test(entry.name)) {
          const txt = content.toString('utf8');
          author = /companyName:"([^"]+)"/.exec(txt)?.[1] ?? author;
          productName = /productName:"([^"]+)"/.exec(txt)?.[1] ?? productName;
        }
      }),
    );

    return { fileHashes, author, productName };
  }

  async checkOrRegister(
    buffer: Buffer,
    originalName?: string,
    metadata: Record<string, any> = {},
    opts: CheckOpts = {},
  ) {
    const zipHash = this.computeHash(buffer);
    const full = await this.dupModel.findOne({ zipHash });
    if (full) return { duplicate: 'full', record: full };

    let signature: Awaited<ReturnType<typeof this.buildSignature>> | null = null;
    if (this.isZip(buffer)) {
      signature = await this.buildSignature(buffer);

      const sigSet = new Set(Object.values(signature.fileHashes));
      const candidates = await this.dupModel.find();

      for (const candidate of candidates) {
        const candSet = new Set(mapValues(candidate.fileHashes));
        const jac = jaccard(sigSet, candSet);

        if (jac >= JACCARD_THRESHOLD) {
          return {
            duplicate: 'relative',
            similarity: jac,
            matched: [...sigSet].filter((h) => candSet.has(h)),
            record: candidate,
          };
        }
      }
    }

    if (opts.dryRun) {
      return { duplicate: false } as const;
    }

    const created = await this.dupModel.create({
      zipHash,
      ...signature,
      metadata,
      originalName,
    });

    return { duplicate: false, record: created };
  }

  async findAll() {
    return this.dupModel.find().sort({ _id: -1 }).exec();
  }

  async remove(id: string): Promise<void> {
    await this.dupModel.findByIdAndDelete(id).exec();
  }
}

import { createHash, randomUUID } from 'node:crypto';
import { readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import openapiTS, { astToString } from 'openapi-typescript';

const packageDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contractsDirectory = resolve(packageDirectory, '../../packages/api-contracts');
const generator = 'openapi-typescript@7.13.0';

export const defaultPaths = Object.freeze({
  output: resolve(contractsDirectory, 'generated/openapi.ts'),
  provenance: resolve(contractsDirectory, 'openapi/provenance.json'),
  snapshot: resolve(contractsDirectory, 'openapi/source.json')
});

export class OpenApiContractError extends Error {
  constructor(message, cause) {
    super(message, cause ? { cause } : undefined);
    this.name = 'OpenApiContractError';
  }
}

export function validateOpenApi(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new OpenApiContractError('OpenAPI source must be a JSON object');
  }
  if (typeof value.openapi !== 'string' || !/^3\.(?:0|1)\./.test(value.openapi)) {
    throw new OpenApiContractError('OpenAPI source must declare version 3.0.x or 3.1.x');
  }
  if (!value.paths || typeof value.paths !== 'object' || Array.isArray(value.paths)) {
    throw new OpenApiContractError('OpenAPI source must contain a paths object');
  }
  const schemas = value.components?.schemas;
  if (!schemas || typeof schemas !== 'object' || Array.isArray(schemas)) {
    throw new OpenApiContractError('OpenAPI source must contain components.schemas');
  }
  return value;
}

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function safeSourceLabel(source) {
  if (!/^https?:\/\//.test(source)) return source;
  try {
    const url = new URL(source);
    return `${url.protocol}//${url.host}${url.pathname}`;
  } catch {
    return '<invalid-http-source>';
  }
}

async function readSource(source) {
  if (/^https?:\/\//.test(source)) {
    let response;
    try {
      response = await fetch(source, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(30_000) });
    } catch (error) {
      throw new OpenApiContractError(`Unable to fetch OpenAPI source: ${safeSourceLabel(source)}`, error);
    }
    if (!response.ok) {
      throw new OpenApiContractError(`OpenAPI source returned HTTP ${response.status}: ${safeSourceLabel(source)}`);
    }
    return Buffer.from(await response.arrayBuffer());
  }
  try {
    return await readFile(resolve(source));
  } catch (error) {
    throw new OpenApiContractError(`Unable to read OpenAPI source: ${source}`, error);
  }
}

function parseSource(bytes) {
  try {
    return validateOpenApi(JSON.parse(bytes.toString('utf8')));
  } catch (error) {
    if (error instanceof OpenApiContractError) throw error;
    throw new OpenApiContractError('OpenAPI source is not valid JSON', error);
  }
}

function summarize(bytes, spec) {
  return Object.freeze({
    openapi: spec.openapi,
    paths: Object.keys(spec.paths).length,
    schemas: Object.keys(spec.components.schemas).length,
    tags: Array.isArray(spec.tags) ? spec.tags.length : 0,
    sha256: sha256(bytes)
  });
}

function createProvenance(bytes, spec, { backendCommit, backendRepository, runtimeEndpoint }) {
  const summary = summarize(bytes, spec);
  if (!/^[\da-f]{40}$/i.test(backendCommit ?? '')) {
    throw new OpenApiContractError('fetch requires --backend-commit <40-character-sha>');
  }
  if (!backendRepository?.trim()) throw new OpenApiContractError('backend repository must not be empty');
  if (!runtimeEndpoint?.trim()) throw new OpenApiContractError('runtime endpoint must not be empty');
  return {
    backendCommit,
    backendRepository,
    generator,
    openapiVersion: summary.openapi,
    rawSha256: summary.sha256,
    runtimeEndpoint,
    totals: { paths: summary.paths, schemas: summary.schemas, tags: summary.tags }
  };
}

const provenanceText = value => `${JSON.stringify(value, null, 2)}\n`;

async function atomicWrite(path, content) {
  const temporary = `${path}.tmp-${process.pid}-${randomUUID()}`;
  try {
    await writeFile(temporary, content);
    await rename(temporary, path);
  } finally {
    await unlink(temporary).catch(() => undefined);
  }
}

async function readExisting(path) {
  try {
    return await readFile(path);
  } catch (error) {
    if (error?.code === 'ENOENT') return undefined;
    throw error;
  }
}

async function atomicWriteMany(entries) {
  const staged = [];
  const previous = [];
  try {
    for (const [path, content] of entries) {
      const temporary = `${path}.tmp-${process.pid}-${randomUUID()}`;
      await writeFile(temporary, content);
      staged.push([path, temporary]);
      previous.push([path, await readExisting(path)]);
    }
    for (const [path, temporary] of staged) await rename(temporary, path);
  } catch (error) {
    for (const [path, content] of previous) {
      if (content === undefined) await unlink(path).catch(() => undefined);
      else await atomicWrite(path, content).catch(() => undefined);
    }
    throw error;
  } finally {
    await Promise.all(staged.map(([, temporary]) => unlink(temporary).catch(() => undefined)));
  }
}

async function readAndValidateProvenance(snapshot, provenance) {
  const bytes = await readFile(snapshot);
  const spec = parseSource(bytes);
  let current;
  try {
    current = JSON.parse(await readFile(provenance, 'utf8'));
  } catch (error) {
    throw new OpenApiContractError(`OpenAPI provenance is missing or invalid: ${provenance}`, error);
  }
  if (!current || typeof current !== 'object' || Array.isArray(current)) {
    throw new OpenApiContractError(`OpenAPI provenance is missing or invalid: ${provenance}`);
  }
  const expected = createProvenance(bytes, spec, {
    backendCommit: current.backendCommit,
    backendRepository: current.backendRepository,
    runtimeEndpoint: current.runtimeEndpoint
  });
  if (provenanceText(current) !== provenanceText(expected)) {
    throw new OpenApiContractError('OpenAPI provenance drift detected; run openapi:fetch and review the diff');
  }
  return { spec };
}

export async function fetchSnapshot({
  backendCommit,
  backendRepository = 'ruoyi-vue-plus-namewta',
  destination = defaultPaths.snapshot,
  provenance = defaultPaths.provenance,
  runtimeEndpoint = '/v3/api-docs',
  source
}) {
  if (!source) throw new OpenApiContractError('fetch requires --source <url-or-file>');
  const bytes = await readSource(source);
  const spec = parseSource(bytes);
  const metadata = createProvenance(bytes, spec, { backendCommit, backendRepository, runtimeEndpoint });
  await atomicWriteMany([
    [destination, bytes],
    [provenance, provenanceText(metadata)]
  ]);
  return summarize(bytes, spec);
}

async function generateContractsFromSpec(spec) {
  try {
    return astToString(await openapiTS(spec));
  } catch (error) {
    throw new OpenApiContractError('Unable to generate TypeScript from the checked OpenAPI snapshot', error);
  }
}

export async function generateContractsText(snapshot = defaultPaths.snapshot, provenance = defaultPaths.provenance) {
  const { spec } = await readAndValidateProvenance(snapshot, provenance);
  return generateContractsFromSpec(spec);
}

export async function generateContracts({
  output = defaultPaths.output,
  provenance = defaultPaths.provenance,
  snapshot = defaultPaths.snapshot
} = {}) {
  const generated = await generateContractsText(snapshot, provenance);
  await atomicWrite(output, generated);
  return Object.freeze({ bytes: Buffer.byteLength(generated), sha256: sha256(generated) });
}

export async function checkContracts({
  output = defaultPaths.output,
  provenance = defaultPaths.provenance,
  snapshot = defaultPaths.snapshot
} = {}) {
  const expected = await generateContractsText(snapshot, provenance);
  let current;
  try {
    current = await readFile(output, 'utf8');
  } catch (error) {
    throw new OpenApiContractError(`Generated contract is missing: ${output}`, error);
  }
  if (current !== expected) {
    throw new OpenApiContractError(
      'Generated OpenAPI contract drift detected; run openapi:generate and review the diff'
    );
  }
  return Object.freeze({ bytes: Buffer.byteLength(current), sha256: sha256(current) });
}

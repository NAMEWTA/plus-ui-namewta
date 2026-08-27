import { createHash, randomUUID } from 'node:crypto';
import { readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import openapiTS, { astToString } from 'openapi-typescript';

const packageDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contractsDirectory = resolve(packageDirectory, '../../packages/api-contracts');

export const defaultPaths = Object.freeze({
  output: resolve(contractsDirectory, 'generated/openapi.ts'),
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

async function readSource(source) {
  if (/^https?:\/\//.test(source)) {
    let response;
    try {
      response = await fetch(source, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(30_000) });
    } catch (error) {
      throw new OpenApiContractError(`Unable to fetch OpenAPI source: ${source}`, error);
    }
    if (!response.ok) throw new OpenApiContractError(`OpenAPI source returned HTTP ${response.status}`);
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

async function atomicWrite(path, content) {
  const temporary = `${path}.tmp-${process.pid}-${randomUUID()}`;
  try {
    await writeFile(temporary, content);
    await rename(temporary, path);
  } finally {
    await unlink(temporary).catch(() => undefined);
  }
}

export async function fetchSnapshot({ destination = defaultPaths.snapshot, source }) {
  if (!source) throw new OpenApiContractError('fetch requires --source <url-or-file>');
  const bytes = await readSource(source);
  const spec = parseSource(bytes);
  await atomicWrite(destination, bytes);
  return Object.freeze({
    openapi: spec.openapi,
    paths: Object.keys(spec.paths).length,
    schemas: Object.keys(spec.components.schemas).length,
    sha256: sha256(bytes)
  });
}

export async function generateContractsText(snapshot = defaultPaths.snapshot) {
  const bytes = await readFile(snapshot);
  const spec = parseSource(bytes);
  try {
    return astToString(await openapiTS(spec));
  } catch (error) {
    throw new OpenApiContractError('Unable to generate TypeScript from the checked OpenAPI snapshot', error);
  }
}

export async function generateContracts({ output = defaultPaths.output, snapshot = defaultPaths.snapshot } = {}) {
  const generated = await generateContractsText(snapshot);
  await atomicWrite(output, generated);
  return Object.freeze({ bytes: Buffer.byteLength(generated), sha256: sha256(generated) });
}

export async function checkContracts({ output = defaultPaths.output, snapshot = defaultPaths.snapshot } = {}) {
  const expected = await generateContractsText(snapshot);
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

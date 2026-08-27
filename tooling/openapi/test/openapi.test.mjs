import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { checkContracts, fetchSnapshot, generateContracts, OpenApiContractError } from '../src/index.mjs';

const validSpec = paths =>
  JSON.stringify({
    openapi: '3.1.0',
    info: { title: 'fixture', version: '1' },
    paths,
    components: { schemas: { Message: { type: 'object', properties: { value: { type: 'string' } } } } }
  });

test('invalid and missing sources preserve the last-known-good snapshot', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'namewta-openapi-'));
  const destination = join(directory, 'source.json');
  const invalid = join(directory, 'invalid.json');
  await writeFile(destination, validSpec({}));
  await writeFile(invalid, '{"openapi":"2.0"}');

  await assert.rejects(fetchSnapshot({ destination, source: invalid }), OpenApiContractError);
  assert.equal(await readFile(destination, 'utf8'), validSpec({}));
  await assert.rejects(fetchSnapshot({ destination, source: join(directory, 'missing.json') }), OpenApiContractError);
  assert.equal(await readFile(destination, 'utf8'), validSpec({}));
});

test('valid fetch replaces the snapshot only after validation', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'namewta-openapi-'));
  const destination = join(directory, 'source.json');
  const source = join(directory, 'next.json');
  await writeFile(destination, validSpec({}));
  await writeFile(source, validSpec({ '/ready': { get: { responses: { 200: { description: 'ok' } } } } }));

  const result = await fetchSnapshot({ destination, source });
  assert.equal(result.paths, 1);
  assert.equal(await readFile(destination, 'utf8'), await readFile(source, 'utf8'));
});

test('check detects source drift and manual generated-file edits without writing', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'namewta-openapi-'));
  const snapshot = join(directory, 'source.json');
  const output = join(directory, 'openapi.ts');
  await writeFile(snapshot, validSpec({}));
  await generateContracts({ output, snapshot });
  const baseline = await readFile(output, 'utf8');
  await checkContracts({ output, snapshot });

  await writeFile(snapshot, validSpec({ '/drift': { get: { responses: { 200: { description: 'ok' } } } } }));
  await assert.rejects(checkContracts({ output, snapshot }), /drift detected/);
  assert.equal(await readFile(output, 'utf8'), baseline);

  await generateContracts({ output, snapshot });
  await checkContracts({ output, snapshot });
  await writeFile(output, `${await readFile(output, 'utf8')}\n// manual edit\n`);
  await assert.rejects(checkContracts({ output, snapshot }), /drift detected/);
});

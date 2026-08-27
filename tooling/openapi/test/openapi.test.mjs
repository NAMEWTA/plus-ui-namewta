import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { checkContracts, fetchSnapshot, generateContracts, OpenApiContractError } from '../src/index.mjs';

const backendCommit = 'a98d6edcc591550221dd983e293d43e3aac36d23';
const validSpec = paths =>
  JSON.stringify({
    openapi: '3.1.0',
    info: { title: 'fixture', version: '1' },
    paths,
    components: { schemas: { Message: { type: 'object', properties: { value: { type: 'string' } } } } }
  });

async function fixture(t) {
  const directory = await mkdtemp(join(tmpdir(), 'namewta-openapi-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return {
    directory,
    output: join(directory, 'openapi.ts'),
    provenance: join(directory, 'provenance.json'),
    snapshot: join(directory, 'source.json')
  };
}

const fetchFixture = ({ provenance, snapshot }, source) =>
  fetchSnapshot({ backendCommit, destination: snapshot, provenance, source });

test('invalid and missing sources preserve the last-known-good snapshot and provenance', async t => {
  const paths = await fixture(t);
  const baseline = join(paths.directory, 'baseline.json');
  const invalid = join(paths.directory, 'invalid.json');
  await writeFile(baseline, validSpec({}));
  await writeFile(invalid, '{"openapi":"2.0"}');
  await fetchFixture(paths, baseline);
  const snapshotBefore = await readFile(paths.snapshot, 'utf8');
  const provenanceBefore = await readFile(paths.provenance, 'utf8');

  await assert.rejects(fetchFixture(paths, invalid), OpenApiContractError);
  await assert.rejects(fetchFixture(paths, join(paths.directory, 'missing.json')), OpenApiContractError);
  assert.equal(await readFile(paths.snapshot, 'utf8'), snapshotBefore);
  assert.equal(await readFile(paths.provenance, 'utf8'), provenanceBefore);
});

test('valid fetch replaces snapshot and machine provenance after validation', async t => {
  const paths = await fixture(t);
  const source = join(paths.directory, 'next.json');
  await writeFile(source, validSpec({ '/ready': { get: { responses: { 200: { description: 'ok' } } } } }));

  const result = await fetchFixture(paths, source);
  const provenance = JSON.parse(await readFile(paths.provenance, 'utf8'));
  assert.equal(result.paths, 1);
  assert.equal(await readFile(paths.snapshot, 'utf8'), await readFile(source, 'utf8'));
  assert.equal(provenance.backendCommit, backendCommit);
  assert.equal(provenance.generator, 'openapi-typescript@7.13.0');
  assert.deepEqual(provenance.totals, { paths: 1, schemas: 1, tags: 0 });
  assert.equal(provenance.rawSha256, result.sha256);
});

test('generation rejects stale provenance before checking generated output', async t => {
  const paths = await fixture(t);
  const source = join(paths.directory, 'source-next.json');
  await writeFile(source, validSpec({}));
  await fetchFixture(paths, source);
  await generateContracts(paths);
  await writeFile(paths.snapshot, validSpec({ '/drift': { get: { responses: { 200: { description: 'ok' } } } } }));

  await assert.rejects(checkContracts(paths), /provenance drift detected/);
  await assert.rejects(generateContracts(paths), /provenance drift detected/);

  await writeFile(paths.provenance, 'null\n');
  await assert.rejects(checkContracts(paths), /provenance is missing or invalid/);
});

test('check detects source drift and manual generated-file edits without writing', async t => {
  const paths = await fixture(t);
  const source = join(paths.directory, 'source-next.json');
  await writeFile(source, validSpec({}));
  await fetchFixture(paths, source);
  await generateContracts(paths);
  const baseline = await readFile(paths.output, 'utf8');
  await checkContracts(paths);

  await writeFile(source, validSpec({ '/drift': { get: { responses: { 200: { description: 'ok' } } } } }));
  await fetchFixture(paths, source);
  await assert.rejects(checkContracts(paths), /contract drift detected/);
  assert.equal(await readFile(paths.output, 'utf8'), baseline);

  await generateContracts(paths);
  await checkContracts(paths);
  await writeFile(paths.output, `${await readFile(paths.output, 'utf8')}\n// manual edit\n`);
  await assert.rejects(checkContracts(paths), /contract drift detected/);
});

test('HTTP source errors redact credentials and query parameters', async () => {
  const source = 'http://user:secret@127.0.0.1:1/contracts?token=sensitive#fragment';
  await assert.rejects(
    fetchSnapshot({ backendCommit, source }),
    error =>
      error instanceof OpenApiContractError &&
      error.message.includes('http://127.0.0.1:1/contracts') &&
      !error.message.includes('secret') &&
      !error.message.includes('token') &&
      !error.message.includes('sensitive')
  );
});

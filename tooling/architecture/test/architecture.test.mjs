import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, test } from 'node:test';
import { runArchitectureCheck } from '../src/index.mjs';

const temporaryRoots = [];
const architectureRoot = dirname(dirname(fileURLToPath(import.meta.url)));

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

async function writeFixtureFile(root, relativePath, content) {
  const path = join(root, relativePath);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content);
}

async function createFixture() {
  const root = await mkdtemp(join(tmpdir(), 'namewta-architecture-'));
  temporaryRoots.push(root);
  await writeJson(join(root, 'package.json'), {
    name: 'fixture-root',
    private: true,
    type: 'module'
  });
  await writeJson(join(root, 'tooling/architecture/baseline.json'), {
    schemaVersion: 1,
    maximumViolations: 0,
    violations: []
  });
  return root;
}

async function addPackage(root, relativePath, name, dependencies = {}, imports = []) {
  await writeJson(join(root, relativePath, 'package.json'), {
    name,
    version: '0.0.0',
    private: true,
    type: 'module',
    exports: { '.': './src/index.js' },
    dependencies
  });
  await writeFixtureFile(
    root,
    join(relativePath, 'src/index.js'),
    `${imports.map((specifier) => `import '${specifier}';`).join('\n')}\nexport const active = true;\n`
  );
}

async function check(root) {
  return runArchitectureCheck({ root, architectureRoot });
}

function assertFailure(result, rule, source, target, path) {
  assert.equal(result.exitCode, 1, result.output);
  assert.match(result.output, new RegExp(`\\[${rule}\\]`));
  assert.match(result.output, new RegExp(`source=${source.replaceAll('/', '\\/')}`));
  assert.match(result.output, new RegExp(`target=${target.replaceAll('/', '\\/')}`));
  assert.match(result.output, new RegExp(`path=${path.replaceAll('/', '\\/')}`));
}

test('accepts a valid public dependency graph without reading environment files', async () => {
  const root = await createFixture();
  await addPackage(root, 'packages/platform/http', '@namewta/platform-http');
  await addPackage(
    root,
    'packages/domains/identity-access',
    '@namewta/domain-identity-access',
    { '@namewta/platform-http': 'workspace:*' },
    ['@namewta/platform-http']
  );
  await addPackage(
    root,
    'packages/web-domains/identity-access-web',
    '@namewta/web-domain-identity-access',
    { '@namewta/domain-identity-access': 'workspace:*' },
    ['@namewta/domain-identity-access']
  );
  await addPackage(root, 'packages/adapters/browser-request', '@namewta/adapter-browser-request', {
    '@namewta/platform-http': 'workspace:*'
  });
  await addPackage(
    root,
    'apps/admin-web',
    '@namewta/admin-web',
    {
      '@namewta/adapter-browser-request': 'workspace:*',
      '@namewta/web-domain-identity-access': 'workspace:*'
    },
    ['@namewta/adapter-browser-request', '@namewta/web-domain-identity-access']
  );
  await writeFixtureFile(root, '.env', 'ARCHITECTURE_SENTINEL=must-not-be-read\n');

  const result = await check(root);

  assert.equal(result.exitCode, 0, result.output);
  assert.doesNotMatch(result.output, /ARCHITECTURE_SENTINEL|must-not-be-read/);
});

test('rejects an internal deep import with a localized public-entry diagnostic', async () => {
  const root = await createFixture();
  await addPackage(root, 'packages/domains/demo', '@namewta/domain-demo');
  await addPackage(
    root,
    'apps/admin-web',
    '@namewta/admin-web',
    { '@namewta/domain-demo': 'workspace:*' },
    ['@namewta/domain-demo/internal.js']
  );

  const result = await check(root);
  assertFailure(result, 'public-entry', '@namewta/admin-web', '@namewta/domain-demo', 'apps/admin-web/src/index.js');
  assert.equal(result.violations.filter((item) => item.rule === 'public-entry').length, 1, result.output);
  assert.doesNotMatch(result.output, /source=fixture-root/);
});

test('rejects a platform to domain reverse edge', async () => {
  const root = await createFixture();
  await addPackage(root, 'packages/domains/demo', '@namewta/domain-demo');
  await addPackage(
    root,
    'packages/platform/http',
    '@namewta/platform-http',
    { '@namewta/domain-demo': 'workspace:*' },
    ['@namewta/domain-demo']
  );

  assertFailure(
    await check(root),
    'dependency-direction',
    '@namewta/platform-http',
    '@namewta/domain-demo',
    'packages/platform/http/package.json#dependencies'
  );
});

test('rejects a concrete adapter to domain reverse edge', async () => {
  const root = await createFixture();
  await addPackage(root, 'packages/domains/demo', '@namewta/domain-demo');
  await addPackage(
    root,
    'packages/adapters/browser-request',
    '@namewta/adapter-browser-request',
    { '@namewta/domain-demo': 'workspace:*' },
    ['@namewta/domain-demo']
  );

  assertFailure(
    await check(root),
    'dependency-direction',
    '@namewta/adapter-browser-request',
    '@namewta/domain-demo',
    'packages/adapters/browser-request/package.json#dependencies'
  );
});

test('rejects an internal dependency cycle', async () => {
  const root = await createFixture();
  await addPackage(root, 'packages/domains/a', '@namewta/domain-a', { '@namewta/domain-b': 'workspace:*' }, [
    '@namewta/domain-b'
  ]);
  await addPackage(root, 'packages/domains/b', '@namewta/domain-b', { '@namewta/domain-a': 'workspace:*' }, [
    '@namewta/domain-a'
  ]);

  const result = await check(root);
  assertFailure(result, 'dependency-cycle', '@namewta/domain-a', '@namewta/domain-a', 'dependency graph');
  assert.match(result.output, /@namewta\/domain-a -> @namewta\/domain-b -> @namewta\/domain-a/);
});

test('rejects growth of the reviewed baseline', async () => {
  const root = await createFixture();
  await writeJson(join(root, 'tooling/architecture/baseline.json'), {
    schemaVersion: 1,
    maximumViolations: 0,
    violations: [
      {
        rule: 'public-entry',
        source: '@namewta/example',
        target: '@namewta/internal',
        path: 'apps/example/src/main.ts'
      }
    ]
  });

  assertFailure(
    await check(root),
    'baseline-growth',
    'tooling/architecture/baseline.json',
    'reviewed baseline',
    'tooling/architecture/baseline.json'
  );
});

test('rejects activation of an explicitly inactive placeholder', async () => {
  const root = await createFixture();
  await addPackage(root, 'apps/mobile-web', '@namewta/mobile-web');

  assertFailure(
    await check(root),
    'placeholder-activation',
    '@namewta/mobile-web',
    'inactive placeholder',
    'apps/mobile-web/package.json'
  );
});

import { access, readdir, readFile } from 'node:fs/promises';
import { extname, join, relative, resolve, sep } from 'node:path';

const dependencyFields = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
const sourceExtensions = new Set(['.cjs', '.js', '.jsx', '.mjs', '.ts', '.tsx', '.vue']);
const ignoredDirectories = new Set(['.git', '.output', '.vite', 'coverage', 'dist', 'node_modules']);
const inactivePlaceholders = [
  'apps/mobile-web',
  'apps/miniapp-taro',
  'packages/adapters/taro-request',
  'packages/adapters/taro-storage'
];

function toPosix(path) {
  return path.split(sep).join('/');
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function childDirectories(path) {
  if (!(await exists(path))) return [];
  return (await readdir(path, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => join(path, entry.name))
    .toSorted();
}

async function discoverManifestDirectories(root) {
  const directories = [root];
  const apps = await childDirectories(join(root, 'apps'));
  const packageGroups = await childDirectories(join(root, 'packages'));
  const tooling = await childDirectories(join(root, 'tooling'));
  directories.push(...apps, ...packageGroups, ...tooling);
  for (const group of packageGroups) directories.push(...(await childDirectories(group)));

  const unique = [...new Set(directories.map((path) => resolve(path)))];
  const manifests = [];
  for (const directory of unique) {
    const manifestPath = join(directory, 'package.json');
    if (await exists(manifestPath)) manifests.push({ directory, manifestPath });
  }
  return manifests;
}

function packageLayer(relativeDirectory) {
  if (relativeDirectory === '.') return 'app';
  if (relativeDirectory.startsWith('apps/')) return 'app';
  if (relativeDirectory.startsWith('packages/platform/')) return 'platform';
  if (relativeDirectory.startsWith('packages/domains/')) return 'domain';
  if (relativeDirectory.startsWith('packages/web-domains/')) return 'web-domain';
  if (relativeDirectory.startsWith('packages/web-kit/')) return 'web-kit';
  if (relativeDirectory.startsWith('packages/adapters/')) return 'adapter';
  if (relativeDirectory === 'packages/api-contracts') return 'api-contracts';
  if (relativeDirectory.startsWith('tooling/')) return 'tooling';
  return 'unknown';
}

function violation(rule, source, target, path, message) {
  return { rule, source, target, path, message };
}

function formatViolation(item) {
  return `[${item.rule}] source=${item.source} target=${item.target} path=${item.path} message=${item.message}`;
}

function fingerprint(item) {
  return `${item.rule}\u0000${item.source}\u0000${item.target}\u0000${item.path}`;
}

function internalPackageName(specifier) {
  if (!specifier.startsWith('@')) return specifier.split('/')[0];
  return specifier.split('/').slice(0, 2).join('/');
}

function exportedSubpath(manifest, specifier) {
  const suffix = specifier.slice(manifest.name.length);
  const requested = suffix ? `.${suffix}` : '.';
  const exportsField = manifest.exports;
  if (requested === '.') {
    if (typeof exportsField === 'string' || Array.isArray(exportsField)) return true;
    return Boolean(exportsField && typeof exportsField === 'object' && '.' in exportsField);
  }
  if (!exportsField || typeof exportsField !== 'object' || Array.isArray(exportsField)) return false;
  return Object.keys(exportsField).some((key) => {
    if (key === requested) return true;
    if (!key.includes('*')) return false;
    const [prefix, suffixPattern] = key.split('*');
    return requested.startsWith(prefix) && requested.endsWith(suffixPattern);
  });
}

function forbiddenDirection(sourceLayer, targetLayer) {
  const forbidden = {
    platform: new Set(['adapter', 'app', 'domain', 'web-domain', 'web-kit']),
    domain: new Set(['adapter', 'app', 'web-domain', 'web-kit']),
    adapter: new Set(['adapter', 'app', 'domain', 'web-domain', 'web-kit']),
    'web-kit': new Set(['adapter', 'app', 'domain', 'web-domain']),
    'web-domain': new Set(['adapter', 'app', 'web-domain']),
    'api-contracts': new Set(['adapter', 'app', 'domain', 'platform', 'web-domain', 'web-kit']),
    tooling: new Set(['adapter', 'app', 'domain', 'platform', 'web-domain', 'web-kit'])
  };
  return forbidden[sourceLayer]?.has(targetLayer) ?? false;
}

async function sourceFiles(directory, excludedDirectories) {
  const result = [];
  async function visit(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || ignoredDirectories.has(entry.name)) continue;
      const path = join(current, entry.name);
      if (entry.isDirectory() && !excludedDirectories.has(path)) await visit(path);
      else if (entry.isFile() && sourceExtensions.has(extname(entry.name))) result.push(path);
    }
  }
  await visit(directory);
  return result.toSorted();
}

function importedSpecifiers(source) {
  const results = new Set();
  const patterns = [
    /\b(?:import|export)\s+(?:[^'";]*?\s+from\s+)?['"]([^'"]+)['"]/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) results.add(match[1]);
  }
  return [...results];
}

function findCycles(packagesByName, graph) {
  const cycles = [];
  const state = new Map();
  const stack = [];
  const seen = new Set();

  function visit(name) {
    state.set(name, 'visiting');
    stack.push(name);
    for (const target of [...(graph.get(name) ?? [])].toSorted()) {
      if (!packagesByName.has(target)) continue;
      if (!state.has(target)) visit(target);
      else if (state.get(target) === 'visiting') {
        const start = stack.indexOf(target);
        const cycle = [...stack.slice(start), target];
        const nodes = cycle.slice(0, -1);
        const rotations = nodes.map((_, index) => [...nodes.slice(index), ...nodes.slice(0, index)]);
        const sortedRotations = rotations.toSorted((a, b) => a.join('\u0000').localeCompare(b.join('\u0000')));
        const canonical = [...sortedRotations[0], sortedRotations[0][0]];
        const key = canonical.join('\u0000');
        if (!seen.has(key)) {
          seen.add(key);
          cycles.push(canonical);
        }
      }
    }
    stack.pop();
    state.set(name, 'visited');
  }

  for (const name of [...packagesByName.keys()].toSorted()) {
    if (!state.has(name)) visit(name);
  }
  return cycles;
}

function baselineEntry(entry) {
  return {
    rule: String(entry.rule ?? ''),
    source: String(entry.source ?? ''),
    target: String(entry.target ?? ''),
    path: String(entry.path ?? '')
  };
}

export async function inspectWorkspace({ root }) {
  const absoluteRoot = resolve(root);
  const detected = [];
  const manifestLocations = await discoverManifestDirectories(absoluteRoot);
  const packages = [];
  const packagesByName = new Map();

  for (const location of manifestLocations) {
    const relativeDirectory = toPosix(relative(absoluteRoot, location.directory)) || '.';
    let manifest;
    try {
      manifest = await readJson(location.manifestPath);
    } catch (error) {
      detected.push(
        violation(
          'manifest-validity',
          relativeDirectory,
          'valid JSON',
          `${relativeDirectory}/package.json`,
          error instanceof Error ? error.message : String(error)
        )
      );
      continue;
    }
    const item = { directory: location.directory, relativeDirectory, manifest, layer: packageLayer(relativeDirectory) };
    packages.push(item);
    if (typeof manifest.name !== 'string' || !manifest.name) {
      detected.push(
        violation('manifest-name', relativeDirectory, 'unique package name', `${relativeDirectory}/package.json`, 'Package name is required')
      );
      continue;
    }
    if (packagesByName.has(manifest.name)) {
      detected.push(
        violation(
          'manifest-name',
          manifest.name,
          packagesByName.get(manifest.name).relativeDirectory,
          `${relativeDirectory}/package.json`,
          'Package name must be unique'
        )
      );
    } else {
      packagesByName.set(manifest.name, item);
    }
  }

  for (const relativeDirectory of inactivePlaceholders) {
    const manifestPath = join(absoluteRoot, relativeDirectory, 'package.json');
    if (!(await exists(manifestPath))) continue;
    let name = relativeDirectory;
    try {
      name = (await readJson(manifestPath)).name ?? relativeDirectory;
    } catch {
      // Manifest validity is reported by the regular discovery pass.
    }
    detected.push(
      violation(
        'placeholder-activation',
        name,
        'inactive placeholder',
        `${relativeDirectory}/package.json`,
        'This App or Taro adapter cannot be activated in the current change'
      )
    );
  }

  const graph = new Map();
  for (const item of packages) {
    const name = item.manifest.name ?? item.relativeDirectory;
    graph.set(name, new Set());
    if (item.relativeDirectory !== '.' && item.manifest.private !== true) {
      detected.push(
        violation(
          'package-private',
          name,
          'private workspace package',
          `${item.relativeDirectory}/package.json`,
          'Activated packages must set private=true'
        )
      );
    }
    if (item.layer !== 'app' && !item.manifest.exports) {
      detected.push(
        violation(
          'public-entry',
          name,
          'declared exports',
          `${item.relativeDirectory}/package.json#exports`,
          'Non-App packages must declare public exports'
        )
      );
    }

    for (const field of dependencyFields) {
      for (const [targetName, specification] of Object.entries(item.manifest[field] ?? {})) {
        const target = packagesByName.get(targetName);
        if (!target) continue;
        graph.get(name).add(targetName);
        const dependencyPath = `${item.relativeDirectory}/package.json#${field}`;
        if (specification !== 'workspace:*') {
          detected.push(
            violation(
              'workspace-reference',
              name,
              targetName,
              dependencyPath,
              `Internal dependency must use workspace:*; received ${specification}`
            )
          );
        }
        if (forbiddenDirection(item.layer, target.layer)) {
          detected.push(
            violation(
              'dependency-direction',
              name,
              targetName,
              dependencyPath,
              `${item.layer} packages cannot depend on ${target.layer} packages`
            )
          );
        }
      }
    }
  }

  for (const cycle of findCycles(packagesByName, graph)) {
    detected.push(
      violation(
        'dependency-cycle',
        cycle[0],
        cycle[0],
        'dependency graph',
        `Internal package cycle: ${cycle.join(' -> ')}`
      )
    );
  }

  for (const item of packages) {
    const sourceName = item.manifest.name ?? item.relativeDirectory;
    const childWorkspaceRoots = new Set(
      packages
        .filter((candidate) => candidate.directory.startsWith(`${item.directory}${sep}`))
        .map((candidate) => candidate.directory)
    );
    for (const file of await sourceFiles(item.directory, childWorkspaceRoots)) {
      const source = await readFile(file, 'utf8');
      for (const specifier of importedSpecifiers(source)) {
        const targetName = internalPackageName(specifier);
        const target = packagesByName.get(targetName);
        if (!target || exportedSubpath(target.manifest, specifier)) continue;
        detected.push(
          violation(
            'public-entry',
            sourceName,
            targetName,
            toPosix(relative(absoluteRoot, file)),
            `Internal import ${specifier} is not exposed by ${targetName}`
          )
        );
      }
    }
  }

  return { root: absoluteRoot, packages, detected };
}

export async function createBaseline({ root }) {
  const inspection = await inspectWorkspace({ root });
  const entries = inspection.detected
    .map(baselineEntry)
    .toSorted((a, b) => fingerprint(a).localeCompare(fingerprint(b)));
  return {
    schemaVersion: 1,
    maximumViolations: entries.length,
    violations: entries
  };
}

export async function runArchitectureCheck({ root }) {
  const inspection = await inspectWorkspace({ root });
  const baselinePath = join(inspection.root, 'tooling/architecture/baseline.json');
  const failures = [];
  let baseline;
  try {
    baseline = await readJson(baselinePath);
  } catch (error) {
    failures.push(
      violation(
        'baseline-integrity',
        'tooling/architecture/baseline.json',
        'readable explicit baseline',
        'tooling/architecture/baseline.json',
        error instanceof Error ? error.message : String(error)
      )
    );
    baseline = { schemaVersion: 1, maximumViolations: 0, violations: [] };
  }

  const entries = Array.isArray(baseline.violations) ? baseline.violations.map(baselineEntry) : [];
  if (baseline.schemaVersion !== 1 || !Number.isInteger(baseline.maximumViolations) || baseline.maximumViolations < 0) {
    failures.push(
      violation(
        'baseline-integrity',
        'tooling/architecture/baseline.json',
        'schemaVersion=1 and non-negative integer maximumViolations',
        'tooling/architecture/baseline.json',
        'Baseline metadata is invalid'
      )
    );
  }
  if (!Array.isArray(baseline.violations)) {
    failures.push(
      violation(
        'baseline-integrity',
        'tooling/architecture/baseline.json',
        'violations array',
        'tooling/architecture/baseline.json',
        'Baseline violations must be an array'
      )
    );
  } else if (entries.length > baseline.maximumViolations) {
    failures.push(
      violation(
        'baseline-growth',
        'tooling/architecture/baseline.json',
        'reviewed baseline',
        'tooling/architecture/baseline.json',
        `Baseline contains ${entries.length} entries but maximumViolations is ${baseline.maximumViolations}`
      )
    );
  }

  const known = new Set(entries.map(fingerprint));
  const actual = new Set(inspection.detected.map(fingerprint));
  failures.push(...inspection.detected.filter((item) => !known.has(fingerprint(item))));
  for (const entry of entries) {
    if (!actual.has(fingerprint(entry))) {
      failures.push(
        violation(
          'baseline-stale',
          entry.source,
          entry.target,
          entry.path,
          `Remove resolved baseline entry for ${entry.rule}`
        )
      );
    }
  }

  const sortedFailures = failures.toSorted((a, b) => fingerprint(a).localeCompare(fingerprint(b)));
  const summary = sortedFailures.length
    ? `Architecture check failed: ${sortedFailures.length} violation(s).`
    : `Architecture check passed: ${inspection.packages.length} workspace package(s), ${entries.length} reviewed baseline violation(s).`;
  const output = [...sortedFailures.map(formatViolation), summary].join('\n');
  return {
    exitCode: sortedFailures.length ? 1 : 0,
    output,
    packages: inspection.packages.map((item) => ({ name: item.manifest.name, path: item.relativeDirectory })),
    violations: sortedFailures
  };
}

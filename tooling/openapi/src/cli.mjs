#!/usr/bin/env node
import { checkContracts, defaultPaths, fetchSnapshot, generateContracts, OpenApiContractError } from './index.mjs';

function option(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

const command = process.argv[2];

try {
  if (command === 'fetch') {
    const result = await fetchSnapshot({
      backendCommit: option('backend-commit'),
      backendRepository: option('backend-repository') ?? 'ruoyi-vue-plus-namewta',
      destination: option('snapshot') ?? defaultPaths.snapshot,
      provenance: option('provenance') ?? defaultPaths.provenance,
      runtimeEndpoint: option('runtime-endpoint') ?? '/v3/api-docs',
      source: option('source')
    });
    console.log(`OpenAPI snapshot updated: ${result.paths} paths, ${result.schemas} schemas, sha256=${result.sha256}`);
  } else if (command === 'generate') {
    const result = await generateContracts({
      output: option('output') ?? defaultPaths.output,
      provenance: option('provenance') ?? defaultPaths.provenance,
      snapshot: option('snapshot') ?? defaultPaths.snapshot
    });
    console.log(`OpenAPI contract generated: ${result.bytes} bytes, sha256=${result.sha256}`);
  } else if (command === 'check') {
    const result = await checkContracts({
      output: option('output') ?? defaultPaths.output,
      provenance: option('provenance') ?? defaultPaths.provenance,
      snapshot: option('snapshot') ?? defaultPaths.snapshot
    });
    console.log(`OpenAPI contract is current: ${result.bytes} bytes, sha256=${result.sha256}`);
  } else {
    throw new OpenApiContractError(
      'Usage: namewta-openapi <fetch|generate|check> [--source <url-or-file>] [--backend-commit <sha>]'
    );
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}

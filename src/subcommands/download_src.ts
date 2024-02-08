// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

import { API, APIError } from "../utils/api.ts";
import { Args as RawArgs } from "../args.ts";
import { error } from "../error.ts";
import TokenProvisioner from "../utils/access_token.ts";
import { unreachable } from "https://deno.land/std@0.194.0/testing/asserts.ts";

const help = `deployctl download-src
Download the source code of a deployment, either to stdout (by default) or to the specified directory.

USAGE:
    deployctl download-src [OPTIONS] <DEPLOYMENT_ID>

POSITIONAL ARGUMENTS:
    <DEPLOYMENT_ID>    The deployment ID to download. Example: abcd1234

OPTIONS:
        -h, --help         Prints this help information
        --stdout           Write the downloaded source code to stdout. Exclusive with --output-dir.
                           If neither --stdout nor --output-dir is given, defaults to stdout.
        --output-dir=<DIR> Write the downloaded source code to within the specified directory. Exclusive with --stdout.
                           If neither --stdout nor --output-dir is given, defaults to stdout.
        --token=<TOKEN>    The API token to use (defaults to DENO_DEPLOY_TOKEN env var)
`;

export default async function (rawArgs: RawArgs): Promise<void> {
  const args = parseArgsForDownloadSrcSubcommand(rawArgs);
  switch (args.mode) {
    case "help":
      console.log(help);
      Deno.exit(0);
      break;
    case "download":
      await downloadSrc(args);
      break;
    default: {
      const _: never = args;
      unreachable();
    }
  }
}

async function downloadSrc(args: DownloadSrcArgsDownloadMode): Promise<void> {
  const api = args.token
    ? API.fromToken(args.token)
    : API.withTokenProvisioner(TokenProvisioner);
  const stream = await api.downloadDeployment(args.deploymentId);
  try {
    for await (const entry of stream) {
      switch (args.outputTo.to) {
        case "stdout":
          console.log(`----------------------------------------
specifier: ${entry.specifier}
kind:      ${entry.kind}

${entry.source}
`);
          break;
        case "fs":
          unreachable();
          break;
        default: {
          const _: never = args.outputTo;
          unreachable();
        }
      }
    }
  } catch (err: unknown) {
    if (err instanceof APIError) {
      error(`Failed to download the source code: ${err.message}`);
    }
    throw err;
  }
}

type OutputTo = {
  to: "stdout";
} | {
  to: "fs";
  dir: string;
};

type DownloadSrcArgs = DownloadSrcArgsHelpMode | DownloadSrcArgsDownloadMode;

type DownloadSrcArgsHelpMode = {
  mode: "help";
};

type DownloadSrcArgsDownloadMode = {
  mode: "download";
  outputTo: OutputTo;
  deploymentId: string;
  token: string | null;
};

export function parseArgsForDownloadSrcSubcommand(
  rawArgs: RawArgs,
): DownloadSrcArgs {
  if (rawArgs.help) {
    return {
      mode: "help",
    };
  }

  const deploymentId = rawArgs._.at(0)?.toString();
  if (deploymentId === undefined) {
    error(
      "Deployment ID is required but not provided. See 'deployctl download-src --help' for more info.",
    );
  }

  const { stdout, token } = rawArgs;
  const outputDir = rawArgs["output-dir"];

  if (stdout && typeof outputDir === "string") {
    return {
      mode: "download",
      outputTo: {
        to: "stdout",
      },
      deploymentId,
      token: token ?? null,
    };
  }

  if (typeof outputDir === "string") {
    return {
      mode: "download",
      outputTo: {
        to: "fs",
        dir: outputDir,
      },
      deploymentId,
      token: token ?? null,
    };
  }

  return {
    mode: "download",
    outputTo: {
      to: "stdout",
    },
    deploymentId,
    token: token ?? null,
  };
}

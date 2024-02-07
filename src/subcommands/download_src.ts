// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

import { output } from "../../tests/utils.ts";
import { Args as RawArgs } from "../args.ts";
import { error } from "../error.ts";

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
`;

type OutputTo = {
  to: "stdout";
} | {
  to: "fs";
  dir: string;
};

type DownloadSrcArgs = {
  mode: "help";
} | {
  mode: "download";
  outputTo: OutputTo;
  deploymentId: string;
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

  const stdout = rawArgs.stdout;
  const outputDir = rawArgs["output-dir"];

  if (stdout && typeof outputDir === "string") {
    return {
      mode: "download",
      outputTo: {
        to: "stdout",
      },
      deploymentId,
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
    };
  }

  return {
    mode: "download",
    outputTo: {
      to: "stdout",
    },
    deploymentId,
  };
}

export default async function (rawArgs: RawArgs): Promise<void> {
  const deploymentId = rawArgs._.at(0)?.toString();
  if (deploymentId === undefined) {
    error(
      "Deployment ID is required but not provided. See 'deployctl download-src --help' for more info.",
    );
  }
  console.log(deploymentId, typeof deploymentId);
}

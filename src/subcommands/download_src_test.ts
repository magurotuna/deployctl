import { parseArgsForDownloadSrcSubcommand } from "./download_src.ts";
import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.194.0/testing/asserts.ts";
import { parseArgs } from "../args.ts";

Deno.test("parseArgsForDownloadSrcSubcommand", async (t) => {
  const parseHelper = (args: string[]) =>
    // NOTE: We omit `download-src` subcommand from the arguments passed to
    // `parseArgs()` in order to match the actual behavior; the first positional argument is
    // removed using `args._.shift()` in `deployctl.ts`.
    parseArgsForDownloadSrcSubcommand(parseArgs(args));

  await t.step("specify help", () => {
    const got = parseHelper(["--help"]);
    assertEquals(got, {
      mode: "help",
    });
  });

  await t.step("specify help and deployment ID (help takes precedence)", () => {
    const got = parseHelper(["--help", "abcd1234"]);
    assertEquals(got, {
      mode: "help",
    });
  });

  await t.step("specify deployment ID", () => {
    const got = parseHelper(["abcd1234"]);
    assertEquals(got, {
      mode: "download",
      outputTo: {
        to: "stdout",
      },
      deploymentId: "abcd1234",
    });
  });

  await t.step("specify stdout and deployment ID", () => {
    const got = parseHelper(["--stdout", "abcd1234"]);
    assertEquals(got, {
      mode: "download",
      outputTo: {
        to: "stdout",
      },
      deploymentId: "abcd1234",
    });
  });

  await t.step("specify stdout and deployment ID is missing", () => {
    assertThrows(() => parseHelper(["--stdout"]), Error, "exit code: 1");
  });

  // FIXME
  await t.step("specify output-dir and deployment ID", () => {
    const got = parseHelper(["--output-dir=./out", "abcd1234"]);
    assertEquals(got, {
      mode: "download",
      outputTo: {
        to: "fs",
        dir: "./out",
      },
      deploymentId: "abcd1234",
    });
  });

  await t.step("specify output-dir and deployment ID is missing", () => {
    assertThrows(
      () => parseHelper(["--output-dir=./out"]),
      Error,
      "exit code: 1",
    );
  });

  await t.step(
    "specify stdout, output-dir, and deployment ID (stdout takes precedence)",
    () => {
      const got = parseHelper(["--stdout", "--output-dir=./out", "abcd1234"]);
      assertEquals(got, {
        mode: "download",
        outputTo: {
          to: "stdout",
        },
        deploymentId: "abcd1234",
      });
    },
  );
});

import { readFile, existsSync, writeFile } from "fs";
import * as util from "util";
import prettier from "prettier";
import { Command } from "commander";

const readScript = util.promisify(readFile);

const program = new Command();

program.option("--out-file <path>", "the output file");

const {
  args: [inFile],
} = program.parse();
const { outFile } = program.opts();

async function addAwait(inputPath, outputPath) {
  // check if the file exists
  if (existsSync(inputPath)) {
    const script = await readScript(inputPath, {
      encoding: "utf-8",
    });

    let fixedScript = script
      .split("\n")
      .filter((line) => !/(^await main\(\);$|^main\(\);$)/.test(line));

    fixedScript.push("await main();");
    fixedScript = fixedScript.join("\n");
    fixedScript = prettier.format(fixedScript, {
      parser: "babel",
    });
    writeFile(outputPath, fixedScript, "utf-8", () =>
      console.log(`Script written to: ${outputPath}`)
    );
  }
}

await addAwait(inFile, outFile);

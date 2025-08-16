#!/usr/bin/env ts-node
/** Wrapper to generate tokens CSS file. */
import { writeFileSync } from "fs";

import { generateTokensCSS } from "./lib/generateTokens";

const css = generateTokensCSS();
writeFileSync("src/styles/generated-tokens.css", css, "utf8");
console.log("Generated src/styles/generated-tokens.css");

import test from "node:test";
import assert from "node:assert/strict";
import { cn, formatCurrency, formatNumber } from "../lib/utils.ts";

test("cn merges class names properly", () => {
  assert.equal(cn("foo", "bar"), "foo bar");
  assert.equal(cn("text-red-500", "text-blue-500"), "text-blue-500");
  assert.equal(cn("p-4", false && "hidden", "m-2"), "p-4 m-2");
});

test("formatCurrency formats USD correctly", () => {
  const result = formatCurrency(1250.5);
  assert.match(result, /\$1,250\.50/);
});

test("formatCurrency handles zero", () => {
  const result = formatCurrency(0);
  assert.match(result, /\$0\.00/);
});

test("formatNumber formats thousands with commas", () => {
  assert.equal(formatNumber(1000), "1,000");
  assert.equal(formatNumber(1542389), "1,542,389");
  assert.equal(formatNumber(0), "0");
});

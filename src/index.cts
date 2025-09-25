/*!
  Portions of this code are adapted for type safety from the following open-source repositories:
  - deepequal: https://github.com/JayceTDE/deepequal (c) Jayce Pulsipher <https://github.com/jaycetde>
  - fast-apply: https://npmjs.org/package/fast-apply (c) Jayce Pulsipher <https://github.com/jaycetde>
  - is-args: https://npmjs.org/package/is-args (c) Jayce Pulsipher <https://github.com/jaycetde>

  Copyright (c) Jayce Pulsipher and contributors
  Licensed under the MIT License (MIT)

  If you use this code, please retain this notice and the original repository links as credit to the original authors.
*/

// biome-ignore  lint/suspicious/noExplicitAny : just types def
type Fn = (...args: any[]) => any;
// biome-ignore  lint/suspicious/noExplicitAny : just types def
const isArg = (val: any) => {
  return (
    !!val && typeof val.length === "number" && typeof val.callee === "function"
  );
};
const isBuffer = typeof Buffer === "function" ? Buffer.isBuffer : null;

interface FastApplyContext {
  // biome-ignore  lint/suspicious/noExplicitAny : just types def
  [key: string]: any;
}

type FastApply = (
  fn: Fn,
  context: FastApplyContext | undefined | null,
  // biome-ignore  lint/suspicious/noExplicitAny : just types def
  args: any[]
  // biome-ignore  lint/suspicious/noExplicitAny : just types def
) => any;

const fastApply: FastApply = (fn, context, args) => {
  switch (args ? args.length : 0) {
    case 0:
      return context ? fn.call(context) : fn();
    case 1:
      return context ? fn.call(context, args[0]) : fn(args[0]);
    case 2:
      return context
        ? fn.call(context, args[0], args[1])
        : fn(args[0], args[1]);
    case 3:
      return context
        ? fn.call(context, args[0], args[1], args[2])
        : fn(args[0], args[1], args[2]);
    case 4:
      return context
        ? fn.call(context, args[0], args[1], args[2], args[3])
        : fn(args[0], args[1], args[2], args[3]);
    case 5:
      return context
        ? fn.call(context, args[0], args[1], args[2], args[3], args[4])
        : fn(args[0], args[1], args[2], args[3], args[4]);
    default:
      return fn.apply(context, args);
  }
};
// biome-ignore  lint/suspicious/noExplicitAny : entries are may be any or unknown
function mesco(actual: any, expected: any, strict?: boolean) {
  if (actual === expected) return true;

  // isNaN test
  // biome-ignore  lint/suspicious/noSelfCompare : isNaN test
  if (actual !== actual && expected !== expected) return true;

  interface TypeVars {
    actualType: string;
    expectedType: string;
    i: number;
  }

  var actualType: TypeVars["actualType"] = typeof actual,
    expectedType: TypeVars["expectedType"] = typeof expected,
    i: TypeVars["i"];

  if (actualType !== "object" && expectedType !== "object")
    // biome-ignore  lint/suspicious/noDoubleEquals : check for not strict equal
    return strict ? actual === expected : actual == expected;

  // null is an object, but cannot have properties; stop here
  if (actual === null || expected === null) return false;

  if (actualType !== expectedType) return false;

  if (actual.prototype !== expected.prototype) return false;

  if (actual instanceof Date) return actual.getTime() === expected.getTime();

  if (actual instanceof RegExp) {
    return (
      actual.source === expected.source &&
      actual.lastIndex === expected.lastIndex &&
      actual.global === expected.global &&
      actual.multiline === expected.multiline &&
      actual.ignoreCase === expected.ignoreCase
    );
  }

  if (isBuffer?.(actual)) {
    if (actual.length !== expected.length) return false;

    i = actual.length;

    while (--i >= 0) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;
  }

  var actualArg = isArg(actual),
    expectedArg = isArg(expected);
  if (actualArg || expectedArg) {
    if (!actualArg || !expectedArg) return false;
    actual = fastApply(Array, null, actual);
    expected = fastApply(Array, null, expected);
  }

  interface ObjectKeysVars {
    actualKeys: string[];
    expectedKeys: string[];
    key: string;
  }

  var actualKeys: ObjectKeysVars["actualKeys"] = Object.keys(actual),
    expectedKeys: ObjectKeysVars["expectedKeys"] = Object.keys(expected),
    key: ObjectKeysVars["key"];

  if (actualKeys.length !== expectedKeys.length) return false;

  actualKeys.sort();
  expectedKeys.sort();

  i = actualKeys.length;

  while (--i >= 0) {
    if (actualKeys[i] !== expectedKeys[i]) return false;
  }

  i = actualKeys.length;

  while (--i >= 0) {
    key = actualKeys[i];
    if (!mesco(actual[key], expected[key], strict)) return false;
  }

  return true;
}

export = mesco;

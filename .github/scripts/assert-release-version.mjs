const minimum = [0, 4, 0];
const value = process.argv[2];
const match = /^(\d+)\.(\d+)\.(\d+)(?:-[0-9A-Za-z.-]+)?$/.exec(value ?? "");

if (!match) {
  throw new Error(`Invalid release version: ${value ?? "<missing>"}`);
}

const version = match.slice(1).map(Number);
const supported = version.some(
  (part, index) =>
    part > minimum[index] &&
    version.slice(0, index).every((value, prior) => value === minimum[prior]),
);
const equal = version.every((part, index) => part === minimum[index]);

if (!supported && !equal) {
  throw new Error(
    `Arcade Starknet v10 releases must be version 0.4.0 or newer, got ${value}`,
  );
}

console.log(`Validated Arcade release version ${value}`);

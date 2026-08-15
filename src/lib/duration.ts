export type DurationUnits = {
  hours: number;
  minutes: number;
  seconds: number;
};

function wholeNonNegative(value: number | null | undefined): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value as number)) : 0;
}

/** Converts the seconds stored by the API into fields suitable for editing. */
export function durationToUnits(duration: number | null | undefined): DurationUnits {
  const totalSeconds = wholeNonNegative(duration);
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

/** Converts administrator-entered hours, minutes and seconds to API seconds. */
export function durationToSeconds({ hours, minutes, seconds }: DurationUnits): number {
  return wholeNonNegative(hours) * 3600
    + wholeNonNegative(minutes) * 60
    + wholeNonNegative(seconds);
}

/** Formats stored seconds in the smallest clear combination of units. */
export function formatDuration(duration: number | null | undefined): string {
  const { hours, minutes, seconds } = durationToUnits(duration);
  const units: string[] = [];
  if (hours) units.push(`${hours}h`);
  if (minutes) units.push(`${minutes}m`);
  if (seconds || units.length === 0) units.push(`${seconds}s`);
  return units.join(" ");
}

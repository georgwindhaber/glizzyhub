import { parse } from "iso8601-duration";

export const durationFormat = (iso8601duration: string) => {
  const durations = parse(iso8601duration);

  const hoursString = durations.hours! > 0 ? durations.hours : "";
  const minutesString =
    durations.hours! > 0 && durations.minutes! < 10
      ? `0${durations.minutes}`
      : `${durations.minutes}`;
  const secondsString =
    durations.seconds! > 9 ? `${durations.seconds}` : `0${durations.seconds}`;

  return [hoursString, minutesString, secondsString].filter(Boolean).join(":");
};

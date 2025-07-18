export const REALLY_OLD_VIDEO = 1000 * 60 * 60 * 24 * 7; // week
export const OLDER_VIDEO = 1000 * 60 * 60 * 24 * 3; // 3 days
export const NEW_VIDEO = 1000 * 60 * 60 * 18; // 18 hours

export const isNewerThan = (date: Date, ms: number) => {
  return Date.now() - date.getTime() < ms;
};

export const isOlderThan = (date: Date, ms: number) => {
  return Date.now() - date.getTime() > ms;
};

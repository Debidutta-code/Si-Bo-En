/**
 * "9.30" -> 570
 */
export const timeToMinutes = (time: string): number => {
  if (!time) return 0;

  const [hourStr, minuteStr = "0"] = time.split(".");
  const hours = Number(hourStr);
  const minutes = Number(minuteStr);

  return hours * 60 + minutes;
};

/**
 * 570 -> "9.30"
 */
export const minutesToTime = (totalMinutes: number): string => {
  if (totalMinutes == null) return "0.00";

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}.${minutes.toString().padStart(2, "0")}`;
};

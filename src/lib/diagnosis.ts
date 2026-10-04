// Quiz "why" answers map to a playful diagnosis. Jokes are about the pattern, never the person.
export const WHY_OPTIONS = [
  "Exams or placements took over",
  "It was longer or harder than expected",
  "I found a newer or better one",
  "Couldn't find the time",
  "Lost the spark",
];

export function diagnose(why: string, what: string): string {
  if (/github|repo|project|portfolio|clone/i.test(what)) return "GitHub Hoarder";
  if (/exam|placement/i.test(why)) return "Semester Survivor";
  if (/longer|harder/i.test(why)) return "Perpetual Beginner";
  if (/newer|better/i.test(why)) return "Tab Collector";
  if (/time/i.test(why)) return "Tomorrow Planner";
  return "Spark Seeker";
}

export const DIAG_LINE: Record<string, string> = {
  "GitHub Hoarder": "Many repos, many beginnings. Prognosis: very resurrectable.",
  "Semester Survivor": "Taken by exams, not by lack of interest. Prognosis: very resurrectable.",
  "Perpetual Beginner": "The course was bigger than the semester. Prognosis: resurrectable in smaller pieces.",
  "Tab Collector": "A better tutorial is always one tab away. Prognosis: resurrectable once the tabs close.",
  "Tomorrow Planner": "The free two hours never arrived. Prognosis: resurrectable in 60 minutes.",
  "Spark Seeker": "It needs a reason to matter again. Prognosis: a small win would do it.",
};
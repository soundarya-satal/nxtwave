export const COLLEGES = [
  "IIT Madras", "IIT Bombay", "IIT Delhi", "IIT Kharagpur", "NIT Trichy", "NIT Warangal",
  "NIT Surathkal", "BITS Pilani", "VIT Vellore", "SRM Institute of Science and Technology",
  "Amrita Vishwa Vidyapeetham", "Manipal Institute of Technology", "Anna University", "College of Engineering Guindy",
  "PSG College of Technology", "Thiagarajan College of Engineering", "RV College of Engineering", "BMS College of Engineering",
  "PES University", "JNTU Hyderabad", "CBIT Hyderabad", "VNR VJIET", "Osmania University",
  "College of Engineering Pune", "VJTI Mumbai", "Jadavpur University", "Delhi Technological University",
  "NSUT Delhi", "Cochin University of Science and Technology", "College of Engineering Trivandrum",
  "Government Engineering College Thrissur", "Rajagiri School of Engineering and Technology",
];

const strip = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\b(the|of|and|college|institute|university)\b/g, " ").replace(/\s+/g, " ").trim();

// Map free text to a known college if it matches closely, else tidy it into Title Case.
export function normaliseCollege(input: string): string {
  const raw = (input ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
  if (!raw) return "";
  const k = strip(raw);
  const hit = COLLEGES.find((c) => strip(c) === k);
  if (hit) return hit;
  return raw.toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase());
}
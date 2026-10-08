export const ACCEPTED_EXTENSIONS = [
  ".png",
  ".jpg",
  ".webp",
  ".pdf",
  ".txt",
  ".csv",
  ".docx",
];

export const ACCEPT_ATTRIBUTE = ACCEPTED_EXTENSIONS.join(",");

export function isAcceptedFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((extension) => name.endsWith(extension));
}

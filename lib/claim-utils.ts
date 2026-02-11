const NOTE_SEPARATOR = " | ";

function splitNotes(notes: string | null | undefined): string[] {
  if (!notes) {
    return [];
  }

  return notes
    .split(NOTE_SEPARATOR)
    .map((part) => part.trim())
    .filter(Boolean);
}

function joinNotes(parts: string[]): string | null {
  if (parts.length === 0) {
    return null;
  }

  return parts.join(NOTE_SEPARATOR);
}

export function withClaim(
  notes: string | null | undefined,
  claimPrefix: string,
  isoTimestamp: string,
): string {
  const parts = splitNotes(notes).filter((part) => !part.startsWith(claimPrefix));
  parts.push(`${claimPrefix}${isoTimestamp}`);
  return parts.join(NOTE_SEPARATOR);
}

export function withoutClaim(notes: string | null | undefined, claimPrefix: string): string | null {
  const parts = splitNotes(notes).filter((part) => !part.startsWith(claimPrefix));
  return joinNotes(parts);
}

export function hasFreshClaim(
  notes: string | null | undefined,
  claimPrefix: string,
  staleMs: number,
): boolean {
  const parts = splitNotes(notes);
  const claimPart = parts.find((part) => part.startsWith(claimPrefix));

  if (!claimPart) {
    return false;
  }

  const timestamp = claimPart.slice(claimPrefix.length);
  const parsed = Date.parse(timestamp);
  if (Number.isNaN(parsed)) {
    return false;
  }

  return Date.now() - parsed < staleMs;
}

export function appendNote(notes: string | null | undefined, note: string): string {
  const parts = splitNotes(notes);
  parts.push(note);
  return parts.join(NOTE_SEPARATOR);
}

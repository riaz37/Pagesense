/**
 * Common system prefixes that don't add value to the display name.
 */
const SYSTEM_PREFIXES = [
  /^user\d+_\d+_\d+_recording_\d+/i, // user9_20260406_112355_recording_1775474632730
  /^\d{13}_/, // timestamps like 1775474632730_
];

/**
 * Formats a document identification string for display.
 * Prioritizes the document number, cleans up IDs, and applies middle-truncation.
 */
export function formatDocName(
  docId: string,
  docNumber?: string,
  maxLength = 32
): string {
  // 1. Prefer document_number if it's clean and available
  let name = docNumber || docId;

  // 2. Cleanup system-heavy characters
  name = name.replace(/_/g, " ").trim();

  // 3. Remove common system prefixes if using docId
  if (!docNumber) {
    for (const prefix of SYSTEM_PREFIXES) {
      const cleaned = name.replace(prefix, "");
      if (cleaned !== name) {
        name = cleaned.trim();
        break;
      }
    }
  }

  // 4. Middle truncation if still too long
  if (name.length > maxLength) {
    const half = Math.floor((maxLength - 3) / 2);
    return `${name.slice(0, half)}...${name.slice(-half)}`;
  }

  return name || "Untitled Document";
}

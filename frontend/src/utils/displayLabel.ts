export function displayLabel(user: {
  nickname?: string | null;
  displayName: string;
}): string {
  return user.nickname?.trim() || user.displayName;
}

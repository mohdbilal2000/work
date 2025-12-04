/**
 * Status label mapping for display purposes
 * Maps internal status values to user-friendly labels
 */
export const statusLabels: Record<string, string> = {
  pending: 'Selected',
  reviewing: 'Rejected',
  backout: 'Backout',
  accepted: 'OL Released',
  join: 'Join',
  rejected: 'AL Released',
  welcome: 'Welcome',
  joiningProbability: 'Joining Probability',
  followup1: 'Followup 1',
  interviewed: 'Selected Pending',
}

/**
 * Get display label for a status
 */
export function getStatusLabel(status: string): string {
  return statusLabels[status] || status
}

/**
 * Get all status options with labels
 */
export function getStatusOptions(): Array<{ value: string; label: string }> {
  return [
    { value: 'pending', label: 'Selected' },
    { value: 'reviewing', label: 'Rejected' },
    { value: 'backout', label: 'Backout' },
  ]
}


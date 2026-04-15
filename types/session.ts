export type Session = {
  id: string
  scheduledAt: string
  callStartedAt?: string
  totalCallDuration: number
  status: string
  mentorshipRequestId?: string | null
  mentor: {
    id: string
    name: string
  }
  mentee: {
    id: string
    name: string
  }
  skill: {
    id: string
    name: string
  }
  feedback?: {
    id: string
    rating?: number
    comment?: string | null
  } | null
}
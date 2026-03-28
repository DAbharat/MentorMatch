export type Session = {
  id: string
  scheduledAt: string
  callStartedAt?: string
  totalCallDuration: number
  status: string
  mentor: {
    id: string
    name: string
    clerkUserId: string
  }
  mentee: {
    id: string
    name: string
    clerkUserId: string
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
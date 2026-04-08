import { create } from 'zustand'
import type { Role } from '../types/domain'

interface AppStore {
  activeRole: Role
  activeUserId: string
  setRole: (role: Role) => void
  setUserId: (userId: string) => void
}

const roleDefaultUser: Record<Role, string> = {
  Requester: 'u1',
  Agent: 'u2',
  Approver: 'u3',
  Supervisor: 'u4',
  Admin: 'u5',
}

export const useAppStore = create<AppStore>((set) => ({
  activeRole: 'Agent',
  activeUserId: roleDefaultUser.Agent,
  setRole: (role) =>
    set({
      activeRole: role,
      activeUserId: roleDefaultUser[role],
    }),
  setUserId: (userId) => set({ activeUserId: userId }),
}))

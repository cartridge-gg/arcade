import { create } from 'zustand';
import { Discover } from './hooks/discovers-fetcher';

type State = {
  events: { [project: string]: Discover[] },
}
type Actions = {
  addEvents: (events: { [project: string]: Discover[] }) => void
}

export const useEventStore = create<State & Actions>((set, get) => ({
  events: {},
  addEvents: (evts) => set(() => {
    const events = get().events;
    for (const [project, discovers] of Object.entries(evts)) {
      events[project] = discovers
    }
    return {
      events,
    }
  })
}))

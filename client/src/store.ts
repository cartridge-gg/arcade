import { create } from 'zustand';
import { Discover } from './hooks/discovers-fetcher';

type State = {
  events: { [project: string]: Discover[] },
}
type Actions = {
  addEvents: (events: { [project: string]: Discover[] }) => void
  getAllEvents: (editions: string[]) => Discover[];
  getFollowingEvents: (editions: string[], addr: string[]) => Discover[];
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
  }),
  getAllEvents: (editions: string[]) => {
    const events = get().events;
    return Object.values(events).flatMap(e => e).filter(e => e.name !== undefined && editions.includes(e.project)).sort((a, b) => b.timestamp - a.timestamp);
  },
  getFollowingEvents: (editions: string[], addr: string[]) => {
    const events = get().getAllEvents(editions);
    return events.filter(e => addr.includes(e.address));
  }
}))

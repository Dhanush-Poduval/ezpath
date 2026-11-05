import React, { useEffect } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { SkipLink } from '../ui/SkipLink';
import { liveEventsService } from '../../services/realtime/liveEvents';
import { useJourneyStore } from '../../stores/journeyStore';
import { useOperatorStore } from '../../stores/operatorStore';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { handleDisruptionNotification } = useJourneyStore();
  const { loadNetworkData } = useOperatorStore();

  useEffect(() => {
    // Initial load of network data
    loadNetworkData();

    // Subscribe to live disruption events across tabs and sockets
    const unsubscribe = liveEventsService.subscribe((events) => {
      handleDisruptionNotification(events);
    });

    return () => {
      unsubscribe();
    };
  }, [handleDisruptionNotification, loadNetworkData]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-ink">
      <SkipLink />
      <Navbar />
      <main id="main-content" className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
};


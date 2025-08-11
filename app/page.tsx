'use client';

import dynamic from 'next/dynamic';

// Import dynamique pour éviter les erreurs SSR
const ArcadisSynapseIDE = dynamic(() => import('./page-ide'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-slate-950">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white">Chargement d'Arcadis Synapse™ IDE...</p>
      </div>
    </div>
  )
});

export default function Page() {
  return <ArcadisSynapseIDE />;
}
import React from 'react';
import { LensConfig, production, development, LensProvider as ReactLensProvider } from '@lens-protocol/react-web';
import { config } from '../utils/lensconfig';

// Determine environment
const environment = import.meta.env.VITE_LENS_ENV === 'development' 
  ? development 
  : production;

// Configure Lens
const lensConfig: LensConfig = {
  bindings: config,
  environment,
};

interface LensProviderProps {
  children: React.ReactNode;
}

export function LensProvider({ children }: LensProviderProps) {
  return (
    <ReactLensProvider config={lensConfig}>
      {children}
    </ReactLensProvider>
  );
}
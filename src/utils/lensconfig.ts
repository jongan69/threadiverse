import { LensClient, development } from '@lens-protocol/client';

export const client = new LensClient({
  environment: development
});

// Export client as config to match the import in LensProvider
export const config = client;
import { ApiClient } from './client';
import { DemoApiAdapter, demoApiAdapter } from './demoAdapter';
import { AwsApiClient } from './awsClient';

const isDemoMode = import.meta.env.VITE_DEMO_MODE !== 'false';

let activeClient: ApiClient;

if (isDemoMode) {
  activeClient = demoApiAdapter;
} else {
  activeClient = new AwsApiClient();
}

export function getApiClient(): ApiClient {
  return activeClient;
}

export { demoApiAdapter, DemoApiAdapter, AwsApiClient };
export * from './client';


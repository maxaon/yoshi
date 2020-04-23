import { BootstrapServer } from '@wix/wix-bootstrap-testkit';

declare global {
  const testKitApp: BootstrapServer;
  const testKitBMApp: any;
}

export {};

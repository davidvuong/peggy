export interface CpuMemoryCaps {
  cpu: string;
  memory: string;
}

export interface Container {
  name: string;
  image: string;
  resources: {
    requests: CpuMemoryCaps;
    limits: CpuMemoryCaps;
  };
  env: Record<string, string>;
  extras: Record<string, string>;
}

export interface Service {
  replicas: number;
  containers: Container[];
}

export interface Config {
  services: Record<string, Service>;
}

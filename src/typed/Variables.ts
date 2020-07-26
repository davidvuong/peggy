import Joi from 'joi';

export interface CpuMemoryCaps {
  cpu: string;
  memory: string;
}

export const CpuMemoryCaps = {
  schema: Joi.object({
    cpu: Joi.string().required(),
    memory: Joi.string().required(),
  }),
};

export interface Container {
  name: string;
  image: string;
  resources: {
    requests: CpuMemoryCaps;
    limits: CpuMemoryCaps;
  };
  env?: Record<string, string>;
  extras?: Record<string, string>;
}

export const Container = {
  schema: Joi.object({
    name: Joi.string().required(),
    image: Joi.string().required(),
    resources: Joi.object({
      requests: CpuMemoryCaps.schema.required(),
      limits: CpuMemoryCaps.schema.required(),
    }).required(),
    env: Joi.object().pattern(Joi.string(), Joi.string()),
    extras: Joi.object().pattern(Joi.string(), Joi.string()),
  }),
};

export interface Service {
  replicas: number;
  containers: Container[];
}

export const Service = {
  schema: Joi.object({
    replcas: Joi.number().integer().positive().required(),
    containers: Joi.array().min(1).items(Container.schema).required(),
  }),
};

export interface Variables {
  services: Record<string, Service>;
}

export const Variables = {
  schema: Joi.object({
    services: Joi.object().pattern(Joi.string(), Service.schema).required(),
  }),
};

import Joi from 'joi';
import { isObject } from 'lodash';

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
  image: string;
  resources: {
    requests: CpuMemoryCaps;
    limits: CpuMemoryCaps;
  };
  env?: Record<string, string>;
  extraArgs?: Record<string, string>;
}

export const Container = {
  schema: Joi.object({
    image: Joi.string().required(),
    resources: Joi.object({
      requests: CpuMemoryCaps.schema.required(),
      limits: CpuMemoryCaps.schema.required(),
    }).required(),
    env: Joi.object().pattern(Joi.string(), Joi.string()),
    extraArgs: Joi.object().pattern(Joi.string(), Joi.string()),
  }),
};

export interface App {
  replicas: number;
  containers: Record<string, Container> | Container;
}

export const App = {
  schema: Joi.object({
    replicas: Joi.number().integer().positive().required(),
    containers: Joi.alternatives()
      .try(Joi.object().pattern(Joi.string(), Container.schema), Container.schema)
      .required(),
  }),
};

export function isContainer(container: Container | Record<string, Container>): container is Container {
  return !!(container as Container).image && isObject(container.resources);
}

export interface Variables {
  apps: Record<string, App>;
}

export const Variables = {
  schema: Joi.object({
    apps: Joi.object().pattern(Joi.string(), App.schema).required(),
  }),
};

import Joi from 'joi';
import { isNil } from 'lodash';
import { DecodeJsonError, EncodeJsonError } from '../core/Errors';

function decodeJson<A>(message: unknown, schema: Joi.Schema): A {
  if (isNil(message)) {
    throw new DecodeJsonError('Cannot decode an empty payload');
  }

  const { error, value } = schema.validate(message, { stripUnknown: true });
  if (error) {
    throw DecodeJsonError.fromJoiError(error);
  }
  return value as A;
}

function encodeAFromJson<A>(obj: A, schema: Joi.Schema): A {
  if (isNil(obj)) {
    throw new EncodeJsonError('Cannot encode an empty payload');
  }

  const { error, value } = schema.validate(obj, { stripUnknown: true });
  if (error) {
    throw EncodeJsonError.fromJoiError(error);
  }
  return value;
}

export { Joi, decodeJson, encodeAFromJson };

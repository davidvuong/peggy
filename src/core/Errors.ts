import { ValidationError } from 'joi';
import { head } from 'lodash';

export class PeggyError extends Error {}
export class FileParserError extends PeggyError {}

export class JsonValidationError extends PeggyError {
  static fromJoiError<T extends typeof JsonValidationError>(error: ValidationError): InstanceType<T> {
    let errorMessage: string;
    if (error.isJoi) {
      const firstError = head((error.details || []).map(d => d.message))?.replace(/"/g, "'");
      errorMessage = `DecodeJsonError: ${firstError ?? 'Unknown'}`;
    } else {
      errorMessage = `${error.toString()}`;
    }
    return new this(errorMessage) as InstanceType<T>;
  }
}

export class DecodeJsonError extends JsonValidationError {}

export class EncodeJsonError extends JsonValidationError {}

export class InputError extends PeggyError {}

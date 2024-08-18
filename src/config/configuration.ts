import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ConfigObject, registerAs } from '@nestjs/config';

export const registerAsWithValidation = <
  T extends ConfigObject,
  E extends ClassConstructor<unknown>,
>(
  token: string,
  envClass: E,
  rawConfig: Record<string, unknown>,
  mapValue: (envInstance: InstanceType<E>) => T,
) =>
  registerAs(token, (): T => {
    const validatedConfig = plainToInstance(envClass, rawConfig, {
      enableImplicitConversion: true,
      excludeExtraneousValues: true,
    });
    const errors = validateSync(validatedConfig as object, {
      skipMissingProperties: false,
    });

    if (errors.length > 0) {
      throw new Error(errors.toString());
    }

    return mapValue(validatedConfig as InstanceType<E>);
  });

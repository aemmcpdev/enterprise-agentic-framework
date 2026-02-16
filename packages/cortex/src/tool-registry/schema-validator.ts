import { z, ZodTypeAny } from 'zod';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function buildZodSchema(schema: Record<string, unknown>): ZodTypeAny {
  const properties = (schema.properties || {}) as Record<string, Record<string, unknown>>;
  const required = (schema.required || []) as string[];

  const shape: Record<string, ZodTypeAny> = {};

  for (const [key, prop] of Object.entries(properties)) {
    let fieldSchema: ZodTypeAny;

    switch (prop.type) {
      case 'string':
        fieldSchema = z.string();
        break;
      case 'number':
        fieldSchema = z.number();
        break;
      case 'boolean':
        fieldSchema = z.boolean();
        break;
      case 'array':
        fieldSchema = z.array(z.unknown());
        break;
      case 'object':
        fieldSchema = z.record(z.unknown());
        break;
      default:
        fieldSchema = z.unknown();
    }

    if (!required.includes(key)) {
      fieldSchema = fieldSchema.optional();
    }

    shape[key] = fieldSchema;
  }

  return z.object(shape).passthrough();
}

export function validateToolParams(
  schema: Record<string, unknown>,
  params: Record<string, unknown>
): ValidationResult {
  try {
    const zodSchema = buildZodSchema(schema);
    zodSchema.parse(params);
    return { valid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return { valid: false, errors: [String(error)] };
  }
}

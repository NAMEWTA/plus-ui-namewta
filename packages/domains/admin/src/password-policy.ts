import type { OpenApiSchema } from '@namewta/api-contracts';

export const passwordCharacterClasses = ['UPPERCASE', 'LOWERCASE', 'DIGIT', 'SPECIAL'] as const;

export type PasswordCharacterClass = (typeof passwordCharacterClasses)[number];
export type PasswordPolicyTransport = OpenApiSchema<'PasswordPolicyProjection'>;
export type PasswordViolationReason =
  | 'PASSWORD_TOO_SHORT'
  | 'PASSWORD_TOO_LONG'
  | 'PASSWORD_MISSING_UPPERCASE'
  | 'PASSWORD_MISSING_LOWERCASE'
  | 'PASSWORD_MISSING_DIGIT'
  | 'PASSWORD_MISSING_SPECIAL'
  | 'PASSWORD_CONTAINS_DISALLOWED_CHARACTER';

export interface PasswordPolicy {
  allowedSpecialCharacters: string;
  maximumLength: number;
  minimumLength: number;
  requiredCharacterClasses: readonly PasswordCharacterClass[];
}

export interface ClientAuthContext {
  clientEnabled: boolean;
  passwordPolicy?: PasswordPolicy;
  registerEnabled: boolean;
}

export interface PasswordPolicyViolation {
  reason: PasswordViolationReason;
}

export class PasswordPolicyUnavailableError extends Error {
  constructor() {
    super('密码策略配置不可用');
    this.name = 'PasswordPolicyUnavailableError';
  }
}

const unavailable = (): never => {
  throw new PasswordPolicyUnavailableError();
};

const isUppercase = (code: number) => code >= 65 && code <= 90;
const isLowercase = (code: number) => code >= 97 && code <= 122;
const isDigit = (code: number) => code >= 48 && code <= 57;

function parseRequiredCharacterClasses(value: unknown): readonly PasswordCharacterClass[] {
  if (!Array.isArray(value) || value.length !== passwordCharacterClasses.length) unavailable();
  const classes = value as unknown[];
  if (
    classes.some(item => typeof item !== 'string' || !passwordCharacterClasses.includes(item as PasswordCharacterClass))
  ) {
    unavailable();
  }
  const unique = new Set(classes as PasswordCharacterClass[]);
  if (unique.size !== passwordCharacterClasses.length) unavailable();
  return Object.freeze(passwordCharacterClasses.filter(item => unique.has(item)));
}

function parseAllowedSpecialCharacters(value: unknown): string {
  if (typeof value !== 'string' || !value.length) unavailable();
  const specials = String(value);
  const codes = [...specials].map(character => character.charCodeAt(0));
  if (
    codes.some(code => code < 33 || code > 126 || isUppercase(code) || isLowercase(code) || isDigit(code)) ||
    new Set(codes).size !== codes.length
  ) {
    unavailable();
  }
  return specials;
}

export function parsePasswordPolicy(value: unknown): PasswordPolicy {
  if (!value || typeof value !== 'object' || Array.isArray(value)) unavailable();
  const candidate = value as Record<string, unknown>;
  const minimumLength = candidate.minimumLength;
  const maximumLength = candidate.maximumLength;
  if (
    !Number.isInteger(minimumLength) ||
    !Number.isInteger(maximumLength) ||
    (minimumLength as number) < 8 ||
    (maximumLength as number) > 30 ||
    (minimumLength as number) > (maximumLength as number)
  ) {
    unavailable();
  }
  return Object.freeze({
    minimumLength: minimumLength as number,
    maximumLength: maximumLength as number,
    requiredCharacterClasses: parseRequiredCharacterClasses(candidate.requiredCharacterClasses),
    allowedSpecialCharacters: parseAllowedSpecialCharacters(candidate.allowedSpecialCharacters)
  });
}

export function requirePasswordPolicy(context: ClientAuthContext): PasswordPolicy {
  return context.passwordPolicy ?? unavailable();
}

function violation(reason: PasswordViolationReason): PasswordPolicyViolation {
  return Object.freeze({ reason });
}

export function validatePassword(policy: PasswordPolicy, password: string): readonly PasswordPolicyViolation[] {
  const value = password ?? '';
  const violations: PasswordPolicyViolation[] = [];
  const codes = Array.from(value, character => character.charCodeAt(0));
  if (value.length < policy.minimumLength) violations.push(violation('PASSWORD_TOO_SHORT'));
  if (value.length > policy.maximumLength) violations.push(violation('PASSWORD_TOO_LONG'));
  if (!codes.some(isUppercase)) violations.push(violation('PASSWORD_MISSING_UPPERCASE'));
  if (!codes.some(isLowercase)) violations.push(violation('PASSWORD_MISSING_LOWERCASE'));
  if (!codes.some(isDigit)) violations.push(violation('PASSWORD_MISSING_DIGIT'));
  if (!codes.some(code => policy.allowedSpecialCharacters.includes(String.fromCharCode(code)))) {
    violations.push(violation('PASSWORD_MISSING_SPECIAL'));
  }
  if (
    codes.some(
      code =>
        !isUppercase(code) &&
        !isLowercase(code) &&
        !isDigit(code) &&
        !policy.allowedSpecialCharacters.includes(String.fromCharCode(code))
    )
  ) {
    violations.push(violation('PASSWORD_CONTAINS_DISALLOWED_CHARACTER'));
  }
  return Object.freeze(violations);
}

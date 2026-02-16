import { nanoid } from 'nanoid';

export function generateId(prefix?: string): string {
  const id = nanoid(21);
  return prefix ? `${prefix}_${id}` : id;
}

export const generateAgentId = (): string => generateId('agt');
export const generateSessionId = (): string => generateId('ses');
export const generateTaskId = (): string => generateId('tsk');
export const generateMessageId = (): string => generateId('msg');
export const generatePolicyId = (): string => generateId('pol');
export const generateAuditId = (): string => generateId('aud');
export const generateEventId = (): string => generateId('evt');
export const generateMemoryId = (): string => generateId('mem');
export const generateOutcomeId = (): string => generateId('out');
export const generateGoalId = (): string => generateId('gol');
export const generateObjectiveId = (): string => generateId('obj');
export const generateToolCallId = (): string => generateId('tc');

export class InputSanitizer {
  private patterns: { pattern: RegExp; replacement: string; name: string }[] = [
    { pattern: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, replacement: '', name: 'script_tag' },
    { pattern: /javascript:/gi, replacement: '', name: 'js_protocol' },
    { pattern: /on\w+\s*=/gi, replacement: '', name: 'event_handler' },
    { pattern: /\bDROP\s+TABLE\b/gi, replacement: '[BLOCKED]', name: 'sql_drop' },
    { pattern: /;\s*--/g, replacement: '', name: 'sql_comment' },
    { pattern: /\bUNION\s+SELECT\b/gi, replacement: '[BLOCKED]', name: 'sql_union' },
  ];

  sanitize(input: string): string {
    let sanitized = input;
    for (const { pattern, replacement } of this.patterns) {
      sanitized = sanitized.replace(pattern, replacement);
    }
    return sanitized;
  }

  isSafe(input: string): boolean {
    for (const { pattern, name } of this.patterns) {
      if (pattern.test(input)) return false;
    }
    return true;
  }

  detectThreats(input: string): string[] {
    const threats: string[] = [];
    for (const { pattern, name } of this.patterns) {
      if (pattern.test(input)) threats.push(name);
    }
    return threats;
  }
}

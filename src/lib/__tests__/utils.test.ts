/**
 * Tests for utility functions
 * 
 * Priority 1 - Critical Business Logic
 * Tests common utility functions
 */

import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('Utils', () => {
  describe('cn (classname merge)', () => {
    it('should merge class names', () => {
      const result = cn('class1', 'class2');
      expect(result).toContain('class1');
      expect(result).toContain('class2');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const result = cn('base', isActive && 'active');
      expect(result).toContain('base');
      expect(result).toContain('active');
    });

    it('should filter out falsy values', () => {
      const result = cn('base', false, null, undefined, 'valid');
      expect(result).toContain('base');
      expect(result).toContain('valid');
      expect(result).not.toContain('false');
      expect(result).not.toContain('null');
      expect(result).not.toContain('undefined');
    });

    it('should handle empty input', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should merge tailwind conflicting classes correctly', () => {
      // tailwind-merge should resolve conflicts
      const result = cn('px-2', 'px-4');
      // Should only contain px-4 (later wins)
      expect(result).toBe('px-4');
    });

    it('should handle object syntax', () => {
      const result = cn({
        'class1': true,
        'class2': false,
        'class3': true
      });
      expect(result).toContain('class1');
      expect(result).not.toContain('class2');
      expect(result).toContain('class3');
    });

    it('should handle array input', () => {
      const classes = ['class1', 'class2'];
      const result = cn(classes);
      expect(result).toContain('class1');
      expect(result).toContain('class2');
    });
  });
});

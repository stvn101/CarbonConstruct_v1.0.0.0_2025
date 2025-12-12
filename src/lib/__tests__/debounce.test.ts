/**
 * Tests for debounce utility
 * 
 * Tests timing accuracy of debounce function
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from '../debounce';

describe('Debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should delay function execution', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should only execute once for rapid calls', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments to the function', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn('arg1', 'arg2');

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should reset timer on subsequent calls', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    vi.advanceTimersByTime(50);
    expect(fn).not.toHaveBeenCalled();

    debouncedFn();
    vi.advanceTimersByTime(50);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should use the last arguments when called multiple times', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn('first');
    debouncedFn('second');
    debouncedFn('third');

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledWith('third');
  });

  it('should execute multiple times when calls are spaced out', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn('first');
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledWith('first');

    debouncedFn('second');
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledWith('second');

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should work with zero delay', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 0);

    debouncedFn();
    vi.advanceTimersByTime(0);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should handle context correctly', () => {
    const obj = {
      value: 42,
      fn: vi.fn(function(this: { value: number }) {
        return this.value;
      })
    };
    
    const debouncedFn = debounce(obj.fn.bind(obj), 100);
    debouncedFn();
    
    vi.advanceTimersByTime(100);
    expect(obj.fn).toHaveBeenCalled();
  });
});

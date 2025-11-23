import { mergeclasses } from '~/utils/mergeclasses';

describe('mergeclasses utility', () => {
  it('should join multiple class names with a space', () => {
    const result = mergeclasses('class1', 'class2', 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('should filter out falsy values', () => {
    const result = mergeclasses('class1', undefined, 'class2', '', null as unknown as string);
    expect(result).toBe('class1 class2');
  });

  it('should return an empty string when no classes are provided', () => {
    const result = mergeclasses();
    expect(result).toBe('');
  });

  it('should return an empty string when all values are falsy', () => {
    const result = mergeclasses(undefined, '' as string, null as unknown as string);
    expect(result).toBe('');
  });
});

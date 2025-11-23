export function mergeclasses(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

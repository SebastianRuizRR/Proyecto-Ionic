export function emailValido(email: string): boolean {
  return /^\S+@\S+\.\S+$/.test(email.trim());
}

/** 0 = vacía, 1 = débil, 2 = media, 3 = fuerte. */
export function seguridadPassword(password: string): number {
  if (!password) return 0;
  let nivel = password.length >= 8 ? 1 : 0;
  if (nivel && /[A-Z]/.test(password) && /[a-z]/.test(password)) nivel++;
  if (nivel && /[\d\W]/.test(password)) nivel++;
  return Math.max(nivel, 1);
}

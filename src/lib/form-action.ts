/**
 * Cast tipado para <form action> sem criar nova função.
 * Wrappers quebram a identidade da Server Action no Client Component boundary.
 */
export function formAction(
  action: (formData: FormData) => Promise<unknown>,
): (formData: FormData) => Promise<void> {
  return action as (formData: FormData) => Promise<void>;
}

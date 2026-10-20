import { redirect } from 'next/navigation';

/**
 * Public Access: Authentication has been decommissioned.
 * Any direct requests to /login are immediately redirected to the public /dashboard.
 */
export default function LoginPage() {
  redirect('/dashboard');
}

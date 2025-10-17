import { cookies } from 'next/headers';
import MainNavClient from './MainNavClient';

export default async function Header() {
  const jar = await cookies();
  const authed = Boolean(jar.get('session')?.value);
  const role = jar.get('role')?.value ?? null;

  return <MainNavClient authed={authed} role={role} />;
}

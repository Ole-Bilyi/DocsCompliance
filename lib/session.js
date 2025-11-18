import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export const sessionOptions = {
  cookieName: 'docscompliance_session',
  password: process.env.SECRET_COOKIE_PASSWORD,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60, // 24 hours
    sameSite: 'lax',
    path: '/',
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession(cookieStore, sessionOptions);
  return session;
}
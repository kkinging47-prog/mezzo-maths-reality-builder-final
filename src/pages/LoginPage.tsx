import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';

type LoginPageProps = { mode?: 'login' | 'signup' };

export default function LoginPage({ mode = 'login' }: LoginPageProps) {
  const isSignup = mode === 'signup';
  return (
    <PageShell>
      <section className="auth-wrap section">
        <div className="auth-card card">
          <span className="eyebrow">{isSignup ? 'Create account' : 'Welcome back'}</span>
          <h1>{isSignup ? 'Join the Reality Builder classroom' : 'Log in to continue building'}</h1>
          <p>This demo uses front-end screens only. Connect Supabase/Firebase later for real accounts.</p>
          <form className="auth-form">
            {isSignup && <input type="text" placeholder="Full name" />}
            <input type="email" placeholder="Email address" />
            <input type="password" placeholder="Password" />
            <Link className="btn btn-primary full" to="/role-selection">{isSignup ? 'Create account' : 'Login'}</Link>
          </form>
          <p className="muted-center">
            {isSignup ? 'Already have an account?' : 'New here?'}{' '}
            <Link to={isSignup ? '/login' : '/signup'}>{isSignup ? 'Login' : 'Create one'}</Link>
          </p>
        </div>
      </section>
    </PageShell>
  );
}

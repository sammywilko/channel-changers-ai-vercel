import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './providers/AuthProvider';

export const Layout: React.FC = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.email) return '?';
    return user.email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-slate-900/50 hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
            <span>🎬</span> Channel Changers
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <div className="mb-4">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Workflow</p>
            <NavItem to="/" icon="📊">Dashboard</NavItem>
            <NavItem to="/brands" icon="🏢">Brands</NavItem>
            <NavItem to="/scripts" icon="📝">Scripts</NavItem>
            <NavItem to="/productions" icon="🎥">Productions</NavItem>
          </div>

          <div className="mb-4">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Creative Studio</p>
            <NavItem to="/productions/generate" icon="🎞️">Veo Video + Extender</NavItem>
            <NavItem to="/productions/images" icon="🖼️">Image Studio</NavItem>
            <NavItem to="/productions/audio" icon="🎙️">Podcast Studio</NavItem>
            <NavItem to="/assets" icon="🗂️">Smart Assets</NavItem>
          </div>

          <div className="mb-4">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Intelligence</p>
            <NavItem to="/trends" icon="🔮">Oracle & Trends</NavItem>
            <NavItem to="/locations" icon="📍">Location Scout</NavItem>
            <NavItem to="/analysis" icon="👁️">Video Analysis</NavItem>
            <NavItem to="/live" icon="🔴">Live Assistant</NavItem>
          </div>

          <div className="mb-4">
            <NavItem to="/reports" icon="📈">Reports</NavItem>
            <NavItem to="/jobs" icon="⚡">Queue</NavItem>
          </div>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
              {getUserInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user?.email || 'Guest'}</p>
              <p className="text-muted-foreground text-xs">
                {user ? 'Logged in' : 'Not logged in'}
              </p>
            </div>
            {user && (
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="text-muted-foreground hover:text-foreground text-sm"
                title="Sign out"
              >
                🚪
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 border-b border-border flex items-center px-6 justify-between bg-slate-900/50 backdrop-blur sticky top-0 z-10">
          <div className="text-sm text-muted-foreground">
            AI Production Pipeline v3.0 • <span className="text-primary font-semibold">Gemini 3 Integration</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-muted-foreground hover:text-foreground">🔔</button>
            <button className="text-muted-foreground hover:text-foreground">⚙️</button>
          </div>
        </header>
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ to: string; icon: string; children: React.ReactNode }> = ({ to, icon, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
        ? 'bg-primary/10 text-primary'
        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
      }`
    }
  >
    {icon} {children}
  </NavLink>
);
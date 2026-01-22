import { NavLink } from 'react-router-dom';
import { Home, Settings, Database, PiggyBank } from 'lucide-react';

export function Navigation() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col flex-1 items-center gap-1 px-2 py-0.5 transition-all rounded-3xl last:rounded-3xl first:rounded-3xl ${
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
    }`;

  return (
    <nav className="fixed bottom-4 left-0 right-0 mx-5 bg-card/95 border-t border-border rounded-3xl z-50">
      <div className="container flex justify-between p-0">
        <NavLink to="/" className={linkClass}>
          <Home className="w-8 h-full p-1" />
        </NavLink>
        <NavLink to="/data" className={linkClass}>
          <Database className="w-8 h-full p-1" />
        </NavLink>
        <NavLink to="/accounts" className={linkClass}> {/* New NavLink for Accounts */}
          <PiggyBank className="w-8 h-full p-1" />
        </NavLink>
        <NavLink to="/config" className={linkClass}>
          <Settings className="w-8 h-full p-1" />
        </NavLink>
      </div>
    </nav>
  );
}
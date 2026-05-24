export function AppShell({ pages, activePageId, onNavigate, children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">ST</div>
          <div>
            <div className="brand-title">Security Test</div>
            <div className="brand-subtitle">Local lab</div>
          </div>
        </div>

        <nav className="nav-list" aria-label="Dashboard sections">
          {pages.map((page) => {
            const Icon = page.icon;
            const isActive = page.id === activePageId;
            return (
              <button
                key={page.id}
                className={isActive ? "nav-item nav-item-active" : "nav-item"}
                type="button"
                onClick={() => onNavigate(page.id)}
                title={page.label}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{page.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="main-panel">{children}</main>
    </div>
  );
}


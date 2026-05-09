import { useLayout } from './context';
import { Header } from './header';
import { Sidebar } from './sidebar';

export function Wrapper({ children }) {
  const { isMobile } = useLayout();

  return (
    <>
      <Header />

      <div className="flex grow pt-(--header-height-mobile) lg:pt-(--header-height)">
        {!isMobile && <Sidebar />}
        <main
          className="lg:ps-(--sidebar-width) lg:in-data-[sidebar-open=false]:ps-0 transition-all duration-300 grow"
          role="content"
        >
          {children}
        </main>
      </div>
    </>
  );
}

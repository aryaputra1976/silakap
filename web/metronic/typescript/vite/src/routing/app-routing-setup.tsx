import { Route, Routes, Navigate } from 'react-router';
import { Layout1 } from '@/components/layouts/layout-1';
import { Layout1Page } from '@/pages/layout-1/page';
import { Layout2 } from '@/components/layouts/layout-2';
import { Layout2Page } from '@/pages/layout-2/page';
import { Layout3 } from '@/components/layouts/layout-3';
import { Layout3Page } from '@/pages/layout-3/page';
import { Layout4 } from '@/components/layouts/layout-4';
import { Layout4Page } from '@/pages/layout-4/page';
import { Layout5 } from '@/components/layouts/layout-5';
import { Layout5Page } from '@/pages/layout-5/page';
import { Layout6 } from '@/components/layouts/layout-6';
import { Layout6Page } from '@/pages/layout-6/page';
import { Layout7 } from '@/components/layouts/layout-7';
import { Layout7Page } from '@/pages/layout-7/page';
import { Layout8 } from '@/components/layouts/layout-8';
import { Layout8Page } from '@/pages/layout-8/page';
import { Layout9 } from '@/components/layouts/layout-9';
import { Layout9Page } from '@/pages/layout-9/page';
import { Layout10 } from '@/components/layouts/layout-10';
import { Layout10Page } from '@/pages/layout-10/page';
import { Layout11 } from '@/components/layouts/layout-11';
import { Layout11Page } from '@/pages/layout-11/page';
import { Layout12 } from '@/components/layouts/layout-12';
import { Layout12Page } from '@/pages/layout-12/page';
import { Layout13 } from '@/components/layouts/layout-13';
import { Layout13Page } from '@/pages/layout-13/page';
import { Layout14 } from '@/components/layouts/layout-14';
import { Layout14Page } from '@/pages/layout-14/page';
import { Layout15 } from '@/components/layouts/layout-15';
import { Layout15Page } from '@/pages/layout-15/page';
import { Layout16 } from '@/components/layouts/layout-16';
import { Layout16Page } from '@/pages/layout-16/page';
import { Layout17 } from '@/components/layouts/layout-17';
import { Layout17Page } from '@/pages/layout-17/page';
import { Layout18 } from '@/components/layouts/layout-18';
import { Layout18Page } from '@/pages/layout-18/page';
import { Layout19 } from '@/components/layouts/layout-19';
import { Layout19Page } from '@/pages/layout-19/page';
import { Layout20 } from '@/components/layouts/layout-20';
import { Layout20Page } from '@/pages/layout-20/page';
import { Layout21 } from '@/components/layouts/layout-21';
import { Layout21Page } from '@/pages/layout-21/page';
import { Layout22 } from '@/components/layouts/layout-22';
import { Layout22Page } from '@/pages/layout-22/page';
import { Layout23 } from '@/components/layouts/layout-23';
import { Layout23Page } from '@/pages/layout-23/page';
import { Layout24 } from '@/components/layouts/layout-24';
import { Layout24Page } from '@/pages/layout-24/page';
import { Layout25 } from '@/components/layouts/layout-25';
import { Layout25Page } from '@/pages/layout-25/page';
import { Layout26 } from '@/components/layouts/layout-26';
import { Layout26Page } from '@/pages/layout-26/page';
import { Layout27 } from '@/components/layouts/layout-27';
import { Layout27Page } from '@/pages/layout-27/page';
import { Layout28 } from '@/components/layouts/layout-28';
import { Layout28Page } from '@/pages/layout-28/page';

export function AppRoutingSetup() {
  return (
    <Routes>
      <Route element={<Layout1 />}>
        <Route path="/layout-1" element={<Layout1Page />} />
        <Route path="/layout-1/dark-sidebar" element={<Layout1Page />} />
      </Route>
      <Route element={<Layout2 />}>
        <Route path="/layout-2" element={<Layout2Page />} />
      </Route>
      <Route element={<Layout3 />}>
        <Route path="/layout-3" element={<Layout3Page />} />
      </Route>
      <Route element={<Layout4 />}>
        <Route path="/layout-4" element={<Layout4Page />} />
      </Route>
      <Route element={<Layout5 />}>
        <Route path="/layout-5" element={<Layout5Page />} />
      </Route>
      <Route element={<Layout6 />}>
        <Route path="/layout-6" element={<Layout6Page />} />
      </Route>
      <Route element={<Layout7 />}>
        <Route path="/layout-7" element={<Layout7Page />} />
      </Route>
      <Route element={<Layout8 />}>
        <Route path="/layout-8" element={<Layout8Page />} />
      </Route>
      <Route element={<Layout9 />}>
        <Route path="/layout-9" element={<Layout9Page />} />
      </Route>
      <Route element={<Layout10 />}>
        <Route path="/layout-10" element={<Layout10Page />} />
      </Route>
      <Route element={<Layout11 />}>
        <Route path="/layout-11" element={<Layout11Page />} />
      </Route>
      <Route element={<Layout12 />}>
        <Route path="/layout-12" element={<Layout12Page />} />
      </Route>
      <Route element={<Layout13 />}>
        <Route path="/layout-13" element={<Layout13Page />} />
      </Route>
      <Route element={<Layout14 />}>
        <Route path="/layout-14" element={<Layout14Page />} />
      </Route>
      <Route element={<Layout15 />}>
        <Route path="/layout-15" element={<Layout15Page />} />
      </Route>
      <Route element={<Layout16 />}>
        <Route path="/layout-16" element={<Layout16Page />} />
      </Route>
      <Route element={<Layout17 />}>
        <Route path="/layout-17" element={<Layout17Page />} />
      </Route>
      <Route element={<Layout18 />}>
        <Route path="/layout-18" element={<Layout18Page />} />
      </Route>
      <Route element={<Layout19 />}>
        <Route path="/layout-19" element={<Layout19Page />} />
      </Route>
      <Route element={<Layout20 />}>
        <Route path="/layout-20" element={<Layout20Page />} />
      </Route>
      <Route element={<Layout21 />}>
        <Route path="/layout-21" element={<Layout21Page />} />
      </Route>
      <Route element={<Layout22 />}>
        <Route path="/layout-22" element={<Layout22Page />} />
      </Route>
      <Route element={<Layout23 />}>
        <Route path="/layout-23" element={<Layout23Page />} />
      </Route>
      <Route element={<Layout24 />}>
        <Route path="/layout-24" element={<Layout24Page />} />
      </Route>
      <Route element={<Layout25 />}>
        <Route path="/layout-25" element={<Layout25Page />} />
      </Route>
      <Route element={<Layout26 />}>
        <Route path="/layout-26" element={<Layout26Page />} />
      </Route>
      <Route element={<Layout27 />}>
        <Route path="/layout-27" element={<Layout27Page />} />
      </Route>
      <Route element={<Layout28 />}>
        <Route path="/layout-28" element={<Layout28Page />} />
      </Route>
      <Route path="*" element={<Navigate to="/layout-1" replace />} />
    </Routes>
  );
}

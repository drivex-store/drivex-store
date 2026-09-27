import { GridOverlay } from '@/components/layout/utils/GridOverlay'
import { PageTransitionOverlay } from '@/pageTransition/PageTransitionOverlay'
import { LazyPageTransitionRectangles } from '@/pageTransition/LazyPageTransitionRectangles'
import { SyncBodyTheme } from '@/components/shared/SyncBodyTheme'
import { Preloader } from '@/components/layout/Preloader'
import { PreloaderScrollLock } from '@/components/layout/PreloaderScrollLock'
import { PageTransitionScrollLock } from '@/pageTransition/PageTransitionScrollLock';
import { ModalOverlay } from '@/components/ui/ModalOverlay';
import { LazyAnalytics } from '@/providers/LazyAnalytics';
import { LazyCustomCursor } from '@/components/ui/LazyCustomCursor';

import TabTitleMessage from '@/components/layout/utils/TabTitleMessage'
import Credits from '@/components/layout/utils/Credits'

import { HeaderClient } from '@/components/layout/HeaderClient'

import { sanityFetch } from '@/libs/sanity/fetch'
import { HEADER_QUERY } from '@/libs/sanity/queries'

export default async function AppLayout({ children }) {
  const headerData = await Promise.all([
    sanityFetch({ query: HEADER_QUERY, tags: ['navigation'] }),
  ])

  return (
    <>
      <GridOverlay />
      <PageTransitionOverlay />
      <LazyPageTransitionRectangles />
      <SyncBodyTheme />
      <Preloader />

      <PreloaderScrollLock />
      <PageTransitionScrollLock />

      <LazyAnalytics>
        <LazyCustomCursor>

          <TabTitleMessage />
          <Credits />

          <HeaderClient
            navItems={headerData?.navItems}
            headerCta={headerData?.headerCta}
            flyout={headerData?.flyout}
            spotsRemaining={null}
          />

          <main className="relative z-[1]">
            {children}
          </main>

        </LazyCustomCursor>
      </LazyAnalytics>
      
      <ModalOverlay />
    </>
  );
}

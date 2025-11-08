import { Button } from '@/components/ui/button';
import { requireAuth } from '@/lib/auth-utils';
import { LogoutButton } from './_components/logout-button';
import { Suspense } from 'react';
import Loading from '../../loading';
import MainCard from './_components/maincard';
import ArbitrageList from './_components/arbify';
import TotalAssetsCard from './_components/TotalAssetsCard';
import { dashboardTheme } from '@/lib/theme-utils';
import MainNav from './_components/mainnav';
import ImageSlider from './_components/imgslider';

const DashboardPage = async () => {
  await requireAuth();
  
  return (
    <div className={`space-y-4 ${dashboardTheme.content.default}`}>
    <Suspense fallback={<Loading />}>
      <div className="mt-14 px-0 md:px-6">
        {/* <MainCard /> */}
        <TotalAssetsCard />
        <MainNav />
        <div className="mt-4 mb-2 px-2">
          <ImageSlider />
        </div>
        <ArbitrageList />
        {/* <LogoutButton /> */}
      </div>
    </Suspense>
  </div>
  );
};

export default DashboardPage;
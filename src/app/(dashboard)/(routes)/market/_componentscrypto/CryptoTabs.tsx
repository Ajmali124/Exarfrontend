import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gainers, Losers } from "./CryptoTabs/CryptoTabsContents";
import Trending from "./trending";

const CryptoTabs = () => {
  return (
    <div className="overflow-x-auto">
      <Tabs defaultValue="trending" className="w-full p-2">
        <TabsList className="bg-transparent gap-2">
          <TabsTrigger value="trending" className="bg-gray-600">
            🔥 Trending
          </TabsTrigger>
          <TabsTrigger value="gainer" className="bg-gray-600">
            💰 Top Gainers
          </TabsTrigger>
          <TabsTrigger value="loser" className="bg-gray-600">
            🔰 Top Losers
          </TabsTrigger>
        </TabsList>
        <TabsContent value="trending">
          <Trending />
        </TabsContent>
        <TabsContent value="gainer">
          <Gainers />
        </TabsContent>
        <TabsContent value="loser">
          <Losers />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CryptoTabs;

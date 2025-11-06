"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Explore from "./categories/Explore";
import PerpDex from "./categories/PerpDex";
import ChainSpot from "./categories/ChainSpot";
import Meme from "./categories/Meme";
import Innovation from "./categories/Innovation";
import Defi from "./categories/Defi";
import Sol from "./categories/Sol";
import GameFi from "./categories/GameFi";
import Oracle from "./categories/Oracle";

const MarketTabs = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <Input
          type="text"
          placeholder="Search cryptocurrencies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/60 dark:bg-gray-800/60 border-gray-200/50 dark:border-gray-700/50 rounded-xl backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <Tabs defaultValue="explore" className="w-full">
        <div className="p-4">
          <TabsList className="bg-gray-100/80 dark:bg-gray-800/80 gap-1 overflow-x-auto p-1 h-auto backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl">
          <TabsTrigger 
            value="explore" 
            className="bg-transparent hover:bg-white/60 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-xs px-3 py-2 whitespace-nowrap border-0 shadow-none rounded-lg transition-all duration-200 font-medium"
          >
            Explore
          </TabsTrigger>
          <TabsTrigger 
            value="perpdex" 
            className="bg-transparent hover:bg-white/60 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-xs px-3 py-2 whitespace-nowrap border-0 shadow-none rounded-lg transition-all duration-200 font-medium"
          >
            PerpDex
          </TabsTrigger>
          <TabsTrigger 
            value="chainspot" 
            className="bg-transparent hover:bg-white/60 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-xs px-3 py-2 whitespace-nowrap border-0 shadow-none rounded-lg transition-all duration-200 font-medium"
          >
            ChainSpot
          </TabsTrigger>
          <TabsTrigger 
            value="meme" 
            className="bg-transparent hover:bg-white/60 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-xs px-3 py-2 whitespace-nowrap border-0 shadow-none rounded-lg transition-all duration-200 font-medium"
          >
            Meme
          </TabsTrigger>
          <TabsTrigger 
            value="innovation" 
            className="bg-transparent hover:bg-white/60 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-xs px-3 py-2 whitespace-nowrap border-0 shadow-none rounded-lg transition-all duration-200 font-medium"
          >
            Innovation
          </TabsTrigger>
          <TabsTrigger 
            value="defi" 
            className="bg-transparent hover:bg-white/60 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-xs px-3 py-2 whitespace-nowrap border-0 shadow-none rounded-lg transition-all duration-200 font-medium"
          >
            DeFi
          </TabsTrigger>
          <TabsTrigger 
            value="sol" 
            className="bg-transparent hover:bg-white/60 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-xs px-3 py-2 whitespace-nowrap border-0 shadow-none rounded-lg transition-all duration-200 font-medium"
          >
            Sol
          </TabsTrigger>
          <TabsTrigger 
            value="gamefi" 
            className="bg-transparent hover:bg-white/60 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-xs px-3 py-2 whitespace-nowrap border-0 shadow-none rounded-lg transition-all duration-200 font-medium"
          >
            GameFi
          </TabsTrigger>
          <TabsTrigger 
            value="oracle" 
            className="bg-transparent hover:bg-white/60 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-xs px-3 py-2 whitespace-nowrap border-0 shadow-none rounded-lg transition-all duration-200 font-medium"
          >
            Oracle
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="explore">
            <Explore searchQuery={searchQuery} />
          </TabsContent>
          <TabsContent value="perpdex">
            <PerpDex searchQuery={searchQuery} />
          </TabsContent>
          <TabsContent value="chainspot">
            <ChainSpot searchQuery={searchQuery} />
          </TabsContent>
          <TabsContent value="meme">
            <Meme searchQuery={searchQuery} />
          </TabsContent>
          <TabsContent value="innovation">
            <Innovation searchQuery={searchQuery} />
          </TabsContent>
          <TabsContent value="defi">
            <Defi searchQuery={searchQuery} />
          </TabsContent>
          <TabsContent value="sol">
            <Sol searchQuery={searchQuery} />
          </TabsContent>
          <TabsContent value="gamefi">
            <GameFi searchQuery={searchQuery} />
          </TabsContent>
          <TabsContent value="oracle">
            <Oracle searchQuery={searchQuery} />
          </TabsContent>
        </div>
        </div>
      </Tabs>
    </div>
  );
};

export default MarketTabs;

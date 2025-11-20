"use client";

import { useState } from "react";
import AddCodeContent from "./AddCodeContent";
import AddCodeNavbar from "./AddCodeNavbar";
import { trpc } from "@/trpc/client";

const AddCodePageClient = () => {
  const title = "";
  const utils = trpc.useUtils();

  const handleRefresh = () => {
    utils.user.getVouchers.invalidate();
  };

  return (
    <div className="mt-10 md:mt-0">
      <AddCodeNavbar title={title} onRefresh={handleRefresh} />
      <AddCodeContent />
    </div>
  );
};

export default AddCodePageClient;


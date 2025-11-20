import { requireAuth } from "@/lib/auth-utils";
import AddCodePageClient from "../_component/AddCodePageClient";

const AddCodePage = async () => {
  await requireAuth();

  return <AddCodePageClient />;
};

export default AddCodePage;


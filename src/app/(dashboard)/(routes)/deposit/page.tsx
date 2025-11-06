// import serverAuth from "@/lib/serverAuth";
import FormDeposit from "./_components/depositform";
import Navigation from "./_components/navigation";

interface DepositPageProps {
  searchParams: Promise<{
    currency?: string;
  }>;
}

const DepositPage = async ({ searchParams }: DepositPageProps) => {
  // const { currentUser } = await serverAuth();
  const accountID = "00000000-0000-0000-0000-000000000000"
  
  // Await searchParams before using
  const params = await searchParams;
  const currency = params.currency || "USDT";
  
  // Create dynamic title based on currency
  const title = `Deposit ${currency}`;
  
  return (
    <div className="mt-10 md:mt-0">
      <Navigation title={title} />
      <FormDeposit userId={accountID} currency={currency} />
    </div>
  );
};

export default DepositPage;

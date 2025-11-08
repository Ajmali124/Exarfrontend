// import serverAuth from "@/lib/serverAuth";
import FormDeposit from "./_components/depositform";
import Navigation from "./_components/navigation";

const DepositPage = async () => {
  const currency = "USDT";
  const title = `Deposit ${currency}`;
  
  return (
    <div className="mt-10 md:mt-0">
      <Navigation title={title} />
      <FormDeposit />
    </div>
  );
};

export default DepositPage;

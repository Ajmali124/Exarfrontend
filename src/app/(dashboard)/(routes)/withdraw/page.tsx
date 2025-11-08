import Navigation from "../deposit/_components/navigation";
import WithdrawForm from "./_components/withdrawform";

const WithdrawPage = async () => {
  const title = "Withdraw USDT";

  return (
    <div className="mt-10 md:mt-0">
      <Navigation title={title} />
      <WithdrawForm />
    </div>
  );
};

export default WithdrawPage;


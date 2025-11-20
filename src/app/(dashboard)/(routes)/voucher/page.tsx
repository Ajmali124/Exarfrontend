import Navbar from "./_component/Navbar";
import VoucherContent from "./_component/VoucherContent";

const VoucherPage = async () => {
  const title = `My Voucher`;
  
  return (
    <div className="mt-10 md:mt-0">
      <Navbar title={title} />
      <VoucherContent />
    </div>
  );
};

export default VoucherPage;

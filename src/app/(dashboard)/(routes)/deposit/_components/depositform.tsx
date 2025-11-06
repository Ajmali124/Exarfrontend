"use client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, Copy, ArrowRight, Info, ArrowUp, ArrowLeftRight } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";

const FormDeposit = ({ userId, currency }: { userId: string; currency: string }) => {
  const [copied, setCopied] = useState(false);
  const [copiedContract, setCopiedContract] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  
  // Mock data for deposit
  const depositData = {
    address: "0xcf298ae202b8522a36043d60f226b087bf2a064e",
    contractAddress: "0x55d398326f99059ff775485246999027b3197955",
    network: currency === 'SOL' ? "Solana Network" : "BNB Smart Chain (BEP20)",
    minAmount: currency === 'SOL' ? "≥ 0.01 SOL" : "≥ 0.8 USDT",
    arrivalTime: "≈ 1 min",
    withdrawalTime: "≈ 1 min",
  };

  // Generate QR Code for wallet address
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const qrCodeDataURL = await QRCode.toDataURL(depositData.address, {
          width: 128,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeDataUrl(qrCodeDataURL);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQRCode();
  }, [depositData.address]);

  const onCopy = (text: string, type: 'address' | 'contract') => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'address') {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        setCopiedContract(true);
        setTimeout(() => setCopiedContract(false), 2000);
      }
    });
  };

  const getCurrencyIcon = () => {
    if (currency === 'USDT') {
      return "/USDT.png";
    } else if (currency === 'SOL') {
      return "/sol.png";
    }
    return "/USDT.png";
  };

  return (
    <div className="w-full max-w-sm mx-auto px-4 pb-24 mt-6">
      {/* QR Code Section */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="w-40 h-40 bg-white border border-gray-200 dark:border-gray-600 rounded-lg flex items-center justify-center">
            {qrCodeDataUrl ? (
              <div className="relative w-32 h-32 rounded flex items-center justify-center">
                <Image
                  src={qrCodeDataUrl}
                  alt="QR Code"
                  width={128}
                  height={128}
                  className="w-32 h-32"
                />
                {/* Currency icon overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <Image
                      src={getCurrencyIcon()}
                      alt={currency}
                      width={24}
                      height={24}
                      className="w-6 h-6"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-white font-bold text-xs">{currency.charAt(0)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Deposit Network */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Deposit network</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{depositData.network}</p>
          </div>
          <ArrowLeftRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Deposit Address */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">Deposit Address</p>
          <ArrowRight className="w-3 h-3 text-gray-400" />
        </div>
        <p className="text-xs font-mono text-gray-900 dark:text-gray-100 break-all leading-relaxed mb-3">
          {depositData.address}
        </p>
        <div className="flex gap-2">
          <Button
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-xs font-medium"
          >
            <><Copy className="w-3 h-3 mr-1" /> Share & Save</>
          </Button>
          <Button
            onClick={() => onCopy(depositData.address, 'address')}
            className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg w-10 h-10 p-0"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Deposit Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">Minimum Deposit</span>
          <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{depositData.minAmount}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">Receiving account</span>
            <Info className="w-3 h-3 ml-1 text-gray-400" />
          </div>
          <div className="flex items-center">
            <span className="text-xs font-medium text-gray-900 dark:text-gray-100">Solbit Account</span>
            <ArrowLeftRight className="w-3 h-3 ml-2 text-gray-400" />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">Arrival time</span>
            <Info className="w-3 h-3 ml-1 text-gray-400" />
          </div>
          <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{depositData.arrivalTime}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">Withdrawal available</span>
            <Info className="w-3 h-3 ml-1 text-gray-400" />
          </div>
          <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{depositData.withdrawalTime}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">Contract address</span>
          <div className="flex items-center">
            <span className="text-xs font-medium text-gray-900 dark:text-gray-100">****197955</span>
            <Button
              onClick={() => onCopy(depositData.contractAddress, 'contract')}
              size="sm"
              variant="ghost"
              className="ml-2 p-1 h-auto w-auto"
            >
              {copiedContract ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
        <div className="flex items-start">
          <Info className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            Send only {currency} to this deposit address. Other assets will be lost and cannot be retrieved.
          </p>
        </div>
      </div>


    </div>
  );
};

export default FormDeposit;

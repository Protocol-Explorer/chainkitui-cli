import React from "react";
import { ethers } from "ethers";

interface BasicConnectButtonProps {
  label: string;
  onAddressReceived?: (address: string) => void | Promise<void>;
}

const BasicConnectButton: React.FC<BasicConnectButtonProps> = ({
  label,
  onAddressReceived,
}) => {

  const handleWalletConnect = async () => {
    //@ts-ignore
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      alert(`Signed in as ${address}`);

      if (onAddressReceived) {
        onAddressReceived(address);
      }
    } else {
      alert("No Wallet Detected");
    }
  };

  return <button onClick={handleWalletConnect}>{label}</button>;
};

export default BasicConnectButton;

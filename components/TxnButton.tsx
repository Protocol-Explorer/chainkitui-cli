import * as React from "react";
import {
  UseWriteContractReturnType,
  useWriteContract,
  type UseWriteContractParameters,
} from "wagmi";
import { WriteContractVariables } from "wagmi/query";

import type { Config } from "@wagmi/core";
import { Abi } from "viem";

import { Button, ButtonProps } from "../shadcnComponents/ui/button.tsx";

// ContextType
type ContextType<config extends Config = Config, context = unknown> = Omit<
  UseWriteContractReturnType<config, context>,
  "writeContract" | "writeContractAsync"
>;

const TxnButtonContext = React.createContext<ContextType | null>(null);

// interface defined to accept the arguments of useWriteContract and `writeContract` function as a prop
interface TxnButtonProps<config extends Config = Config, context = unknown>
  extends ButtonProps {
  writeContractArgs: WriteContractVariables<
    Abi,
    string,
    readonly unknown[],
    config,
    config["chains"][number]["id"]
  >;
  useWriteContractArgs?: UseWriteContractParameters<config, context>;
}

// Have frowardedRef so that the parent component can access the ref of the button
const TxnButton: React.FC<TxnButtonProps> = ({
  writeContractArgs,
  useWriteContractArgs,
  className,
  ...props
}) => {
  const { writeContract, ...returnData } = useWriteContract({
    ...useWriteContractArgs,
  });

  return (
    <TxnButtonContext.Provider value={returnData}>
      <Button
        className={className}
        disabled={!writeContract || returnData.isPending}
        onClick={() => writeContract?.(writeContractArgs)}
        {...props}
      >
        {returnData.isPending ? "Loading..." : "Transact"}
      </Button>
    </TxnButtonContext.Provider>
  );
};

// States is a compound component which will allow the user to access all the states from useWriteContract
const States: React.FC<{
  children: (state: ContextType) => React.ReactNode;
}> = ({ children }) => {
  const returnData = React.useContext(TxnButtonContext);
  if (!returnData) return null;
  {
    /* user can access all the states from useWriteContract */
  }
  return typeof children === "function"
    ? children({ ...returnData })
    : children;
};

TxnButton.displayName = "TxnButton";

// User will be able to access all the variables of useWriteContract from TxnButton.States, thereby making it a compound component
Object.assign(TxnButton, { States });

export { TxnButton };

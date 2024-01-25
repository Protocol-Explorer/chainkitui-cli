// External libraries
import * as React from "react";
import {
  UseWriteContractReturnType,
  useWriteContract,
  type UseWriteContractParameters,
} from "wagmi";
import { WriteContractVariables } from "wagmi/query";

// Internal modules
import type { Config } from "@wagmi/core";
import { Abi } from "viem";
import { Button, ButtonProps } from "../shadcnComponents/ui/button.tsx";

// Type Definitions
type ContextType<config extends Config = Config, context = unknown> = Omit<
  UseWriteContractReturnType<config, context>,
  "writeContract" | "writeContractAsync"
>;

interface TxnButtonProps<config extends Config = Config, context = unknown>
  extends Omit<ButtonProps, "children"> {
  writeContractArgs: WriteContractVariables<
    Abi,
    string,
    readonly unknown[],
    config,
    config["chains"][number]["id"]
  >;
  useWriteContractArgs?: UseWriteContractParameters<config, context>;
  onTxnSuccess?: (data: ContextType) => void;
  onTxnError?: (data: ContextType) => void;
  children?: React.ReactNode | ((state: ContextType) => React.ReactNode);
}

// Components
const TxnButton: React.FC<TxnButtonProps> = ({
  writeContractArgs,
  useWriteContractArgs,
  onTxnSuccess,
  onTxnError,
  children,
  ...buttonProps
}) => {
  const { writeContract, ...returnData } =
    useWriteContract(useWriteContractArgs);

  React.useEffect(() => {
    if (returnData.isSuccess) {
      onTxnSuccess?.(returnData);
    }
  }, [returnData.isSuccess]);

  React.useEffect(() => {
    if (returnData.isError) {
      onTxnError?.(returnData);
    }
  }, [returnData.isSuccess]);

  const buttonText = returnData.isPending
    ? "Loading..."
    : returnData.isSuccess
    ? "Success"
    : returnData.isError
    ? "Error"
    : "Transact";

  return (
    <Button
      disabled={!writeContract || returnData.isPending}
      onClick={() => writeContract?.(writeContractArgs)}
      {...buttonProps}
    >
      {children
        ? typeof children === "function"
          ? children(returnData)
          : children
        : buttonText}
    </Button>
  );
};

TxnButton.displayName = "TxnButton";

// Exports
export { TxnButton };

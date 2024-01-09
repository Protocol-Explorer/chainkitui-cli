import React from "react";
import {
  UseWriteContractReturnType,
  useWriteContract,
  type UseWriteContractParameters,
} from "wagmi";
import { WriteContractVariables } from "wagmi/query";

import type { Config } from "@wagmi/core";
import { Abi } from "viem";

interface TxnButtonProps<config extends Config = Config, context = unknown>
  extends UseWriteContractParameters<config, context> {
  writeContractArgs: WriteContractVariables<
    Abi,
    string,
    readonly unknown[],
    config,
    config["chains"][number]["id"]
  >;
  children?:
    | React.ReactNode
    | ((
        state: Omit<
          UseWriteContractReturnType<config, context>,
          "writeContract" | "writeContractAsync"
        >
      ) => React.ReactNode);
}

export const TxnButton: React.FC<TxnButtonProps> = ({
  writeContractArgs,
  children,
  ...writeContractHooksArgs
}) => {
  const { writeContract, writeContractAsync, ...returnData } = useWriteContract(
    { ...writeContractHooksArgs }
  );
  return (
    <>
      <button
        disabled={!writeContract || returnData.isPending}
        onClick={() => writeContract?.(writeContractArgs)}
      >
        {returnData.isPending ? "Loading..." : "Transact"}
      </button>
      {/* user can access all the states from useContracthook */}
      {typeof children === "function" ? children({ ...returnData }) : children}
    </>
  );
};

import * as React from "react";
import {
  useWriteContract,
  UseWriteContractReturnType,
  type UseWriteContractParameters,
} from "wagmi";
import { WriteContractVariables } from "wagmi/query";

import type { Config } from "@wagmi/core";
import { Abi } from "viem";

import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// ContextType
type ContextType<config extends Config = Config, context = unknown> = Omit<
  UseWriteContractReturnType<config, context>,
  "writeContract" | "writeContractAsync"
>;

const TxnButtonContext = React.createContext<ContextType | null>(null);

// ButtonProps define the native button props
interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

// interface defined to accept the arguments of useWriteContract and `writeContract` function as a prop
interface TxnButtonProps<config extends Config = Config, context = unknown>
  extends UseWriteContractParameters<config, context>,
    ButtonProps {
  writeContractArgs: WriteContractVariables<
    Abi,
    string,
    readonly unknown[],
    config,
    config["chains"][number]["id"]
  >;
}

// Have frowardedRef so that the parent component can access the ref of the button
const TxnButton = React.forwardRef<HTMLButtonElement, TxnButtonProps>(
  (
    {
      writeContractArgs,
      variant,
      size,
      asChild = false,
      ...useWriteContractArgs
    },
    ref
  ) => {
    const { writeContract, ...returnData } = useWriteContract({
      ...useWriteContractArgs,
    });
    const Comp = asChild ? React.Fragment : "button";

    return (
      <TxnButtonContext.Provider value={returnData}>
        <Comp
          className={buttonVariants({ variant, size })}
          disabled={!writeContract || returnData.isPending}
          onClick={() => writeContract?.(writeContractArgs)}
          ref={asChild ? undefined : ref}
        >
          {returnData.isPending ? "Loading..." : "Transact"}
        </Comp>
      </TxnButtonContext.Provider>
    );
  }
);

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

export { buttonVariants, TxnButton };

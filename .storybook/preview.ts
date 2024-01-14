import type { Preview } from "@storybook/react";
import '../main.css'; // replace with the name of your tailwind css file

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    pseudoWindow: {
      // Your pseudo window object
      // Example: You can define properties and methods you need for testing purposes
      ethereum: {
        enable: true,
        request: ( method: string ) => {
          if (method === 'eth_requestAccounts') {
            return Promise.resolve(['0x1234']);
          }
        },
        // ...other properties/methods
      },
      // ...other properties
    },
  },
};

export default preview;

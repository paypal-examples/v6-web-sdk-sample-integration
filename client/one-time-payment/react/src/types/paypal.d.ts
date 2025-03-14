// src/types/paypal.d.ts
declare global {
  interface Window {
      paypal: unknown;
  }
}

export interface ButtonProps extends React.HTMLAttributes<HTMLElement> {
  type: string;
}

declare module 'react' {
  namespace JSX {
      interface IntrinsicElements {
          "paypal-button": ButtonProps,
          "venmo-button": ButtonProps
      }
  }
}

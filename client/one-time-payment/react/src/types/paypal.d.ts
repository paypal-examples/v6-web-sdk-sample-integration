// src/types/paypal.d.ts
declare global {
  interface Window {
      paypal: any;
  }
}

export interface PayPalButtonProps extends React.HTMLAttributes<HTMLElement> {}

declare module 'react' {
  namespace JSX {
      interface IntrinsicElements {
          "paypal-button": PayPalButtonProps
      }
  }
}

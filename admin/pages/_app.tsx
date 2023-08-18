import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";

interface IAppProps {
  Component: any;
  pageProps: {
    session: any;
    pageProps: {
      [x: string]: any;
    };
  };
}

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: IAppProps) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

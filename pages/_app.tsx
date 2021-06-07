import { useState } from "react";
import { AppProps } from "next/dist/next-server/lib/router/router";
import Head from "next/head";

import { GlobalStyles } from "components/GlobalStyles";
import { PointContext } from "context/Points";
import { PointSystem } from "lib/points";
import { MousePad } from "components/MousePad";

export default function MyApp({ pageProps, Component }: AppProps) {
  const [pointSystemInstance] = useState<PointSystem>(new PointSystem());

  return (
    <>
      <Head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @font-face {
            font-family: "Poppins";
            font-style: normal;
            font-weight: 300;
            font-display: swap;
            src: local("Poppins Light"), local("Poppins-Light"),
              url(https://fonts.gstatic.com/s/poppins/v9/pxiByp8kv8JHgFVrLDz8Z1xlFd2JQEk.woff2)
                format("woff2");
            unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6,
              U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191,
              U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
          }
          @font-face {
            font-family: "Poppins";
            font-style: normal;
            font-weight: 500;
            font-display: swap;
            src: local("Poppins Medium"), local("Poppins-Medium"),
              url(https://fonts.gstatic.com/s/poppins/v9/pxiByp8kv8JHgFVrLGT9Z1xlFd2JQEk.woff2)
                format("woff2");
            unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6,
              U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191,
              U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
          }
          @font-face {
            font-family: "Poppins";
            font-style: normal;
            font-weight: 700;
            font-display: swap;
            src: local("Poppins Bold"), local("Poppins-Bold"),
              url(https://fonts.gstatic.com/s/poppins/v9/pxiByp8kv8JHgFVrLCz7Z1xlFd2JQEk.woff2)
                format("woff2");
            unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6,
              U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191,
              U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
          }
        `,
          }}
        />
        <meta charSet="utf-8" />
        <title>Eric's live streams</title>
        <meta
          key="viewport"
          name="viewport"
          content="initial-scale=1.0, width=device-width"
        />
        <meta key="theme-color" name="theme-color" content="#EF5DA8" />
        <meta name="twitter:site" key="twitter:site" content="@zealigan" />
        <meta
          name="twitter:card"
          key="twitter:card"
          content="summary_large_image"
        />
        <meta name="og:title" key="og:title" content="Eric's live streams" />
        <link key="favicon" rel="shortcut icon" href="/images/favicon.png" />
        <meta
          name="og:url"
          key="og:url"
          content="https://streams.ericadamski.dev"
        />
        <meta
          name="description"
          key="description"
          content="See all of Eric's past, present, and future streams! Interact with live streams and vote on content you want to see!"
        />
        <meta
          name="og:description"
          key="og:description"
          content="See all of Eric's past, present, and future streams! Interact with live streams and vote on content you want to see!"
        />
        <meta
          name="og:image"
          key="og:image"
          content="https://streams.ericadamski.dev/images/social.png"
        />
      </Head>
      <PointContext.Provider value={{ instance: pointSystemInstance }}>
        <MousePad />
        <Component {...pageProps} />
      </PointContext.Provider>
      <GlobalStyles />
    </>
  );
}

import { UserProvider } from '../src/UserContext';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <UserProvider>
      
      <Head>
        <link rel="icon" href="/favicon.ico" />
        {/* <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" /> */}
        <meta name="description" content="UJustBe" />
        <title>Lead Capturing Tool</title>
      </Head>
      
      {/* Render the main component */}
      <Component {...pageProps} />
    </UserProvider>
  );
}

export default MyApp;

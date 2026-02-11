import '../src/styles/main.scss';   // ✅ ADD THIS LINE
import { UserProvider } from '../src/UserContext';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <UserProvider>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="UJustBe" />
        <title>Lead Capturing Tool</title>
      </Head>

      <Component {...pageProps} />
    </UserProvider>
  );
}

export default MyApp;

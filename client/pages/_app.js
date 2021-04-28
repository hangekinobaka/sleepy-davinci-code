import Head from 'next/head'
import 'styles/styles.css'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Sleepy Davinci Code</title>
        <meta name='viewport' 
          content='width=device-width, initial-scale=1.0, maximum-scale=1.0, 
     user-scalable=no'></meta>
      </Head>
      <Component {...pageProps} />
    </>
  )
}


export default MyApp

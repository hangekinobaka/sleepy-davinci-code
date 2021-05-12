import Head from 'next/head'
import 'styles/styles.css'
import { Provider } from 'react-redux'
import store from 'redux/store'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Sleepy Davinci Code</title>
        <meta name='viewport' 
          content='width=device-width, initial-scale=1.0, maximum-scale=1.0, 
     user-scalable=no'></meta>
        <meta property="og:title" content="Sleepy DaVinci Code" />
        <meta property="og:site_name" content="Sleepy DaVinci Code" />
        <meta property="og:image" content="https://dvc.sleepystudio.ga/img/ogp.png" />
        <meta property="og:url" content="https://dvc.sleepystudio.ga/" />
        <meta property="og:description" content="An online 1v1 DaVinci Code Game developed by Sleepy Studio" />
        <meta property="twitter:description" content="An online 1v1 DaVinci Code Game developed by Sleepy Studio" />
        <meta property="twitter:image" content="https://dvc.sleepystudio.ga/img/ogp.png" />
      </Head>
      
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    </>
  )
}


export default MyApp

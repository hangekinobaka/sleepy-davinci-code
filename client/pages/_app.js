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
      </Head>
      
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    </>
  )
}


export default MyApp

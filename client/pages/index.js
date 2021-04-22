import Login from 'components/login'

export default function Home({ENDPOINT}) {
  return (
    <Login ENDPOINT={ENDPOINT}/>
  )
}

export async function getStaticProps() {
  const ENDPOINT = process.env.REACT_APP_ENDPOINT || 'localhost:5000'

  return {
    props: {ENDPOINT}, // will be passed to the page component as props
  }
}

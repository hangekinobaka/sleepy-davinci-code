import Login from 'components/login'

export default function Home({API_URL}) {
  return (
    <Login API_URL={API_URL}/>
  )
}

export async function getStaticProps() {
  const API_URL = process.env.REACT_APP_API_URL|| 'http://localhost:5000'

  return {
    props: {API_URL}, // will be passed to the page component as props
  }
}

import styles from 'styles/game-layout.module.scss'

function GameLayout({ children }) {
  return (
    <>
      <div className={styles['main-layout']}>
        {children}
      </div>


      <div className={styles['main-layout-hor']}>
        <h1>Please Use Horizontal View</h1>
      </div>
    </>
  )
}


export default GameLayout

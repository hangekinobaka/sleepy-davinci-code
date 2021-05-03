export const setFps = (app, callback) => {
  let fr = 60 
  let lastTime = new Date().getTime()
  app.ticker.add(()=>{
    const Ctime = new Date().getTime()
    fr += (1000/(Ctime-lastTime)-fr)/10
    const fps = Math.round(fr)+' FPS'
    lastTime = Ctime  
    callback(fps)
  })
}
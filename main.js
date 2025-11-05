if('serviceWorker' in navigator){
    window.addEventListener('load', () =>{
        navigator.serviceWorker.register('/pwa_practica/sw.js')
        .then(reg => {
            console.log('SW Registrado', reg)
        })
        .catch( err => {
            console.log('SW no registrado', err)
        })

    })
}
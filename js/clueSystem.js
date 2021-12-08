const adminClueIndicator = document.querySelector('.clue-indicator')
const clueInput = document.getElementById('clue-input')
const sendClue = document.getElementById('button-send')
const hideClue = document.getElementById('button-hide')

const adminMinsDisplay = document.getElementById('timeDisplay-mins')
const adminSecsDisplay = document.getElementById('timeDisplay-secs')
const playerMinsDisplay = document.getElementById('player-timeDisplay-mins')
const playerSecsDisplay = document.getElementById('player-timeDisplay-secs')

const requestClue = document.getElementById('button-request')
const clueModal = document.querySelector('.clue-modal')
const clueText = document.getElementById('clue-text')

const clueChannel = new BroadcastChannel('clueChannel')
const timeChannel = new BroadcastChannel('timeChannel')

let flashIndicator
let clueRequested

timeChannel.addEventListener('message', (e) => {
    playerMinsDisplay.textContent = e.data.mins
    playerSecsDisplay.textContent = e.data.secs
})

clueChannel.addEventListener('message', (e) => {
    if (e.data === 'REQUEST CLUE') {
        let lit = false
        flashIndicator = setInterval(() => {
            if (!lit) {
                adminClueIndicator.classList.add('clue-indicator-lit')
            } else {
                adminClueIndicator.classList.remove('clue-indicator-lit')
            }
            lit = !lit
        }, 500)
    } else if (e.data === 'HIDE CLUE') {
        clueModal.style.opacity = '0'
    } else {
        clueText.textContent = e.data
        requestClue.style.background = 'rgba(178, 34, 34, 0.75)' 
        clueModal.style.opacity = '1'
        clueRequested = false
    }
})

if (window.location.pathname === '/player') {
    requestClue.addEventListener('click', () => {
        console.log(clueRequested)
        if (!clueRequested) {
            clueRequested = true
            clueChannel.postMessage('REQUEST CLUE')
            requestClue.style.background = 'green'
        }
    })
} else {
    sendClue.addEventListener('click', () => {
        clueChannel.postMessage(clueInput.value)
        clearInterval(flashIndicator)
        adminClueIndicator.classList.remove('clue-indicator-lit')
        new Howl({
            src: '../audio/newMessageAlert.mp3',
            autoplay: true
        })
    })
    
    hideClue.addEventListener('click', () => {
        clueChannel.postMessage('HIDE CLUE')
    })

    setInterval(() => {
        const adminMins = adminMinsDisplay.value ? adminMinsDisplay.value : '00'
        const adminSecs = adminSecsDisplay.value ? adminSecsDisplay.value : '00'

        timeChannel.postMessage({
            mins: adminMins,
            secs: adminSecs
        })
    }, 1000);
}
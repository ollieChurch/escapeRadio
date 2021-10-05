const adminClueContainer = document.getElementById('clue-container')
const clueInput = document.getElementById('clue-input')
const sendClue = document.getElementById('button-send')
const hideClue = document.getElementById('button-hide')

const requestClue = document.getElementById('button-request')
const clueDisplay = document.getElementById('clue-display')

const clueChannel = new BroadcastChannel('clueChannel')

clueChannel.addEventListener('message', (e) => {
    if (e.data === 'REQUEST CLUE') {
        adminClueContainer.style.background = 'red'
    } else {
        clueDisplay.textContent = e.data
        if (e.data) { requestClue.style.background = 'rgba(178, 34, 34, 0.75)' }
    }
})

if (window.location.pathname === '/player') {
    requestClue.addEventListener('click', () => {
        clueChannel.postMessage('REQUEST CLUE')
        requestClue.style.background = 'green'
    })
} else {
    sendClue.addEventListener('click', () => {
        clueChannel.postMessage(clueInput.value)
        adminClueContainer.style.background = 'unset'
        new Howl({
            src: '../audio/newMessageAlert.mp3',
            autoplay: true
        })
    })
    
    hideClue.addEventListener('click', () => {
        clueChannel.postMessage('')
    })
}
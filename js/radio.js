const musicData = [
    {
        name: "Alex Swift Show Start",
        src: "../audio/1ParadoxRadio.mp3",
    },
    {
        name: "Alex Swift Track 10 Intro",
        src: "../audio/2ParadoxRadio.mp3",
    },
    {
        name: "Track 10 - I Don't Recognise Myself ",
        src: "../audio/3ParadoxRadio.mp3",
    },
    {
        name: "Alex Swift Track 10 Outro",
        src: "../audio/4ParadoxRadio.mp3",
    },
    {
        name: "Alex Swift Track 9 Intro",
        src: "../audio/5ParadoxRadio.mp3",
    },
    {
        name: "Track 9 - Don't Lie To Me",
        src: "../audio/6ParadoxRadio.mp3",
    },
    {
        name: "Ad Break",
        src: "../audio/7ParadoxRadio.mp3",
    },
    {
        name: "Jack Mellow Escape Rooms",
        src: "../audio/8ParadoxRadio.mp3",
    },
    {
        name: "Alex Swift Track 8 Intro",
        src: "../audio/9ParadoxRadio.mp3",
    },
    {
        name: "Track 8 - Shadows",
        src: "../audio/10ParadoxRadio.mp3",
    }
]

// ===== TIME REMAINING SET UP ===== //

const gameMinsDisplay = document.getElementById("timeDisplay-mins")
const gameSecsDisplay = document.getElementById("timeDisplay-secs")

let gameTotalSecs = 0
let totalSecsRemaining
let gameOver

// ===== CONTROLS SET UP ===== //

const playButton = document.getElementById("controls-play")
const pauseButton = document.getElementById("controls-pause")
const resetButton = document.getElementById("controls-reset")
const endingButton = document.getElementById("button-ending-perfectWin")
const setUpButton = document.getElementById("controls-setUp")

const failEndingTrack = "paradoxRadioFail"
const winEndingTrack = "paradoxRadioOnTime"

let selectedEndTrack

// ===== RADIO TRACK SET UP ===== //

const playlistContainer = document.getElementById("playlist-container")
const setUpContainer = document.getElementById("setUp-container")

let playlistTrackCards = document.getElementsByClassName("playlist-trackCard")
let currentTrack
let trackCardHeight
let radioPlaying

function systemSetUp() {
    setUpContainer.style.display = "none"
    
    // get data for each track and add it to the playlist
    musicData.forEach(track => {
        const newTrackCard = document.createElement("div")
        newTrackCard.classList.add("playlist-trackCard")
        
        const newTrackTitle = document.createElement("h3")
        newTrackTitle.textContent = track.name
        
        const newTrackDuration = document.createElement("p")
        
        // add ability to change the track by clicking on the playlist
        newTrackCard.addEventListener("click", () => {
            if (!radioPlaying) {
                currentTrack = musicData.indexOf(track)
                for (let i = 0; i < musicData.length; i ++) {
                    playlistTrackCards[i].classList.remove("nowPlaying")
                    if (i < currentTrack - 1) {
                        playlistTrackCards[i].classList.add("played") 
                    } else {
                        playlistTrackCards[i].classList.remove("played")
                    }                    
                }
                updatePlaylist()
                runningTime = 0
            }
        })
        
        // load the track metadata to get the duration
        let audio = new Howl({
            src: track.src,
            preload: 'metadata',
            onload: getDuration
        })
        function getDuration() {
            track.duration = Math.floor(audio.duration())
            gameTotalSecs += track.duration
            const trackMinutes = (Math.floor(track.duration / 60)).toString().padStart(2, "0")
            const trackSecs = (track.duration % 60).toString().padStart(2, "0")
            
            newTrackDuration.textContent = `${trackMinutes}:${trackSecs}`
        }
        
        // add the track to the playlist
        newTrackCard.append(newTrackTitle, newTrackDuration)
        playlistContainer.append(newTrackCard)        
    }) 

    playlistTrackCards = document.getElementsByClassName("playlist-trackCard")
    
    // activate control buttons
    setTimeout(() => {
        resetGame()
        playButton.style.background = "palegreen" // event listener for play button is added during function resetGame
        pauseButton.style.background = "paleturquoise"
        pauseButton.addEventListener("click", pauseRadio)
        resetButton.style.background = "palevioletred"
        resetButton.addEventListener("click", () => {
            radioPlaying && radioTrack.pause()
            clearInterval(trackTimeInterval)
            resetGame()
        })
        endingButton.style.background = "palegoldenrod"
        endingButton.addEventListener("click", () => { 
            selectEnding(winEndingTrack) 
        })
    }, 5000)
}

// ===== NOW PLAYING SET UP ===== //

const nowPlayingTitle = document.getElementById("currentTrack")
const nowPlayingTimeDisplay = document.getElementById("trackTimeRemaining")
const nowPlaylingProgressBar = document.getElementById("trackDisplay-progressBar")
let radioTrack
let trackTimeInterval
let runningTime

// ===== POP-UP SET UP ===== //

const endingPopUp = document.getElementById("popUp-endGame")
const minsTakenDisaply = document.getElementById("minsTaken")
const secsTakenDisplay = document.getElementById("secsTaken")
const closePopUp = document.getElementById("popUp-close")

// ===== GAME RESET ===== //

function resetGame() {
    // reset audio variables
    currentTrack = 0
    runningTime = 0
    gameOver = false
    radioPlaying = false
    
    //reset the playlist display
    playlistCursor()
    for (let i = 0; i < playlistTrackCards.length; i++) {
        playlistTrackCards[i].classList.remove("played") 
        playlistTrackCards[i].classList.remove("nowPlaying")
    }
    
    // reset the 'now playing' display
    nowPlayingTitle.textContent = ""
    nowPlayingTimeDisplay.textContent = "00:00"
    nowPlaylingProgressBar.style.right = "100%"

    // reset to the default ending
    selectedEndTrack = failEndingTrack
    
    // reset timer
    totalSecsRemaining = 0
    updateTimeRemaining()
    
    playButton.addEventListener("click", pressPlay)
}

// ===== RADIO ===== //

function playRadio() {
    // load audio track
    const trackSrc = currentTrack < musicData.length ? musicData[currentTrack].src : `../audio/endTracks/${selectedEndTrack}.mp3`
    radioTrack = new Howl({
        src: trackSrc,
        onend: trackEnd
    })
    
    // if we arent at the end of the playlist then set up a standard track for playing
    if (currentTrack < musicData.length) {
        updatePlaylist()
        
        // if a new song...
        if (runningTime === 0) {
            // update now playing track
            nowPlayingTitle.textContent = musicData[currentTrack].name
            
            // check time remaining count against total song duration remaining and update display
            totalSecsRemaining = 0        
            for (let i = currentTrack; i < musicData.length; i++) {
                totalSecsRemaining += musicData[i].duration
            }
            updateTimeRemaining()
        }
        
        radioTrack.seek(runningTime)
        trackTimeInterval = setInterval(updateTrackTime, 1000)
    } else {
        gameOver = true
        clearInterval(trackTimeInterval)
        
        // generate pop up with the time taken to complete the game
        const totalSecsTaken = gameTotalSecs - totalSecsRemaining
        const minsTaken = Math.floor(totalSecsTaken / 60).toString().padStart(2, "0")
        const secsTaken = (totalSecsTaken % 60).toString().padStart(2, "0")
        minsTakenDisaply.textContent = minsTaken
        secsTakenDisplay.textContent = secsTaken
        endingPopUp.style.display = "block"
    }
    
    radioTrack.play()
    radioPlaying = true
    playlistCursor()
}

function pauseRadio() {
    radioTrack.pause()
    radioPlaying = false
    clearInterval(trackTimeInterval)
    playButton.addEventListener("click", pressPlay)
    playlistCursor()
}

function trackEnd() {
    if (!gameOver) {
        clearInterval(trackTimeInterval)
        currentTrack ++
        runningTime = 0
        playRadio()
    }
}

// ===== TIME ===== //

function updateTrackTime() {
    runningTime = Math.round(radioTrack.seek())
    const { duration } = musicData[currentTrack]
    const trackTotalTimeLeft = duration - runningTime
    const minutesLeft = Math.floor(trackTotalTimeLeft / 60).toString().padStart(2, "0")
    const secsLeft = (trackTotalTimeLeft % 60).toString().padStart(2, "0")
    const progressBarPosition = 100 - ((runningTime / duration) * 100)
    nowPlaylingProgressBar.style.right = `${progressBarPosition}%`
    nowPlayingTimeDisplay.textContent = `${minutesLeft}:${secsLeft}`
    
    // during song playback we remove 1 second from the time remaining every second. This is double checked against the total song duration remaining at the start of each new track (function: playRadio) in case of rounding discrepencies.
    totalSecsRemaining --
    updateTimeRemaining()
}

function updateTimeRemaining() {
    gameMinsDisplay.value = (Math.floor(totalSecsRemaining / 60)).toString().padStart(2, "0")
    gameSecsDisplay.value = (totalSecsRemaining % 60).toString().padStart(2, "0")
}

// ===== CONTROLS ===== //

setUpButton.addEventListener("click", systemSetUp)

function pressPlay() {
    playRadio()
    playButton.removeEventListener("click", pressPlay)
}

// ===== PLAYLIST ===== //

function updatePlaylist() {
    // If this isn't the first song in the playlist...
    if (currentTrack > 0) {
        const prevTrack = currentTrack - 1
        playlistTrackCards[prevTrack].classList.remove("nowPlaying")
        playlistTrackCards[prevTrack].classList.add("played")
    }
    trackCardHeight = playlistTrackCards[0].offsetHeight
    playlistContainer.scrollTop = (trackCardHeight * currentTrack) - trackCardHeight
    if (!gameOver) { playlistTrackCards[currentTrack].classList.add("nowPlaying") }
}

function playlistCursor() {
    for (let i = 0; i < playlistTrackCards.length; i ++) {
        playlistTrackCards[i].style.cursor = radioPlaying ? "default" : "pointer"
    }      
}

// ===== ENDING ===== //

function selectEnding(track) {
    if (!gameOver) {
        selectedEndTrack = track
        radioPlaying && radioTrack.pause()
        currentTrack = musicData.length
        playRadio()
        endingButton.removeEventListener("click", selectEnding)
    }
}

closePopUp.addEventListener("click", () => { endingPopUp.style.display = "none" })

// ===== VOLUME DIP FOR CLUES ===== //

const sendClueBtn = document.getElementById('button-send')
sendClueBtn.addEventListener("click", () => {
    radioTrack.volume(0.15)
    setTimeout(() => radioTrack.volume(1), 2000)
})

// ===== DEBUGGING ONLY ===== //

//function skipTrack(event) {         
//    if (event.keyCode === 110) {
//        radioTrack.pause()
//        trackEnd()
//    }
//}      

// PRESS N TO SKIP TRACK -> //
//window.addEventListener("keypress", skipTrack)      

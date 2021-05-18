
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
const setUpButton = document.getElementById("controls-setUp")

// ===== ENDINGS SET UP ===== //

const failEndingButton = document.getElementById("button-ending-fail")
const earlyEndingButton = document.getElementById("button-ending-earlyWin")
const perfectEndingButton = document.getElementById("button-ending-perfectWin")
const playEndingButton = document.getElementById("button-ending-play")

const failEndingTrack = "placeholder_fail"
const earlyEndingTrack = "placeholder_early"
const perfectEndingTrack = "placeholder_perfect"

let selectedEndingButton
let selectedEndTrack

// ===== RADIO TRACK SET UP ===== //

const playlistContainer = document.getElementById("playlist-container")

import { musicData } from "./musicData.js"
let playlistTrackCards = document.getElementsByClassName("playlist-trackCard")
let currentTrack
let trackCardHeight
let radioPlaying

function systemSetUp() {
    setUpButton.style.display = "none"
    
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
    trackCardHeight = playlistTrackCards[0].clientHeight
    resetGame()
    
    // activate control buttons
    playButton.style.background = "palegreen" // event listener for play button is added during function resetGame
    pauseButton.style.background = "paleturquoise"
    pauseButton.addEventListener("click", pauseRadio)
    resetButton.style.background = "palevioletred"
    resetButton.addEventListener("click", () => {
        if (radioPlaying) { radioTrack.pause() }
        clearInterval(trackTimeInterval)
        resetGame()
    })
    
    // activate ending buttons
    failEndingButton.addEventListener("click", () => {
        selectEnding(failEndingButton, failEndingTrack)
    })
    earlyEndingButton.addEventListener("click", () => {
        selectEnding(earlyEndingButton, earlyEndingTrack)
    })
    perfectEndingButton.addEventListener("click", () => { 
        selectEnding(perfectEndingButton, perfectEndingTrack) 
    })
}

// ===== NOW PLAYING SET UP ===== //

const nowPlayingTitle = document.getElementById("currentTrack")
const nowPlayingTimeDisplay = document.getElementById("trackTimeRemaining")
const nowPlaylingProgressBar = document.getElementById("trackDisplay-progressBar")
let radioTrack
let trackTimeInterval
let gameTimeInterval
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
    
    // reset to the default ending and set up the ending control buttons
    selectedEndingButton = failEndingButton
    selectedEndingButton.classList.add("button-ending-selected")
    selectedEndTrack = failEndingTrack
    playEndingButton.addEventListener("click", playEnding)  
    
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
    } else {
        selectedEndingButton.classList.remove("button-ending-selected")
        resetGame()
    }
}

//function skipTrack(event) {         
//    if (event.keyCode === 110) {
//        radioTrack.pause()
//        trackEnd()
//    }
//}       // ONLY USED IN DEBUGGING -> MAKE SURE EVENT LISTENER IS ACTIVE //

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
//window.addEventListener("keypress", skipTrack)      // PRESS N TO SKIP TRACK -> MAKE SURE skipTrack FUNCTION IS ACTIVE //

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
    playlistContainer.scrollTop = (trackCardHeight * currentTrack)
    if (!gameOver) { playlistTrackCards[currentTrack].classList.add("nowPlaying") }
}

function playlistCursor() {
    for (let i = 0; i < playlistTrackCards.length; i ++) {
        playlistTrackCards[i].style.cursor = radioPlaying ? "default" : "pointer"
    }      
}

// ===== ENDING ===== //

function selectEnding(button, track) {
    if (!gameOver) {
        selectedEndingButton.classList.remove("button-ending-selected")
        button.classList.add("button-ending-selected")
        selectedEndingButton = button
        selectedEndTrack = track
    }
}

function playEnding() {
    radioTrack.pause()
    currentTrack = musicData.length
    playRadio()
    playEndingButton.removeEventListener("click", playEnding)
}

closePopUp.addEventListener("click", () => { endingPopUp.style.display = "none" })
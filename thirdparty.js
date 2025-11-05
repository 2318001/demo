// Third-Party APIs Manager - Handles YouTube Player API
class YouTubeManager {
  constructor(storage) {
    this.storage = storage
    this.player = null
    this.isAPIReady = false
    this.init()
  }

  init() {
    // Wait for YouTube API to be ready
    window.onYouTubeIframeAPIReady = () => {
      this.isAPIReady = true
      console.log("[v0] YouTube API is ready")
    }

    // Set up event listeners
    const loadVideoBtn = document.getElementById("loadVideoBtn")
    const playBtn = document.getElementById("playBtn")
    const pauseBtn = document.getElementById("pauseBtn")
    const stopBtn = document.getElementById("stopBtn")
    const muteBtn = document.getElementById("muteBtn")
    const unmuteBtn = document.getElementById("unmuteBtn")
    const fullscreenBtn = document.getElementById("fullscreenBtn")

    if (loadVideoBtn) loadVideoBtn.addEventListener("click", () => this.loadVideo())
    if (playBtn) playBtn.addEventListener("click", () => this.playVideo())
    if (pauseBtn) pauseBtn.addEventListener("click", () => this.pauseVideo())
    if (stopBtn) stopBtn.addEventListener("click", () => this.stopVideo())
    if (muteBtn) muteBtn.addEventListener("click", () => this.muteVideo())
    if (unmuteBtn) unmuteBtn.addEventListener("click", () => this.unmuteVideo())
    if (fullscreenBtn) fullscreenBtn.addEventListener("click", () => this.toggleFullscreen())

    // Load saved video ID
    const savedVideoId = this.storage.getLocal("youtubeVideoId")
    const videoInput = document.getElementById("youtubeVideoId")
    if (savedVideoId && videoInput) {
      videoInput.value = savedVideoId
    }
  }

  extractVideoId(input) {
    if (!input) return null

    input = input.trim()

    // If it's already a valid YouTube ID (11+ characters)
    if (/^[a-zA-Z0-9_-]{11,}$/.test(input)) {
      return input
    }

    // Extract from full YouTube URL: https://www.youtube.com/watch?v=VIDEO_ID
    const urlMatch = input.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
    if (urlMatch) {
      return urlMatch[1]
    }

    // Extract from short URL: https://youtu.be/VIDEO_ID
    const shortMatch = input.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
    if (shortMatch) {
      return shortMatch[1]
    }

    // If none match, try as direct ID even if not 11 chars
    if (input.length > 0) {
      return input
    }

    return null
  }

  loadVideo() {
    const videoInput = document.getElementById("youtubeVideoId")
    const videoStatus = document.getElementById("videoStatus")

    if (!videoInput || !videoStatus) return

    const videoId = this.extractVideoId(videoInput.value)

    if (!videoId) {
      videoStatus.textContent = "❌ Please enter a valid YouTube Video ID or URL"
      videoStatus.style.color = "#e53e3e"
      return
    }

    // Save video ID to localStorage
    this.storage.setLocal("youtubeVideoId", videoInput.value)

    // Create or update player
    if (this.player) {
      this.player.loadVideoById(videoId)
      videoStatus.textContent = "✅ Video loaded successfully!"
      videoStatus.style.color = "#48bb78"
    } else {
      const YT = window.YT
      if (!YT) {
        videoStatus.textContent = "⏳ YouTube API is loading... Please try again in a moment."
        videoStatus.style.color = "#f6ad55"
        return
      }

      this.player = new YT.Player("youtubePlayer", {
        height: "390",
        width: "100%",
        videoId: videoId,
        playerVars: {
          playsinline: 1,
        },
        events: {
          onReady: (event) => {
            console.log("[v0] YouTube player is ready")
            const controls = document.getElementById("videoControls")
            if (controls) controls.style.display = "flex"
            videoStatus.textContent = "✅ Video loaded and ready to play!"
            videoStatus.style.color = "#48bb78"
          },
          onStateChange: (event) => {
            this.handleStateChange(event)
          },
          onError: (event) => {
            console.error("YouTube player error:", event.data)
            videoStatus.textContent = "❌ Error loading video. Please check the video ID or URL."
            videoStatus.style.color = "#e53e3e"
          },
        },
      })
    }
  }

  handleStateChange(event) {
    const videoStatus = document.getElementById("videoStatus")
    if (!videoStatus) return

    const states = {
      "-1": "Unstarted",
      0: "Ended",
      1: "Playing",
      2: "Paused",
      3: "Buffering",
      5: "Video cued",
    }

    const stateName = states[event.data] || "Unknown"
    videoStatus.textContent = `Status: ${stateName}`
  }

  playVideo() {
    if (this.player && this.player.playVideo) {
      this.player.playVideo()
    }
  }

  pauseVideo() {
    if (this.player && this.player.pauseVideo) {
      this.player.pauseVideo()
    }
  }

  stopVideo() {
    if (this.player && this.player.stopVideo) {
      this.player.stopVideo()
    }
  }

  muteVideo() {
    if (this.player && this.player.mute) {
      this.player.mute()
    }
  }

  unmuteVideo() {
    if (this.player && this.player.unMute) {
      this.player.unMute()
    }
  }

  toggleFullscreen() {
    if (!this.player) return

    const iframe = this.player.getIframe()
    if (!iframe) return

    if (iframe.requestFullscreen) {
      iframe.requestFullscreen()
    } else if (iframe.webkitRequestFullscreen) {
      iframe.webkitRequestFullscreen()
    } else if (iframe.mozRequestFullScreen) {
      iframe.mozRequestFullScreen()
    } else if (iframe.msRequestFullscreen) {
      iframe.msRequestFullscreen()
    }
  }
}

// Export for use in other modules
if (typeof window !== "undefined") {
  window.YouTubeManager = YouTubeManager
}

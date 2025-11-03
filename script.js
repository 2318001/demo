class StorageManager {
  constructor() {
    this.dbName = "LearningJournalDB"
    this.dbVersion = 1
    this.db = null
    this.initIndexedDB()
  }

  // Initialize IndexedDB for complex data storage
  async initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains("journals")) {
          const journalStore = db.createObjectStore("journals", { keyPath: "id", autoIncrement: true })
          journalStore.createIndex("timestamp", "timestamp", { unique: false })
        }

        if (!db.objectStoreNames.contains("projects")) {
          const projectStore = db.createObjectStore("projects", { keyPath: "id", autoIncrement: true })
          projectStore.createIndex("timestamp", "timestamp", { unique: false })
        }
      }
    })
  }

  // LocalStorage methods for simple data
  setLocal(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (e) {
      console.error("LocalStorage error:", e)
      return false
    }
  }

  getLocal(key) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (e) {
      console.error("LocalStorage error:", e)
      return null
    }
  }

  // SessionStorage methods for temporary data
  setSession(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (e) {
      console.error("SessionStorage error:", e)
      return false
    }
  }

  getSession(key) {
    try {
      const item = sessionStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (e) {
      console.error("SessionStorage error:", e)
      return null
    }
  }

  // IndexedDB methods for complex data
  async addToIndexedDB(storeName, data) {
    if (!this.db) await this.initIndexedDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.add(data)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllFromIndexedDB(storeName) {
    if (!this.db) await this.initIndexedDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async clearIndexedDB(storeName) {
    if (!this.db) await this.initIndexedDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

// Initialize storage manager
const storage = new StorageManager()

class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById("themeToggle")
    this.init()
  }

  init() {
    // Load saved theme preference from localStorage
    const savedTheme = storage.getLocal("theme") || "light"
    this.applyTheme(savedTheme)

    // Add event listener for theme toggle
    this.themeToggle.addEventListener("click", () => this.toggleTheme())
  }

  applyTheme(theme) {
    if (theme === "dark") {
      document.body.classList.add("dark-mode")
      this.themeToggle.textContent = "☀️"
      this.themeToggle.title = "Toggle Light Mode"
    } else {
      document.body.classList.remove("dark-mode")
      this.themeToggle.textContent = "🌙"
      this.themeToggle.title = "Toggle Dark Mode"
    }
  }

  toggleTheme() {
    const isDark = document.body.classList.contains("dark-mode")
    const newTheme = isDark ? "light" : "dark"

    this.applyTheme(newTheme)
    storage.setLocal("theme", newTheme)

    console.log(`[v0] Theme switched to ${newTheme} mode`)
  }
}

class YouTubeManager {
  constructor() {
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

    loadVideoBtn.addEventListener("click", () => this.loadVideo())
    playBtn.addEventListener("click", () => this.playVideo())
    pauseBtn.addEventListener("click", () => this.pauseVideo())
    stopBtn.addEventListener("click", () => this.stopVideo())
    muteBtn.addEventListener("click", () => this.muteVideo())
    unmuteBtn.addEventListener("click", () => this.unmuteVideo())

    // Load saved video ID
    const savedVideoId = storage.getLocal("youtubeVideoId")
    if (savedVideoId) {
      document.getElementById("youtubeVideoId").value = savedVideoId
    }
  }

  loadVideo() {
    const videoId = document.getElementById("youtubeVideoId").value.trim()

    if (!videoId) {
      alert("Please enter a YouTube Video ID")
      return
    }

    // Save video ID to localStorage
    storage.setLocal("youtubeVideoId", videoId)

    // Create or update player
    if (this.player) {
      this.player.loadVideoById(videoId)
    } else {
      const YT = window.YT // Declare the YT variable here
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
            document.getElementById("videoControls").style.display = "flex"
          },
          onStateChange: (event) => {
            console.log("[v0] Player state changed:", event.data)
          },
        },
      })
    }
  }

  playVideo() {
    if (this.player) {
      this.player.playVideo()
    }
  }

  pauseVideo() {
    if (this.player) {
      this.player.pauseVideo()
    }
  }

  stopVideo() {
    if (this.player) {
      this.player.stopVideo()
    }
  }

  muteVideo() {
    if (this.player) {
      this.player.mute()
    }
  }

  unmuteVideo() {
    if (this.player) {
      this.player.unMute()
    }
  }
}

class JournalManager {
  constructor() {
    this.journalBtn = document.getElementById("journalBtn")
    this.journalModal = document.getElementById("journalModal")
    this.journalForm = document.getElementById("journalForm")
    this.journalSettingsBtn = document.getElementById("journalSettingsBtn")
    this.resetJournalBtn = document.getElementById("resetJournalBtn")
    this.journalEntries = document.getElementById("journalEntries")
    this.journalEmptyState = document.getElementById("journalEmptyState")

    this.init()
  }

  async init() {
    // Load existing journal entries from IndexedDB
    await this.loadJournals()

    // Event listeners
    this.journalBtn.addEventListener("click", () => this.openModal())
    this.journalSettingsBtn.addEventListener("click", () => this.toggleForm())
    this.journalForm.addEventListener("submit", (e) => this.handleSubmit(e))
    this.resetJournalBtn.addEventListener("click", () => this.resetJournals())
  }

  openModal() {
    this.journalModal.style.display = "block"
    updateDateTime("journalDatetime")
  }

  toggleForm() {
    const isHidden = this.journalForm.style.display === "none"
    this.journalForm.style.display = isHidden ? "block" : "none"
  }

  async handleSubmit(e) {
    e.preventDefault()

    const title = document.getElementById("journalTitle").value
    const content = document.getElementById("journalContent").value

    const entry = {
      title,
      content,
      timestamp: new Date().toISOString(),
      dateString: new Date().toLocaleString(),
    }

    try {
      // Save to IndexedDB
      await storage.addToIndexedDB("journals", entry)

      // Also save to localStorage as backup
      const localJournals = storage.getLocal("journals") || []
      localJournals.push(entry)
      storage.setLocal("journals", localJournals)

      console.log("[v0] Journal entry saved successfully")

      // Reset form and reload entries
      this.journalForm.reset()
      this.journalForm.style.display = "none"
      await this.loadJournals()
    } catch (error) {
      console.error("[v0] Error saving journal:", error)
      alert("Error saving journal entry. Please try again.")
    }
  }

  async loadJournals() {
    try {
      // Load from IndexedDB
      const journals = await storage.getAllFromIndexedDB("journals")

      if (journals.length === 0) {
        this.journalEmptyState.style.display = "block"
        this.journalEntries.innerHTML = ""
        return
      }

      this.journalEmptyState.style.display = "none"

      // Sort by timestamp (newest first)
      journals.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

      // Display entries
      this.journalEntries.innerHTML = journals
        .map(
          (entry) => `
        <div class="journal-entry">
          <h3>${this.escapeHtml(entry.title)}</h3>
          <p>${this.escapeHtml(entry.content)}</p>
          <small>Created: ${entry.dateString}</small>
        </div>
      `,
        )
        .join("")

      console.log(`[v0] Loaded ${journals.length} journal entries from IndexedDB`)
    } catch (error) {
      console.error("[v0] Error loading journals:", error)
    }
  }

  async resetJournals() {
    if (confirm("Are you sure you want to delete all journal entries? This cannot be undone.")) {
      try {
        await storage.clearIndexedDB("journals")
        localStorage.removeItem("journals")
        await this.loadJournals()
        console.log("[v0] All journal entries cleared")
      } catch (error) {
        console.error("[v0] Error clearing journals:", error)
      }
    }
  }

  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }
}

// Update date and time display
function updateDateTime(elementId) {
  const element = document.getElementById(elementId)
  if (element) {
    const now = new Date()
    element.textContent = now.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }
}

// Update page datetime every second
function startPageDateTime() {
  updateDateTime("pageDateTime")
  setInterval(() => updateDateTime("pageDateTime"), 1000)
}

// Modal close functionality
function initializeModals() {
  const modals = document.querySelectorAll(".modal")
  const closeButtons = document.querySelectorAll(".close-button")

  closeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      this.closest(".modal").style.display = "none"
    })
  })

  window.addEventListener("click", (event) => {
    modals.forEach((modal) => {
      if (event.target === modal) {
        modal.style.display = "none"
      }
    })
  })
}

// Initialize other modal buttons (Projects, About, CV, etc.)
function initializeOtherModals() {
  // Projects Modal
  const projectsBtn = document.getElementById("projectsBtn")
  const projectsModal = document.getElementById("projectsModal")
  projectsBtn.addEventListener("click", () => {
    projectsModal.style.display = "block"
    updateDateTime("projectsDatetime")
  })

  // About Modal
  const aboutBtn = document.getElementById("aboutBtn")
  const aboutModal = document.getElementById("aboutModal")
  aboutBtn.addEventListener("click", () => {
    aboutModal.style.display = "block"
    updateDateTime("aboutDatetime")
  })

  // CV Modal
  const cvBtn = document.getElementById("cvBtn")
  const cvModal = document.getElementById("cvModal")
  cvBtn.addEventListener("click", () => {
    cvModal.style.display = "block"
    updateDateTime("cvDatetime")
  })

  // Edit Hero Modal
  const editHeroBtn = document.getElementById("editHeroBtn")
  const editHeroModal = document.getElementById("editHeroModal")
  const editHeroForm = document.getElementById("editHeroForm")

  editHeroBtn.addEventListener("click", () => {
    const currentName = document.getElementById("heroName").textContent
    const currentDesc = document.getElementById("heroDescription").textContent

    document.getElementById("editHeroName").value = currentName
    document.getElementById("editHeroDesc").value = currentDesc

    editHeroModal.style.display = "block"
  })

  editHeroForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const newName = document.getElementById("editHeroName").value
    const newDesc = document.getElementById("editHeroDesc").value

    document.getElementById("heroName").textContent = newName
    document.getElementById("heroDescription").textContent = newDesc

    // Save to localStorage
    storage.setLocal("heroName", newName)
    storage.setLocal("heroDescription", newDesc)

    editHeroModal.style.display = "none"
  })

  // Load saved hero content
  const savedName = storage.getLocal("heroName")
  const savedDesc = storage.getLocal("heroDescription")

  if (savedName) document.getElementById("heroName").textContent = savedName
  if (savedDesc) document.getElementById("heroDescription").textContent = savedDesc
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] Initializing Learning Journal PWA with Storage APIs")

  startPageDateTime()
  initializeModals()
  initializeOtherModals()

  // Initialize managers
  const themeManager = new ThemeManager()
  const journalManager = new JournalManager()
  const youtubeManager = new YouTubeManager()

  console.log("[v0] All features initialized successfully")
  console.log("[v0] Storage APIs: LocalStorage, SessionStorage, and IndexedDB are active")
  console.log("[v0] Theme preference will persist across visits")
  console.log("[v0] Journal entries are saved and will reload after page refresh")
})

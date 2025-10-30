// File: script.js (enhanced)
// Modal functionality
function initializeModals() {
    // Get modal elements
    const journalModal = document.getElementById('journalModal');
    const projectsModal = document.getElementById('projectsModal');
    const journalBtn = document.getElementById('journalBtn');
    const projectsBtn = document.getElementById('projectsBtn');
    const closeButtons = document.getElementsByClassName('close-button');

    // Open modals
    if (journalBtn) {
        journalBtn.onclick = function() {
            journalModal.style.display = "block";
            updateDateTime();
            loadJournalEntries();
        }
    }

    if (projectsBtn) {
        projectsBtn.onclick = function() {
            projectsModal.style.display = "block";
            updateDateTime();
            loadProjects();
        }
    }

    // Close modals when clicking (x)
    Array.from(closeButtons).forEach(button => {
        button.onclick = function() {
            journalModal.style.display = "none";
            projectsModal.style.display = "none";
        }
    });

    // Close modals when clicking outside
    window.onclick = function(event) {
        if (event.target == journalModal) {
            journalModal.style.display = "none";
        }
        if (event.target == projectsModal) {
            projectsModal.style.display = "none";
        }
    }
}

// Function to update date and time
function updateDateTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    const dateTimeString = now.toLocaleString('en-US', options);
    
    // Update date time in journal modal
    const journalDateTime = document.getElementById('journalDatetime');
    if (journalDateTime) {
        journalDateTime.textContent = dateTimeString;
    }
    
    // Update date time in projects modal
    const projectsDateTime = document.getElementById('projectsDatetime');
    if (projectsDateTime) {
        projectsDateTime.textContent = dateTimeString;
    }
}

// Journal functionality with localStorage
function initializeJournal() {
    const journalForm = document.getElementById('journalForm');
    const journalEntries = document.getElementById('journalEntries');

    if (journalForm) {
        journalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('journalTitle').value;
            const content = document.getElementById('journalContent').value;
            
            if (!title || !content) {
                alert('Please fill in all fields');
                return;
            }

            // Save journal entry to localStorage
            saveJournalEntry(title, content);
            
            // Clear form
            journalForm.reset();
            
            // Reload entries
            loadJournalEntries();
        });

        // New button functionality
        const newButton = document.getElementById('newButton');
        if (newButton) {
            newButton.addEventListener('click', function() {
                journalForm.reset();
                document.getElementById('journalTitle').focus();
            });
        }
    }
}

// Save journal entry to localStorage
function saveJournalEntry(title, content) {
    const entry = {
        title,
        content,
        date: new Date().toISOString()
    };
    
    let entries = JSON.parse(localStorage.getItem('journalEntries')) || [];
    entries.unshift(entry); // Add to beginning of array
    localStorage.setItem('journalEntries', JSON.stringify(entries));
}

// Load journal entries from localStorage
function loadJournalEntries() {
    const journalEntries = document.getElementById('journalEntries');
    if (!journalEntries) return;
    
    const entries = JSON.parse(localStorage.getItem('journalEntries')) || [];
    
    journalEntries.innerHTML = '';
    
    if (entries.length === 0) {
        journalEntries.innerHTML = '<p>No journal entries yet. Start writing!</p>';
        return;
    }
    
    entries.forEach(entry => {
        const entryElement = document.createElement('div');
        entryElement.className = 'journal-entry';
        entryElement.innerHTML = `
            <h3>${entry.title}</h3>
            <p>${entry.content}</p>
            <small>${new Date(entry.date).toLocaleString()}</small>
        `;
        journalEntries.appendChild(entryElement);
    });
}

// Projects functionality with localStorage
function initializeProjects() {
    const projectForm = document.getElementById('projectForm');
    const projectsList = document.getElementById('projectsList');

    if (projectForm) {
        projectForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('projectTitle').value;
            const description = document.getElementById('projectDescription').value;
            const files = document.getElementById('projectFiles').files;
            
            if (!title || !description) {
                alert('Please fill in all required fields');
                return;
            }

            // Save project to localStorage
            saveProject(title, description, files);
            
            // Clear form
            projectForm.reset();
            
            // Reload projects
            loadProjects();
        });

        // New button functionality
        const newProjectButton = document.getElementById('newProjectButton');
        if (newProjectButton) {
            newProjectButton.addEventListener('click', function() {
                projectForm.reset();
                document.getElementById('projectTitle').focus();
            });
        }
    }
}

// Save project to localStorage
function saveProject(title, description, files) {
    const project = {
        title,
        description,
        date: new Date().toISOString(),
        images: []
    };
    
    // Handle file uploads
    if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            const reader = new FileReader();
            reader.onload = function(e) {
                project.images.push(e.target.result);
                
                // Save project after all images are loaded
                if (i === files.length - 1) {
                    saveProjectToStorage(project);
                }
            };
            reader.readAsDataURL(files[i]);
        }
    } else {
        saveProjectToStorage(project);
    }
}

function saveProjectToStorage(project) {
    let projects = JSON.parse(localStorage.getItem('projects')) || [];
    projects.unshift(project); // Add to beginning of array
    localStorage.setItem('projects', JSON.stringify(projects));
}

// Load projects from localStorage
function loadProjects() {
    const projectsList = document.getElementById('projectsList');
    if (!projectsList) return;
    
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    
    projectsList.innerHTML = '';
    
    if (projects.length === 0) {
        projectsList.innerHTML = '<p>No projects yet. Add your first project!</p>';
        return;
    }
    
    projects.forEach(project => {
        const projectElement = document.createElement('div');
        projectElement.className = 'project-entry';
        
        let imagesHTML = '';
        if (project.images && project.images.length > 0) {
            imagesHTML = '<div class="project-images">';
            project.images.forEach(image => {
                imagesHTML += `<img src="${image}" alt="Project image" class="project-image">`;
            });
            imagesHTML += '</div>';
        }
        
        projectElement.innerHTML = `
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            ${imagesHTML}
            <small>Added on: ${new Date(project.date).toLocaleString()}</small>
        `;
        projectsList.appendChild(projectElement);
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeModals();
    initializeJournal();
    initializeProjects();
    
    // Update date and time every second
    setInterval(updateDateTime, 1000);
    updateDateTime(); // Initial call
    
    // Load existing data
    loadJournalEntries();
    loadProjects();
});
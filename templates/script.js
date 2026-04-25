function switchTab(tabType) {
    const fileGroup = document.getElementById('file-input-group');
    const urlGroup = document.getElementById('url-input-group');
    const tabs = document.querySelectorAll('.tab');

    if (tabType === 'file') {
        fileGroup.classList.remove('hidden');
        urlGroup.classList.add('hidden');
        tabs[0].classList.add('active');
        tabs[1].classList.remove('active');
    } else {
        fileGroup.classList.add('hidden');
        urlGroup.classList.remove('hidden');
        tabs[0].classList.remove('active');
        tabs[1].classList.add('active');
    }
}

// File Drag and Drop functionality
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-upload');
const fileListDisplay = document.getElementById('file-list');
let selectedFiles = [];

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
        addFiles(Array.from(e.dataTransfer.files));
    }
});

fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
        addFiles(Array.from(fileInput.files));
        fileInput.value = ""; // Reset input so same file can be selected again
    }
});

function addFiles(newFiles) {
    selectedFiles = [...selectedFiles, ...newFiles];
    renderFileList();
}

window.removeFile = function(index) {
    selectedFiles.splice(index, 1);
    renderFileList();
}

function renderFileList() {
    fileListDisplay.innerHTML = '';
    selectedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <span>📄 ${file.name}</span>
            <button type="button" class="remove-file-btn" onclick="removeFile(${index})">✕ Remove</button>
        `;
        fileListDisplay.appendChild(fileItem);
    });
}

// Form Submission
document.getElementById('kb-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btnText = document.getElementById('btn-text');
    const btnLoader = document.getElementById('btn-loader');
    const submitBtn = document.getElementById('submit-btn');
    
    // UI Loading state
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');
    submitBtn.disabled = true;

    const formData = new FormData();
    const url = document.getElementById('url-input').value;

    if (selectedFiles.length === 0 && !url) {
        Swal.fire({
            icon: 'warning',
            title: 'Empty Input',
            text: 'Please provide either files or a URL.',
            background: '#111827',
            color: '#fff',
            confirmButtonColor: '#4f46e5'
        });
        resetBtn();
        return;
    }

    if (selectedFiles.length > 0 && !document.getElementById('file-input-group').classList.contains('hidden')) {
        selectedFiles.forEach(file => {
            formData.append("files", file);
        });
    } else if (url) {
        formData.append("url", url);
    }

    try {
        const response = await fetch('/api/upload-kb', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if(data.status === 'success') {
            const embedCode = `<script src="${window.location.origin}/widget/widget.js" data-bot-id="${data.bot_id}"></script>`;

            document.getElementById('result-section').classList.remove('hidden');
            document.getElementById('embed-code-display').textContent = embedCode;
            
            // For demo purposes, we also dynamically inject the widget here to let them test it immediately!
            const script = document.createElement('script');
            script.src = `${window.location.origin}/widget/widget.js`;
            script.setAttribute('data-bot-id', data.bot_id);
            document.body.appendChild(script);

            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Your chatbot has been generated successfully.',
                background: '#111827',
                color: '#fff',
                confirmButtonColor: '#4f46e5'
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Generation Failed',
                text: 'Error processing knowledge base. Please try again.',
                background: '#111827',
                color: '#fff',
                confirmButtonColor: '#4f46e5'
            });
        }
    } catch (error) {
        console.error("Error:", error);
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong! Please check your connection.',
            background: '#111827',
            color: '#fff',
            confirmButtonColor: '#4f46e5'
        });
    } finally {
        resetBtn();
    }

    function resetBtn() {
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
        submitBtn.disabled = false;
    }
});

// Copy code functionality
function copyCode() {
    const code = document.getElementById('embed-code-display').textContent;
    navigator.clipboard.writeText(code).then(() => {
        const copyBtn = document.getElementById('copy-btn');
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = 'Copy';
        }, 2000);
    });
}

// Neural Network Background Animation
const canvas = document.getElementById('neural-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height, particles;
    let mouse = {
        x: null,
        y: null,
        radius: 150 // Radius of interaction
    };

    window.addEventListener('mousemove', function(event) {
        mouse.x = event.x;
        mouse.y = event.y;
    });

    window.addEventListener('mouseout', function() {
        mouse.x = null;
        mouse.y = null;
    });

    function initCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        particles = [];
        
        const particleCount = Math.min(Math.floor(window.innerWidth / 15), 100);
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                radius: Math.random() * 2 + 1
            });
        }
    }

    function animateCanvas() {
        ctx.clearRect(0, 0, width, height);
        
        // Draw connections
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
        for (let i = 0; i < particles.length; i++) {
            // Check distance with mouse
            if (mouse.x != null && mouse.y != null) {
                let dxMouse = particles[i].x - mouse.x;
                let dyMouse = particles[i].y - mouse.y;
                let distMouse = dxMouse * dxMouse + dyMouse * dyMouse;
                
                if (distMouse < mouse.radius * mouse.radius) {
                    ctx.beginPath();
                    // Make line thicker/brighter closer to mouse
                    let opacity = 1 - (Math.sqrt(distMouse) / mouse.radius);
                    ctx.strokeStyle = `rgba(165, 180, 252, ${opacity * 0.8})`;
                    ctx.lineWidth = 1.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                    
                    // Optionally make particles slowly move towards mouse
                    particles[i].x -= dxMouse * 0.01;
                    particles[i].y -= dyMouse * 0.01;
                }
            }

            // Check distance with other particles
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = dx * dx + dy * dy;
                
                if (dist < 15000) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        
        // Update and draw particles
        ctx.fillStyle = 'rgba(165, 180, 252, 0.8)';
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            
            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        
        requestAnimationFrame(animateCanvas);
    }

    initCanvas();
    animateCanvas();
    window.addEventListener('resize', initCanvas);
}

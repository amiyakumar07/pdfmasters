// State Management
const state = {
    selectedTool: 'merge',
    files: [],
    processing: false,
    apiBaseUrl: 'http://localhost:3000/api',
    tools: [
        { id: 'merge', name: 'Merge PDF', icon: 'fa-file-medical', category: 'organize', time: '10s' },
        { id: 'split', name: 'Split PDF', icon: 'fa-cut', category: 'organize', time: '15s' },
        { id: 'compress', name: 'Compress PDF', icon: 'fa-compress-alt', category: 'optimize', time: '5s' },
        { id: 'pdf-to-word', name: 'PDF to Word', icon: 'fa-file-word', category: 'convert', time: '20s' },
        { id: 'pdf-to-excel', name: 'PDF to Excel', icon: 'fa-file-excel', category: 'convert', time: '25s' },
        { id: 'word-to-pdf', name: 'Word to PDF', icon: 'fa-file-export', category: 'convert', time: '8s' },
        { id: 'ppt-to-pdf', name: 'PowerPoint to PDF', icon: 'fa-file-powerpoint', category: 'convert', time: '10s' },
        { id: 'excel-to-pdf', name: 'Excel to PDF', icon: 'fa-table', category: 'convert', time: '12s' },
        { id: 'edit-pdf', name: 'Edit PDF', icon: 'fa-edit', category: 'edit', time: '30s' },
        { id: 'pdf-to-jpg', name: 'PDF to JPG', icon: 'fa-file-image', category: 'convert', time: '15s' },
        { id: 'jpg-to-pdf', name: 'JPG to PDF', icon: 'fa-images', category: 'convert', time: '5s' },
        { id: 'sign-pdf', name: 'Sign PDF', icon: 'fa-signature', category: 'security', time: '40s' },
        { id: 'watermark', name: 'Watermark', icon: 'fa-tint', category: 'edit', time: '20s' },
        { id: 'rotate-pdf', name: 'Rotate PDF', icon: 'fa-redo', category: 'edit', time: '10s' },
        { id: 'html-to-pdf', name: 'HTML to PDF', icon: 'fa-html5', category: 'convert', time: '15s' },
        { id: 'unlock-pdf', name: 'Unlock PDF', icon: 'fa-unlock', category: 'security', time: '10s' },
        { id: 'protect-pdf', name: 'Protect PDF', icon: 'fa-lock', category: 'security', time: '10s' },
        { id: 'organize-pdf', name: 'Organize PDF', icon: 'fa-layer-group', category: 'organize', time: '25s' },
        { id: 'pdf-to-pdfa', name: 'PDF to PDF/A', icon: 'fa-archive', category: 'convert', time: '20s' },
        { id: 'repair-pdf', name: 'Repair PDF', icon: 'fa-wrench', category: 'optimize', time: '30s' },
        { id: 'page-numbers', name: 'Page Numbers', icon: 'fa-list-ol', category: 'edit', time: '15s' },
        { id: 'scan-to-pdf', name: 'Scan to PDF', icon: 'fa-mobile-alt', category: 'convert', time: '10s' },
        { id: 'ocr-pdf', name: 'OCR PDF', icon: 'fa-eye', category: 'convert', time: '45s' },
        { id: 'compare-pdf', name: 'Compare PDF', icon: 'fa-columns', category: 'edit', time: '30s' },
        { id: 'redact-pdf', name: 'Redact PDF', icon: 'fa-eye-slash', category: 'security', time: '25s' },
        { id: 'workflow', name: 'Create Workflow', icon: 'fa-project-diagram', category: 'organize', time: '60s' }
    ]
};

// DOM Elements
const elements = {
    fileInput: document.getElementById('fileInput'),
    uploadArea: document.getElementById('uploadArea'),
    selectedFiles: document.getElementById('selectedFiles'),
    fileCount: document.getElementById('fileCount'),
    fileList: document.getElementById('fileList'),
    clearFiles: document.getElementById('clearFiles'),
    addMoreBtn: document.getElementById('addMoreBtn'),
    processBtn: document.getElementById('processBtn'),
    toolsGrid: document.getElementById('toolsGrid'),
    searchTools: document.getElementById('searchTools'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    processingModal: document.getElementById('processingModal'),
    resultModal: document.getElementById('resultModal'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    currentFile: document.getElementById('currentFile'),
    totalFiles: document.getElementById('totalFiles'),
    currentTool: document.getElementById('currentTool'),
    estimatedTime: document.getElementById('estimatedTime'),
    downloadBtn: document.getElementById('downloadBtn'),
    resultFileName: document.getElementById('resultFileName'),
    resultFileSize: document.getElementById('resultFileSize'),
    resultPageCount: document.getElementById('resultPageCount'),
    newProcessBtn: document.getElementById('newProcessBtn'),
    saveToCloudBtn: document.getElementById('saveToCloudBtn'),
    shareBtn: document.getElementById('shareBtn'),
    modalCloses: document.querySelectorAll('.modal-close'),
    viewMoreTools: document.getElementById('viewMoreTools')
};

// Initialize Application
function init() {
    setupEventListeners();
    setupDragAndDrop();
    setupToolFilter();
    checkBackend();
    updateFileList();
}

// Setup Event Listeners
function setupEventListeners() {
    // File Upload
    elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', handleFileSelect);
    elements.addMoreBtn?.addEventListener('click', () => elements.fileInput.click());
    
    // File Management
    elements.clearFiles?.addEventListener('click', clearAllFiles);
    elements.processBtn?.addEventListener('click', processFiles);
    
    // Tool Selection
    elements.toolsGrid?.addEventListener('click', handleToolClick);
    
    // Search
    elements.searchTools?.addEventListener('input', filterTools);
    
    // Modals
    elements.modalCloses.forEach(close => {
        close.addEventListener('click', closeAllModals);
    });
    
    // Download
    elements.downloadBtn?.addEventListener('click', handleDownload);
    
    // New Process
    elements.newProcessBtn?.addEventListener('click', () => {
        closeAllModals();
        clearAllFiles();
    });
    
    // Save to Cloud
    elements.saveToCloudBtn?.addEventListener('click', saveToCloud);
    
    // Share
    elements.shareBtn?.addEventListener('click', shareFile);
    
    // View More Tools
    elements.viewMoreTools?.addEventListener('click', toggleMoreTools);
    
    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target === elements.processingModal) {
            closeAllModals();
        }
        if (e.target === elements.resultModal) {
            closeAllModals();
        }
    });
}

// Setup Drag and Drop
function setupDragAndDrop() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        elements.uploadArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        elements.uploadArea.addEventListener(eventName, () => {
            elements.uploadArea.style.borderColor = '#4361ee';
            elements.uploadArea.style.backgroundColor = 'rgba(67, 97, 238, 0.05)';
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        elements.uploadArea.addEventListener(eventName, () => {
            elements.uploadArea.style.borderColor = '#e1e5eb';
            elements.uploadArea.style.backgroundColor = '';
        }, false);
    });
    
    elements.uploadArea.addEventListener('drop', handleDrop, false);
}

// Setup Tool Filter
function setupToolFilter() {
    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            elements.filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Filter tools
            const filter = btn.dataset.filter;
            filterToolsByCategory(filter);
        });
    });
}

// Handle File Select
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    addFiles(files);
}

// Handle Drop
function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = Array.from(dt.files);
    addFiles(files);
}

// Add Files
function addFiles(newFiles) {
    // Validate files
    const validFiles = newFiles.filter(file => {
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
            showNotification(`File ${file.name} is too large (max 100MB)`, 'error');
            return false;
        }
        
        const allowedTypes = [
            '.pdf', '.doc', '.docx', '.ppt', '.pptx', 
            '.xls', '.xlsx', '.jpg', '.jpeg', '.png', 
            '.txt', '.html', '.rtf'
        ];
        const fileExt = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!allowedTypes.includes(fileExt)) {
            showNotification(`File type not supported: ${fileExt}`, 'error');
            return false;
        }
        
        return true;
    });
    
    // Add to state
    validFiles.forEach(file => {
        state.files.push({
            id: generateId(),
            file: file,
            name: file.name,
            size: formatFileSize(file.size),
            type: file.type,
            uploadTime: new Date().toLocaleTimeString(),
            progress: 0
        });
    });
    
    updateFileList();
    
    if (validFiles.length > 0) {
        showNotification(`Added ${validFiles.length} file(s)`, 'success');
    }
}

// Update File List Display
function updateFileList() {
    if (!elements.fileList) return;
    
    if (state.files.length === 0) {
        elements.selectedFiles.style.display = 'none';
        return;
    }
    
    elements.selectedFiles.style.display = 'block';
    elements.fileCount.textContent = `(${state.files.length})`;
    
    elements.fileList.innerHTML = state.files.map(file => `
        <div class="file-item" data-id="${file.id}">
            <div class="file-info">
                <i class="fas ${getFileIcon(file.name)} file-icon"></i>
                <div class="file-details">
                    <h4>${file.name}</h4>
                    <p>${file.size} • Uploaded at ${file.uploadTime}</p>
                </div>
            </div>
            <button class="btn-text remove-file" data-id="${file.id}">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
    
    // Add remove event listeners
    document.querySelectorAll('.remove-file').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const fileId = btn.dataset.id;
            removeFile(fileId);
        });
    });
}

// Remove File
function removeFile(fileId) {
    state.files = state.files.filter(file => file.id !== fileId);
    updateFileList();
    showNotification('File removed', 'info');
}

// Clear All Files
function clearAllFiles() {
    if (state.files.length === 0) return;
    
    if (confirm('Are you sure you want to remove all files?')) {
        state.files = [];
        updateFileList();
        showNotification('All files cleared', 'info');
    }
}

// Handle Tool Click
function handleToolClick(e) {
    const toolCard = e.target.closest('.tool-card');
    if (!toolCard) return;
    
    const toolId = toolCard.dataset.tool;
    const tool = state.tools.find(t => t.id === toolId);
    
    if (tool) {
        state.selectedTool = toolId;
        
        // Update active state
        document.querySelectorAll('.tool-card').forEach(card => {
            card.classList.remove('active');
        });
        toolCard.classList.add('active');
        
        // Show notification
        showNotification(`Selected: ${tool.name}. Upload files to continue.`, 'info');
        
        // Scroll to upload section
        document.querySelector('.upload-section')?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Filter Tools
function filterTools() {
    const searchTerm = elements.searchTools.value.toLowerCase();
    const toolCards = document.querySelectorAll('.tool-card');
    
    toolCards.forEach(card => {
        const toolName = card.querySelector('h3').textContent.toLowerCase();
        const toolDesc = card.querySelector('p').textContent.toLowerCase();
        
        if (toolName.includes(searchTerm) || toolDesc.includes(searchTerm)) {
            card.style.display = 'block';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 10);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

// Filter Tools by Category
function filterToolsByCategory(category) {
    const toolCards = document.querySelectorAll('.tool-card');
    
    toolCards.forEach(card => {
        const cardCategory = card.dataset.category;
        
        if (category === 'all' || cardCategory === category) {
            card.style.display = 'block';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 10);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

// Toggle More Tools
function toggleMoreTools() {
    const hiddenTools = document.querySelectorAll('.tool-card:nth-child(n+13)');
    const isExpanded = elements.viewMoreTools.innerHTML.includes('View Less');
    
    hiddenTools.forEach((tool, index) => {
        setTimeout(() => {
            if (isExpanded) {
                tool.style.display = 'none';
            } else {
                tool.style.display = 'block';
                setTimeout(() => {
                    tool.style.opacity = '1';
                    tool.style.transform = 'translateY(0)';
                }, index * 50);
            }
        }, index * 50);
    });
    
    elements.viewMoreTools.innerHTML = isExpanded 
        ? '<i class="fas fa-chevron-down"></i> View All 35+ Tools'
        : '<i class="fas fa-chevron-up"></i> View Less';
}

// Process Files
async function processFiles() {
    if (state.files.length === 0) {
        showNotification('Please select files first', 'error');
        return;
    }
    
    const tool = state.tools.find(t => t.id === state.selectedTool);
    if (!tool) {
        showNotification('Please select a tool first', 'error');
        return;
    }
    
    state.processing = true;
    
    // Show processing modal
    elements.processingModal.classList.add('active');
    elements.currentTool.textContent = tool.name;
    elements.totalFiles.textContent = state.files.length;
    elements.estimatedTime.textContent = tool.time;
    
    try {
        // Simulate processing
        await simulateProcessing();
        
        // Show result
        showResult(tool);
        
    } catch (error) {
        console.error('Processing error:', error);
        showNotification('Processing failed. Please try again.', 'error');
    } finally {
        state.processing = false;
    }
}

// Simulate Processing
function simulateProcessing() {
    return new Promise((resolve) => {
        let progress = 0;
        const totalSteps = 5;
        const stepDuration = 1000;
        
        const interval = setInterval(() => {
            progress += 20;
            updateProgress(progress, `Step ${progress/20} of ${totalSteps}`);
            
            if (progress >= 100) {
                clearInterval(interval);
                updateProgress(100, 'Processing complete!');
                setTimeout(resolve, 500);
            }
        }, stepDuration);
    });
}

// Update Progress
function updateProgress(percentage, text) {
    if (elements.progressFill) {
        elements.progressFill.style.width = `${percentage}%`;
    }
    if (elements.progressText) {
        elements.progressText.textContent = text;
    }
    
    // Update current file (simulated)
    const current = Math.ceil((percentage / 100) * state.files.length);
    if (elements.currentFile) {
        elements.currentFile.textContent = Math.min(current, state.files.length);
    }
}

// Show Result
function showResult(tool) {
    // Hide processing modal
    elements.processingModal.classList.remove('active');
    
    // Update result info
    const resultFile = {
        name: `processed-${tool.id}-${Date.now()}.pdf`,
        size: formatFileSize(Math.random() * 5000000 + 1000000), // 1-6MB
        pages: Math.floor(Math.random() * 50) + 1
    };
    
    elements.resultFileName.textContent = resultFile.name;
    elements.resultFileSize.textContent = resultFile.size;
    elements.resultPageCount.textContent = `${resultFile.pages} pages`;
    
    // Show result modal
    setTimeout(() => {
        elements.resultModal.classList.add('active');
    }, 300);
}

// Handle Download
async function handleDownload() {
    try {
        showNotification('Starting download...', 'info');
        
        // Create a sample PDF for download
        const pdfContent = generateSamplePDF();
        const blob = new Blob([pdfContent], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const a = document.createElement('a');
        a.href = url;
        a.download = elements.resultFileName.textContent;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Cleanup
        URL.revokeObjectURL(url);
        
        // Close modal after download
        setTimeout(() => {
            elements.resultModal.classList.remove('active');
            showNotification('File downloaded successfully!', 'success');
        }, 1000);
        
    } catch (error) {
        console.error('Download error:', error);
        showNotification('Download failed. Please try again.', 'error');
    }
}

// Save to Cloud
function saveToCloud() {
    showNotification('Saving to cloud...', 'info');
    
    // Simulate cloud save
    setTimeout(() => {
        showNotification('File saved to cloud successfully!', 'success');
    }, 1500);
}

// Share File
function shareFile() {
    if (navigator.share) {
        navigator.share({
            title: 'Processed PDF File',
            text: 'Check out this PDF I processed with PDFMaster',
            url: window.location.href
        });
    } else {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(window.location.href);
        showNotification('Link copied to clipboard!', 'success');
    }
}

// Close All Modals
function closeAllModals() {
    elements.processingModal.classList.remove('active');
    elements.resultModal.classList.remove('active');
}

// Check Backend Connection
async function checkBackend() {
    try {
        const response = await fetch('http://localhost:3000/api/health');
        if (response.ok) {
            console.log('Backend connected successfully');
        }
    } catch (error) {
        console.warn('Backend not connected. Running in demo mode.');
    }
}

// Helper Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    switch(ext) {
        case 'pdf': return 'fa-file-pdf';
        case 'doc':
        case 'docx': return 'fa-file-word';
        case 'ppt':
        case 'pptx': return 'fa-file-powerpoint';
        case 'xls':
        case 'xlsx': return 'fa-file-excel';
        case 'jpg':
        case 'jpeg':
        case 'png': return 'fa-file-image';
        case 'txt': return 'fa-file-alt';
        case 'html': return 'fa-html5';
        default: return 'fa-file';
    }
}

function generateSamplePDF() {
    // Simple PDF content for demonstration
    return `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 73 >>
stream
BT
/F1 24 Tf
72 720 Td
(Your PDF is Ready!) Tj
/F1 12 Tf
72 680 Td
(Processed with PDFMaster) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000010 00000 n
0000000053 00000 n
0000000102 00000 n
0000000172 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
281
%%EOF`;
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles if not present
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 16px 24px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                max-width: 400px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                animation: slideIn 0.3s ease;
                transform: translateX(0);
            }
            .notification-success { background: #2ec4b6; }
            .notification-error { background: #e71d36; }
            .notification-warning { background: #ff9f1c; }
            .notification-info { background: #4361ee; }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                margin-left: 15px;
                line-height: 1;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Add close event
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
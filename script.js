// State Management
const state = {
    selectedTool: 'merge',
    files: [],
    processing: false,
    apiBaseUrl: 'http://localhost:3000/api',
    currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,
    pendingVerification: null,
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

// OTP Email Service
class OTPEmailService {
    constructor() {
        this.sentOTPs = new Map();
        this.initEmailJS();
    }
    
    initEmailJS() {
        // Initialize EmailJS with your public key
        // Replace with your EmailJS public key
        if (typeof emailjs !== 'undefined') {
            emailjs.init("YOUR_PUBLIC_KEY_HERE");
        }
    }
    
    // Generate OTP
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    
    // Send OTP via Email using EmailJS
    async sendEmailOTP(email, otp, userName = 'User') {
        try {
            // Store OTP with expiration (5 minutes)
            this.sentOTPs.set(email, {
                otp: otp,
                expires: Date.now() + 5 * 60 * 1000, // 5 minutes
                attempts: 0,
                userName: userName
            });
            
            // For demo/testing, show OTP in console
            console.log(`[OTP Service] OTP for ${email}: ${otp}`);
            console.log('In production, this would be sent via EmailJS');
            
            // Uncomment below to enable real email sending with EmailJS
            /*
            const templateParams = {
                to_email: email,
                to_name: userName,
                otp_code: otp,
                website_name: "swagchup",
                expiration_time: "5 minutes"
            };
            
            const response = await emailjs.send(
                'service_swagchup', // Your EmailJS service ID
                'template_otp_verification', // Your EmailJS template ID
                templateParams
            );
            
            console.log('Email sent successfully:', response);
            */
            
            return {
                success: true,
                message: `OTP sent to ${email}`,
                otp: otp // For demo/testing only
            };
            
        } catch (error) {
            console.error('Failed to send email:', error);
            
            // Fallback to console for testing
            console.log(`[FALLBACK] OTP for ${email}: ${otp}`);
            
            return {
                success: true, // Still return success for demo
                message: `OTP generated for ${email}`,
                otp: otp
            };
        }
    }
    
    // Verify OTP
    verifyOTP(email, userOTP) {
        const stored = this.sentOTPs.get(email);
        
        if (!stored) {
            return {
                success: false,
                message: 'No OTP found. Please request a new one.'
            };
        }
        
        if (Date.now() > stored.expires) {
            this.sentOTPs.delete(email);
            return {
                success: false,
                message: 'OTP has expired. Please request a new one.'
            };
        }
        
        stored.attempts++;
        
        if (stored.attempts > 3) {
            this.sentOTPs.delete(email);
            return {
                success: false,
                message: 'Too many attempts. OTP invalidated.'
            };
        }
        
        if (stored.otp === userOTP) {
            this.sentOTPs.delete(email); // Clear OTP after successful verification
            return {
                success: true,
                message: 'OTP verified successfully!',
                userName: stored.userName
            };
        } else {
            return {
                success: false,
                message: `Incorrect OTP. ${3 - stored.attempts} attempts remaining.`
            };
        }
    }
    
    // Resend OTP
    async resendOTP(email, userName) {
        const newOTP = this.generateOTP();
        return await this.sendEmailOTP(email, newOTP, userName);
    }
}

// Initialize OTP Service
const otpService = new OTPEmailService();

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
    viewMoreTools: document.getElementById('viewMoreTools'),
    
    // Auth Elements
    authModal: document.getElementById('auth-modal'),
    loginTab: document.getElementById('login-tab'),
    signupTab: document.getElementById('signup-tab'),
    loginForm: document.getElementById('login-form'),
    signupForm: document.getElementById('signup-form'),
    otpSection: document.getElementById('otp-section'),
    closeAuth: document.getElementById('close-auth'),
    openLogin: document.getElementById('open-login'),
    openSignup: document.getElementById('open-signup'),
    switchToSignup: document.getElementById('switch-to-signup'),
    switchToLogin: document.getElementById('switch-to-login'),
    otpEmailDisplay: document.getElementById('otp-email-display'),
    otpInputContainer: document.getElementById('otp-input-container'),
    verifyOtpBtn: document.getElementById('verify-otp-btn'),
    otpErrorMessage: document.getElementById('otp-error-message'),
    otpSuccessMessage: document.getElementById('otp-success-message'),
    otpTimer: document.getElementById('otp-timer'),
    otpTime: document.getElementById('otp-time'),
    resendOtpBtn: document.getElementById('resend-otp-btn'),
    resendCountdown: document.getElementById('resend-countdown'),
    backToFormBtn: document.getElementById('back-to-form-btn'),
    authButtons: document.getElementById('auth-buttons'),
    userProfile: document.getElementById('user-profile'),
    userName: document.getElementById('user-name'),
    userAvatar: document.getElementById('user-avatar'),
    loginEmail: document.getElementById('login-email'),
    loginPassword: document.getElementById('login-password'),
    signupName: document.getElementById('signup-name'),
    signupEmail: document.getElementById('signup-email'),
    signupPassword: document.getElementById('signup-password'),
    confirmPassword: document.getElementById('confirm-password'),
    termsAgreement: document.getElementById('terms-agreement')
};

// Initialize Application
function init() {
    setupEventListeners();
    setupDragAndDrop();
    setupToolFilter();
    setupAuthEventListeners();
    updateAuthUI();
    checkBackend();
    updateFileList();
    setupDemoUser();
}

// Setup Event Listeners
function setupEventListeners() {
    // File Upload
    if (elements.uploadArea) {
        elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
    }
    if (elements.fileInput) {
        elements.fileInput.addEventListener('change', handleFileSelect);
    }
    if (elements.addMoreBtn) {
        elements.addMoreBtn.addEventListener('click', () => elements.fileInput.click());
    }
    
    // File Management
    if (elements.clearFiles) {
        elements.clearFiles.addEventListener('click', clearAllFiles);
    }
    if (elements.processBtn) {
        elements.processBtn.addEventListener('click', processFiles);
    }
    
    // Tool Selection
    if (elements.toolsGrid) {
        elements.toolsGrid.addEventListener('click', handleToolClick);
    }
    
    // Search
    if (elements.searchTools) {
        elements.searchTools.addEventListener('input', filterTools);
    }
    
    // Modals
    if (elements.modalCloses) {
        elements.modalCloses.forEach(close => {
            close.addEventListener('click', closeAllModals);
        });
    }
    
    // Download
    if (elements.downloadBtn) {
        elements.downloadBtn.addEventListener('click', handleDownload);
    }
    
    // New Process
    if (elements.newProcessBtn) {
        elements.newProcessBtn.addEventListener('click', () => {
            closeAllModals();
            clearAllFiles();
        });
    }
    
    // Save to Cloud
    if (elements.saveToCloudBtn) {
        elements.saveToCloudBtn.addEventListener('click', saveToCloud);
    }
    
    // Share
    if (elements.shareBtn) {
        elements.shareBtn.addEventListener('click', shareFile);
    }
    
    // View More Tools
    if (elements.viewMoreTools) {
        elements.viewMoreTools.addEventListener('click', toggleMoreTools);
    }
    
    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (elements.processingModal && e.target === elements.processingModal) {
            closeAllModals();
        }
        if (elements.resultModal && e.target === elements.resultModal) {
            closeAllModals();
        }
    });
}

// Setup Auth Event Listeners
function setupAuthEventListeners() {
    // Open/Close Auth Modal
    if (elements.openLogin) {
        elements.openLogin.addEventListener('click', () => openAuthModal('login'));
    }
    if (elements.openSignup) {
        elements.openSignup.addEventListener('click', () => openAuthModal('signup'));
    }
    if (elements.switchToSignup) {
        elements.switchToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            openAuthModal('signup');
        });
    }
    if (elements.switchToLogin) {
        elements.switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            openAuthModal('login');
        });
    }
    if (elements.closeAuth) {
        elements.closeAuth.addEventListener('click', closeAuthModal);
    }
    
    if (elements.authModal) {
        elements.authModal.addEventListener('click', (e) => {
            if (e.target === elements.authModal) {
                closeAuthModal();
            }
        });
    }
    
    // Tab Switching
    if (elements.loginTab) {
        elements.loginTab.addEventListener('click', () => {
            switchToTab('login');
        });
    }
    if (elements.signupTab) {
        elements.signupTab.addEventListener('click', () => {
            switchToTab('signup');
        });
    }
    
    // Login Form Submission
    if (elements.loginForm) {
        elements.loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleLogin();
        });
    }
    
    // Signup Form Submission
    if (elements.signupForm) {
        elements.signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleSignup();
        });
    }
    
    // OTP Verification
    if (elements.verifyOtpBtn) {
        elements.verifyOtpBtn.addEventListener('click', verifyOTP);
    }
    
    // Resend OTP
    if (elements.resendOtpBtn) {
        elements.resendOtpBtn.addEventListener('click', resendOTP);
    }
    
    // Back to Form
    if (elements.backToFormBtn) {
        elements.backToFormBtn.addEventListener('click', backToForm);
    }
    
    // User Profile Click
    if (elements.userProfile) {
        elements.userProfile.addEventListener('click', handleUserProfileClick);
    }
}

// Setup Drag and Drop
function setupDragAndDrop() {
    if (!elements.uploadArea) return;
    
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
    if (!elements.filterBtns) return;
    
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
    // Check if user is logged in
    if (!state.currentUser && newFiles.length > 0) {
        showNotification('Please login or sign up to upload files', 'warning');
        openAuthModal('login');
        return;
    }
    
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
    if (!elements.fileList || !elements.selectedFiles) return;
    
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
    if (!elements.searchTools) return;
    
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
    // Check if user is logged in
    if (!state.currentUser) {
        showNotification('Please login to process files', 'warning');
        openAuthModal('login');
        return;
    }
    
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
    if (elements.processingModal) {
        elements.processingModal.classList.add('active');
        elements.currentTool.textContent = tool.name;
        elements.totalFiles.textContent = state.files.length;
        elements.estimatedTime.textContent = tool.time;
    }
    
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
    if (elements.processingModal) {
        elements.processingModal.classList.remove('active');
    }
    
    // Update result info
    const resultFile = {
        name: `processed-${tool.id}-${Date.now()}.pdf`,
        size: formatFileSize(Math.random() * 5000000 + 1000000), // 1-6MB
        pages: Math.floor(Math.random() * 50) + 1
    };
    
    if (elements.resultFileName) {
        elements.resultFileName.textContent = resultFile.name;
    }
    if (elements.resultFileSize) {
        elements.resultFileSize.textContent = resultFile.size;
    }
    if (elements.resultPageCount) {
        elements.resultPageCount.textContent = `${resultFile.pages} pages`;
    }
    
    // Show result modal
    setTimeout(() => {
        if (elements.resultModal) {
            elements.resultModal.classList.add('active');
        }
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
        a.download = elements.resultFileName ? elements.resultFileName.textContent : 'processed-file.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Cleanup
        URL.revokeObjectURL(url);
        
        // Close modal after download
        setTimeout(() => {
            if (elements.resultModal) {
                elements.resultModal.classList.remove('active');
            }
            showNotification('File downloaded successfully!', 'success');
        }, 1000);
        
    } catch (error) {
        console.error('Download error:', error);
        showNotification('Download failed. Please try again.', 'error');
    }
}

// Save to Cloud
function saveToCloud() {
    if (!state.currentUser) {
        showNotification('Please login to save to cloud', 'warning');
        return;
    }
    
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
            text: 'Check out this PDF I processed with swagchup',
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
    if (elements.processingModal) {
        elements.processingModal.classList.remove('active');
    }
    if (elements.resultModal) {
        elements.resultModal.classList.remove('active');
    }
}

// Authentication Functions
function openAuthModal(formType) {
    if (!elements.authModal) return;
    
    elements.authModal.classList.add('active');
    if (formType === 'login') {
        switchToTab('login');
    } else {
        switchToTab('signup');
    }
    clearAuthErrors();
}

function closeAuthModal() {
    if (!elements.authModal) return;
    
    elements.authModal.classList.remove('active');
    clearAuthErrors();
    hideOTPSection();
    stopOTPTimers();
}

function switchToTab(tab) {
    if (!elements.loginTab || !elements.signupTab || !elements.loginForm || !elements.signupForm) return;
    
    if (tab === 'login') {
        elements.loginTab.classList.add('active');
        elements.signupTab.classList.remove('active');
        elements.loginForm.classList.add('active');
        elements.signupForm.classList.remove('active');
    } else {
        elements.signupTab.classList.add('active');
        elements.loginTab.classList.remove('active');
        elements.signupForm.classList.add('active');
        elements.loginForm.classList.remove('active');
    }
    clearAuthErrors();
    hideOTPSection();
}

async function handleLogin() {
    if (!elements.loginEmail || !elements.loginPassword) return;
    
    clearAuthErrors();
    
    const email = elements.loginEmail.value.trim();
    const password = elements.loginPassword.value.trim();

    // Simple validation
    if (!email) {
        showAuthError('login-email-error', 'Email is required');
        return;
    }

    if (!password) {
        showAuthError('login-password-error', 'Password is required');
        return;
    }

    // Check if user exists
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        showAuthError('login-general-error', 'Invalid email or password');
        return;
    }
    
    // Show OTP verification
    await showOTPSection(email, 'login', user.name || 'User');
}

async function handleSignup() {
    if (!elements.signupName || !elements.signupEmail || !elements.signupPassword || !elements.confirmPassword || !elements.termsAgreement) return;
    
    clearAuthErrors();
    
    const name = elements.signupName.value.trim();
    const email = elements.signupEmail.value.trim();
    const password = elements.signupPassword.value.trim();
    const confirmPassword = elements.confirmPassword.value.trim();
    const termsAgreed = elements.termsAgreement.checked;

    // Validation
    if (!name) {
        showAuthError('signup-name-error', 'Name is required');
        return;
    }

    if (!email) {
        showAuthError('signup-email-error', 'Email is required');
        return;
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAuthError('signup-email-error', 'Please enter a valid email address');
        return;
    }

    if (!password) {
        showAuthError('signup-password-error', 'Password is required');
        return;
    }

    if (password.length < 6) {
        showAuthError('signup-password-error', 'Password must be at least 6 characters');
        return;
    }

    if (password !== confirmPassword) {
        showAuthError('confirm-password-error', 'Passwords do not match');
        return;
    }

    if (!termsAgreed) {
        showAuthError('terms-error', 'You must agree to the terms');
        return;
    }

    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.email === email)) {
        showAuthError('signup-email-error', 'Email already registered');
        return;
    }

    // Save pending user data
    const pendingUser = {
        name: name,
        email: email,
        password: password
    };
    localStorage.setItem('pendingUser', JSON.stringify(pendingUser));
    
    // Show OTP verification
    await showOTPSection(email, 'signup', name);
}

async function showOTPSection(email, type, userName = 'User') {
    if (!elements.loginForm || !elements.signupForm || !elements.otpSection || !elements.otpEmailDisplay) return;
    
    // Hide forms and show OTP section
    elements.loginForm.classList.remove('active');
    elements.signupForm.classList.remove('active');
    elements.otpSection.classList.add('active');
    
    // Set email display
    elements.otpEmailDisplay.textContent = email;
    
    // Store verification data
    state.pendingVerification = {
        email: email,
        type: type, // 'login' or 'signup'
        userName: userName
    };
    
    // Create OTP input fields
    createOTPInputs();
    
    // Start timers
    startOTPTimer();
    startResendTimer();
    
    // Send OTP via email
    try {
        const result = await otpService.sendEmailOTP(email, otpService.generateOTP(), userName);
        
        if (result.success) {
            showNotification(`OTP sent to ${email}. Please check your inbox.`, 'success');
            
            // For testing purposes, show OTP in console
            console.log(`[For Testing] OTP for ${email}: ${result.otp}`);
            console.log('Note: If email not received, check spam folder or use console OTP for testing.');
        } else {
            showAuthError('otp-error-message', 'Failed to send OTP. Please try again.');
        }
    } catch (error) {
        console.error('Error sending OTP:', error);
        showAuthError('otp-error-message', 'Error sending OTP. Please try again.');
    }
}

function hideOTPSection() {
    if (!elements.otpSection || !elements.loginForm) return;
    
    elements.otpSection.classList.remove('active');
    elements.loginForm.classList.add('active');
    clearOTPInputs();
    stopOTPTimers();
    state.pendingVerification = null;
}

function createOTPInputs() {
    if (!elements.otpInputContainer) return;
    
    elements.otpInputContainer.innerHTML = '';
    for (let i = 0; i < 6; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 1;
        input.className = 'otp-input';
        input.dataset.index = i;
        
        input.addEventListener('input', (e) => {
            const value = e.target.value.replace(/\D/g

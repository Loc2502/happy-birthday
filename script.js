function openGift() {
    document.getElementById('screen1').classList.add('hidden');
    document.getElementById('screen2').classList.remove('hidden');
}

let currentPhotoIndex = 0;
let photoInterval = null;

function openFeature(type) {
    document.getElementById(`popup-${type}`).classList.remove('hidden');
    if (type === 'photos') {
        photoInterval = setInterval(nextPhoto, 2500);
    }
    // Khi người dùng bấm mở ô bánh kem, kích hoạt hệ thống Micro dò tiếng thổi
    if (type === 'cake') {
        initMicrophone();
    }
}

function closePopup(type) {
    document.getElementById(`popup-${type}`).classList.add('hidden');
    if (type === 'photos' && photoInterval) {
        clearInterval(photoInterval);
    }
    if (type === 'music') {
        const bgVideo = document.getElementById('bg-video-music');
        if (bgVideo) {
            bgVideo.pause();
        }
    }
}

function updateGallery() {
    const photos = document.querySelectorAll('.flip-photo-item');
    photos.forEach((photo, idx) => {
        photo.className = 'flip-photo-item'; 
        if (idx === currentPhotoIndex) {
            photo.classList.add('active');
        } else if (idx < currentPhotoIndex) {
            photo.classList.add('passed');
        }
    });
}

function nextPhoto() {
    const photos = document.querySelectorAll('.flip-photo-item');
    if (currentPhotoIndex < photos.length - 1) {
        currentPhotoIndex++;
    } else {
        currentPhotoIndex = 0; 
    }
    updateGallery();
}

function prevPhoto() {
    const photos = document.querySelectorAll('.flip-photo-item');
    if (currentPhotoIndex > 0) {
        currentPhotoIndex--;
    } else {
        currentPhotoIndex = photos.length - 1; 
    }
    updateGallery();
}

// LOGIC ĐỒNG THỜI: THỔI BẰNG MICRO HOẶC CLICK CHUỘT
let isBlown = false;
let micStream = null; // Biến lưu trữ luồng mic để tắt khi thổi xong

// Cách 1: Click chuột trực tiếp vào vùng bánh kem
function forceBlowCandle() {
    if (!isBlown) blowCandleAction();
}

// Cách 2: Dò luồng âm thanh từ Micro thật
function initMicrophone() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function(stream) {
            micStream = stream; // Lưu luồng lại
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);
            const javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

            analyser.smoothingTimeConstant = 0.8;
            analyser.fftSize = 1024;

            microphone.connect(analyser);
            analyser.connect(javascriptNode);
            javascriptNode.connect(audioContext.destination);

            javascriptNode.onaudioprocess = function() {
                if (isBlown) return; // Nếu đã thổi bằng click trước đó thì dừng dò

                const array = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(array);
                let values = 0;

                for (let i = 0; i < array.length; i++) {
                    values += array[i];
                }

                const average = values / array.length;
                
                // Ngưỡng âm thanh thổi gió mạnh (> 65)
                if (average > 65) {
                    blowCandleAction();
                }
            };
        })
        .catch(function(err) {
            console.log("Thiết bị không hỗ trợ Micro hoặc bị chặn quyền, chuyển hẳn sang click chuột.");
        });
    }
}

// Hàm thực thi hành động dập nến chuyển màn hình chung
function blowCandleAction() {
    isBlown = true;

    // 1. Dập lửa nến
    document.getElementById('mainFlame').classList.add('blown');
    document.getElementById('cakeStatus').innerText = "Điều ước đang bay lên... ✨";
    document.getElementById('cake-back-btn').classList.add('hidden');

    // Tắt mic ngay để bảo mật và tiết kiệm tài nguyên
    if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
    }

    // 2. Phóng hiệu ứng pháo hoa, bóng bay, hoa hồng
    createConfettiEffect();
    startSurpriseRain();

    // 3. Sau 3.5 giây, dọn dẹp popup và mở bức thư tay cuối cùng
    setTimeout(() => {
        document.getElementById('popup-cake').classList.add('hidden');
        document.getElementById('screen2').classList.add('hidden');
        document.getElementById('screen-final').classList.remove('hidden');
    }, 3500);
}

function createConfettiEffect() {
    const colors = ['#ff477e', '#ffb703', '#72efdd', '#b5179e', '#4cc9f0', '#fff'];
    for (let i = 0; i < 60; i++) {
        const conf = document.createElement('div');
        conf.className = 'confetti';
        conf.style.background = colors[Math.floor(Math.random() * colors.length)];
        conf.style.left = '50%';
        conf.style.top = '50%';
        
        const angle = Math.random() * Math.PI * 2;
        const distance = 60 + Math.random() * 180;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance - 20;

        conf.style.setProperty('--x', `${x}px`);
        conf.style.setProperty('--y', `${y}px`);
        
        const size = 6 + Math.random() * 8;
        conf.style.width = `${size}px`;
        conf.style.height = `${size}px`;

        document.body.appendChild(conf);
        setTimeout(() => conf.remove(), 2000);
    }
}

function startSurpriseRain() {
    const elements = ['💐', '🎈', '🌸', '🎈', '🌹', '🎈'];
    let count = 0;
    
    const interval = setInterval(() => {
        if (count > 50) {
            clearInterval(interval);
            return;
        }

        const item = document.createElement('div');
        item.className = 'falling-element';
        item.innerHTML = elements[Math.floor(Math.random() * elements.length)];
        item.style.left = Math.random() * 95 + 'vw';
        
        const duration = 2.5 + Math.random() * 3; 
        const drift = -100 + Math.random() * 200; 
        const spin = 180 + Math.random() * 360; 
        
        item.style.setProperty('--duration', `${duration}s`);
        item.style.setProperty('--drift', `${drift}px`);
        item.style.setProperty('--spin', `${spin}deg`);
        item.style.transform = `scale(${0.8 + Math.random() * 0.6})`;

        document.body.appendChild(item);
        setTimeout(() => item.remove(), duration * 1000);
        count++;
    }, 60);
}
// ===== FIREBASE IMPORTS & INITIALIZATION =====
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs,
    serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAiIeO6KOGd8dB5JF0X7bOs5J4l8_8uKIM",
    authDomain: "ap-details-ca134.firebaseapp.com",
    projectId: "ap-details-ca134",
    storageBucket: "ap-details-ca134.firebasestorage.app",
    messagingSenderId: "316537522858",
    appId: "1:316537522858:web:3b7d70b4cf80099f511ed3",
    measurementId: "G-SLCY3R8048"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===== SERVICES DATA =====
const services = [
    {
        id: 'basic-wash',
        name: 'Basic Wash',
        price: 49,
        duration: '1 hour',
        description: 'Exterior wash, tire shine, and interior vacuum'
    },
    {
        id: 'premium-detail',
        name: 'Premium Detail',
        price: 149,
        duration: '3 hours',
        description: 'Full exterior & interior detail, wax, polish, and deep clean'
    },
    {
        id: 'ultimate-package',
        name: 'Ultimate Package',
        price: 299,
        duration: '5 hours',
        description: 'Complete detailing with ceramic coating, engine cleaning, and headlight restoration'
    },
    {
        id: 'interior-deep-clean',
        name: 'Interior Deep Clean',
        price: 99,
        duration: '2 hours',
        description: 'Shampooing, steam cleaning, leather conditioning, and odor removal'
    }
];

// ===== GLOBAL VARIABLES =====
let map;
let marker;
let currentLocation = {
    lat: 33.172384,
    lng: -96.713600
};
const centerLocation = { lat: 33.172384, lng: -96.713600 };
let selectedService = null;
let geocoder;

// ===== INITIALIZE APP =====
document.addEventListener('DOMContentLoaded', () => {
    renderServices();
    setMinDate();
    setupEventListeners();
});

// Wait for Google Maps API to load
window.initMap = initMap;

// ===== GOOGLE MAPS INITIALIZATION =====
function initMap() {
    // Initialize geocoder
    geocoder = new google.maps.Geocoder();
    
    // Create map centered at business location
    map = new google.maps.Map(document.getElementById('map'), {
        center: centerLocation,
        zoom: 12,
        styles: [
            {
                "elementType": "geometry",
                "stylers": [{ "color": "#212121" }]
            },
            {
                "elementType": "labels.icon",
                "stylers": [{ "visibility": "off" }]
            },
            {
                "elementType": "labels.text.fill",
                "stylers": [{ "color": "#757575" }]
            },
            {
                "elementType": "labels.text.stroke",
                "stylers": [{ "color": "#212121" }]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry",
                "stylers": [{ "color": "#757575" }]
            },
            {
                "featureType": "poi",
                "elementType": "labels.text.fill",
                "stylers": [{ "color": "#757575" }]
            },
            {
                "featureType": "road",
                "elementType": "geometry.fill",
                "stylers": [{ "color": "#2c2c2c" }]
            },
            {
                "featureType": "road",
                "elementType": "labels.text.fill",
                "stylers": [{ "color": "#8a8a8a" }]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [{ "color": "#000000" }]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [{ "color": "#3d3d3d" }]
            }
        ]
    });

    // Create marker
    marker = new google.maps.Marker({
        position: centerLocation,
        map: map,
        title: 'Service Location',
        animation: google.maps.Animation.DROP
    });

    // Add service area circle (50 mile radius)
    new google.maps.Circle({
        strokeColor: '#ff1493',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#ff1493',
        fillOpacity: 0.15,
        map: map,
        center: centerLocation,
        radius: 80467.2 // 50 miles in meters
    });
}

// Check if Google Maps API is already loaded
if (window.google && window.google.maps) {
    initMap();
}

// ===== RENDER SERVICES =====
function renderServices() {
    const servicesGrid = document.getElementById('servicesGrid');
    const serviceSelect = document.getElementById('serviceSelect');
    
    services.forEach(service => {
        // Create service card
        const card = document.createElement('div');
        card.className = 'service-card';
        card.dataset.serviceId = service.id;
        card.innerHTML = `
            <h3 class="service-name">${service.name}</h3>
            <div class="service-price">$${service.price}</div>
            <div class="service-duration">⏱️ ${service.duration}</div>
            <p class="service-description">${service.description}</p>
        `;
        
        card.addEventListener('click', () => selectService(service.id));
        servicesGrid.appendChild(card);
        
        // Add to select dropdown
        const option = document.createElement('option');
        option.value = service.id;
        option.textContent = `${service.name} - $${service.price} (${service.duration})`;
        serviceSelect.appendChild(option);
    });
}

// ===== SELECT SERVICE =====
function selectService(serviceId) {
    // Remove previous selection
    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selection to clicked card
    const selectedCard = document.querySelector(`[data-service-id="${serviceId}"]`);
    selectedCard.classList.add('selected');
    
    // Update select dropdown
    document.getElementById('serviceSelect').value = serviceId;
    selectedService = services.find(s => s.id === serviceId);
    
    // Scroll to booking form
    document.querySelector('.booking-section').scrollIntoView({ behavior: 'smooth' });
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Service select change
    document.getElementById('serviceSelect').addEventListener('change', (e) => {
        if (e.target.value) {
            selectService(e.target.value);
        }
    });
    
    // Use current location button
    document.getElementById('useCurrentLocation').addEventListener('click', requestUserLocation);
    
    // Address input
    document.getElementById('addressInput').addEventListener('change', geocodeAddress);
    
    // Form submission
    document.getElementById('bookingForm').addEventListener('submit', handleBookingSubmit);
}

// ===== SET MINIMUM DATE =====
function setMinDate() {
    const dateInput = document.getElementById('dateInput');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
}

// ===== REQUEST USER LOCATION =====
function requestUserLocation() {
    const statusDiv = document.getElementById('locationStatus');
    
    if (!navigator.geolocation) {
        showLocationStatus('Geolocation is not supported by your browser', 'error');
        return;
    }
    
    showLocationStatus('Getting your location...', 'warning');
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            
            // Check distance from center
            const distance = calculateDistance(
                centerLocation.lat, 
                centerLocation.lng, 
                userLat, 
                userLng
            );
            
            if (distance > 50) {
                showLocationStatus(`Location too far (${Math.round(distance)} miles from service area). We service within 50 miles of our location.`, 'error');
                return;
            }
            
            // Update location
            currentLocation = { lat: userLat, lng: userLng };
            updateMapLocation(currentLocation);
            showLocationStatus(`Location set! You are ${Math.round(distance)} miles from our center.`, 'success');
            
            // Reverse geocode to get address
            reverseGeocode(currentLocation);
        },
        (error) => {
            let message = 'Unable to get your location. ';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    message += 'Please allow location access.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    message += 'Location information unavailable.';
                    break;
                case error.TIMEOUT:
                    message += 'Location request timed out.';
                    break;
            }
            showLocationStatus(message, 'error');
        }
    );
}

// ===== GEOCODE ADDRESS =====
function geocodeAddress() {
    const address = document.getElementById('addressInput').value;
    
    if (!address || !geocoder) return;
    
    showLocationStatus('Finding address...', 'warning');
    
    geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            const lat = location.lat();
            const lng = location.lng();
            
            // Check distance
            const distance = calculateDistance(
                centerLocation.lat,
                centerLocation.lng,
                lat,
                lng
            );
            
            if (distance > 50) {
                showLocationStatus(`Location too far (${Math.round(distance)} miles). We service within 50 miles.`, 'error');
                document.getElementById('addressInput').value = '';
                return;
            }
            
            // Update location
            currentLocation = { lat, lng };
            updateMapLocation(currentLocation);
            showLocationStatus(`Address verified! ${Math.round(distance)} miles from our center.`, 'success');
        } else {
            showLocationStatus('Address not found. Please try a different address.', 'error');
        }
    });
}

// ===== REVERSE GEOCODE =====
function reverseGeocode(location) {
    if (!geocoder) return;
    
    geocoder.geocode({ location: location }, (results, status) => {
        if (status === 'OK' && results[0]) {
            document.getElementById('addressInput').value = results[0].formatted_address;
        }
    });
}

// ===== UPDATE MAP LOCATION =====
function updateMapLocation(location) {
    if (map && marker) {
        map.setCenter(location);
        marker.setPosition(location);
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(() => marker.setAnimation(null), 2000);
    }
}

// ===== SHOW LOCATION STATUS =====
function showLocationStatus(message, type) {
    const statusDiv = document.getElementById('locationStatus');
    statusDiv.textContent = message;
    statusDiv.className = `location-status ${type}`;
}

// ===== CALCULATE DISTANCE (Haversine formula) =====
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Radius of Earth in miles
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// ===== HANDLE BOOKING SUBMISSION =====
async function handleBookingSubmit(e) {
    e.preventDefault();
    
    // Clear previous messages
    hideMessages();
    
    // Validate form
    const formData = getFormData();
    
    if (!validateForm(formData)) {
        return;
    }
    
    // Show loading
    showLoading(true);
    
    try {
        // Check availability
        const isAvailable = await checkAvailability(formData.date, formData.time);
        
        if (!isAvailable) {
            showError('This time slot is already booked. Please select a different time.');
            showLoading(false);
            return;
        }
        
        // Create booking data
        const bookingData = {
            service: formData.service.name,
            serviceId: formData.service.id,
            price: formData.service.price,
            duration: formData.service.duration,
            date: formData.date,
            time: formData.time,
            name: formData.name,
            phone: formData.phone,
            notes: formData.notes,
            latitude: currentLocation.lat,
            longitude: currentLocation.lng,
            address: formData.address,
            createdAt: serverTimestamp()
        };
        
        // Save to Firestore
        await addDoc(collection(db, "bookings"), bookingData);
        
        // Show success message
        showSuccess(`Booking confirmed! We'll see you on ${formatDate(formData.date)} at ${formatTime(formData.time)}. We'll call ${formData.phone} to confirm.`);
        
        // Reset form
        setTimeout(() => {
            document.getElementById('bookingForm').reset();
            document.querySelectorAll('.service-card').forEach(card => {
                card.classList.remove('selected');
            });
            selectedService = null;
            hideMessages();
        }, 5000);
        
    } catch (error) {
        console.error('Booking error:', error);
        showError('Failed to create booking. Please try again or contact us directly.');
    } finally {
        showLoading(false);
    }
}

// ===== GET FORM DATA =====
function getFormData() {
    return {
        service: selectedService,
        date: document.getElementById('dateInput').value,
        time: document.getElementById('timeInput').value,
        name: document.getElementById('nameInput').value.trim(),
        phone: document.getElementById('phoneInput').value.trim(),
        notes: document.getElementById('notesInput').value.trim(),
        address: document.getElementById('addressInput').value.trim()
    };
}

// ===== VALIDATE FORM =====
function validateForm(formData) {
    // Check if service is selected
    if (!formData.service) {
        showError('Please select a service.');
        return false;
    }
    
    // Check if date is selected
    if (!formData.date) {
        showError('Please select a date.');
        return false;
    }
    
    // Check if date is not in the past
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        showError('Please select a future date.');
        return false;
    }
    
    // Check if time is selected
    if (!formData.time) {
        showError('Please select a time.');
        return false;
    }
    
    // Check name
    if (!formData.name || formData.name.length < 2) {
        showError('Please enter a valid name.');
        return false;
    }
    
    // Check phone
    const phoneRegex = /[\d\(\)\-\s]{10,}/;
    if (!formData.phone || !phoneRegex.test(formData.phone)) {
        showError('Please enter a valid phone number.');
        return false;
    }
    
    // Check address
    if (!formData.address) {
        showError('Please enter your address or use current location.');
        return false;
    }
    
    return true;
}

// ===== CHECK AVAILABILITY =====
async function checkAvailability(date, time) {
    try {
        const bookingsRef = collection(db, "bookings");
        const q = query(
            bookingsRef, 
            where("date", "==", date),
            where("time", "==", time)
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.empty; // Returns true if no conflicting bookings
    } catch (error) {
        console.error('Error checking availability:', error);
        // If there's an error checking, allow the booking but log it
        return true;
    }
}

// ===== UTILITY FUNCTIONS =====
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    const submitBtn = document.getElementById('submitBtn');
    
    if (show) {
        overlay.classList.add('show');
        submitBtn.disabled = true;
    } else {
        overlay.classList.remove('show');
        submitBtn.disabled = false;
    }
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
    
    // Scroll to error
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    successDiv.textContent = message;
    successDiv.classList.add('show');
    
    // Scroll to success
    successDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideMessages() {
    document.getElementById('errorMessage').classList.remove('show');
    document.getElementById('successMessage').classList.remove('show');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

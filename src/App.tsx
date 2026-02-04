import { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs,
    serverTimestamp 
} from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import './styles.css';

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

// Services data
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

const centerLocation = { lat: 33.172384, lng: -96.713600 };

export default function App() {
    const [selectedService, setSelectedService] = useState<any>(null);
    const [currentLocation, setCurrentLocation] = useState(centerLocation);
    const [formStep, setFormStep] = useState(1); // 1: service selection, 2: booking details
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        name: '',
        phone: '',
        email: '',
        notes: '',
        address: ''
    });
    const [locationStatus, setLocationStatus] = useState({ message: '', type: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const markerRef = useRef<google.maps.Marker | null>(null);
    const geocoderRef = useRef<google.maps.Geocoder | null>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const addressInputRef = useRef<HTMLInputElement>(null);

    // Initialize Google Maps
    useEffect(() => {
        const initMap = () => {
            if (!mapRef.current || !window.google) return;

            geocoderRef.current = new google.maps.Geocoder();

            mapInstanceRef.current = new google.maps.Map(mapRef.current, {
                center: centerLocation,
                zoom: 12,
                mapTypeControl: false, // Disable satellite view toggle
                streetViewControl: false, // Disable street view
                fullscreenControl: false, // Disable fullscreen
                clickableIcons: false, // Disable clicking on map icons
                gestureHandling: 'greedy', // Allow zooming and panning
                styles: [
                    { elementType: "geometry", stylers: [{ color: "#212121" }] },
                    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
                    { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
                    { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
                    { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
                    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
                    { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
                    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
                    { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
                    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] }
                ]
            });

            markerRef.current = new google.maps.Marker({
                position: centerLocation,
                map: mapInstanceRef.current,
                title: 'Service Location',
                animation: google.maps.Animation.DROP,
                draggable: false,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 12,
                    fillColor: '#ff1493',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 3,
                }
            });
            
            // Initialize Google Places Autocomplete on address input
            if (addressInputRef.current) {
                autocompleteRef.current = new google.maps.places.Autocomplete(addressInputRef.current, {
                    componentRestrictions: { country: 'us' },
                    fields: ['formatted_address', 'geometry']
                });

                // Listen for place selection from autocomplete
                autocompleteRef.current.addListener('place_changed', () => {
                    const place = autocompleteRef.current?.getPlace();
                    
                    if (place && place.geometry && place.geometry.location) {
                        const lat = place.geometry.location.lat();
                        const lng = place.geometry.location.lng();
                        const distance = calculateDistance(centerLocation.lat, centerLocation.lng, lat, lng);

                        if (distance > 50) {
                            setLocationStatus({ 
                                message: `Location too far (${Math.round(distance)} miles). We service within 50 miles.`, 
                                type: 'error' 
                            });
                            setFormData(prev => ({ ...prev, address: '' }));
                            return;
                        }

                        const newLocation = { lat, lng };
                        setCurrentLocation(newLocation);
                        updateMapLocation(newLocation);
                        setLocationStatus({ 
                            message: `Address verified! ${Math.round(distance)} miles from our center.`, 
                            type: 'success' 
                        });
                        
                        if (place.formatted_address) {
                            setFormData(prev => ({ ...prev, address: place.formatted_address! }));
                        }
                    }
                });
            }
            
            // Prevent clicking on map to place marker - map is read-only except for pan/zoom
        };

        if (window.google && window.google.maps) {
            initMap();
        } else {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAxB2l_nyQR0aitOR9H8JHAEzmFkThFU48&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = initMap;
            document.head.appendChild(script);
        }
    }, []);

    // Set minimum date
    const today = new Date().toISOString().split('T')[0];

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 3959;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const updateMapLocation = (location: { lat: number; lng: number }) => {
        if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setCenter(location);
            markerRef.current.setPosition(location);
            markerRef.current.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(() => markerRef.current?.setAnimation(null), 2000);
        }
    };

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            setLocationStatus({ message: 'Geolocation is not supported by your browser', type: 'error' });
            return;
        }

        setLocationStatus({ message: 'Getting your location...', type: 'warning' });

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                const distance = calculateDistance(centerLocation.lat, centerLocation.lng, userLat, userLng);

                if (distance > 50) {
                    setLocationStatus({ 
                        message: `Location too far (${Math.round(distance)} miles from service area). We service within 50 miles of our location.`, 
                        type: 'error' 
                    });
                    return;
                }

                const newLocation = { lat: userLat, lng: userLng };
                setCurrentLocation(newLocation);
                updateMapLocation(newLocation);
                setLocationStatus({ 
                    message: `Location set! You are ${Math.round(distance)} miles from our center.`, 
                    type: 'success' 
                });

                if (geocoderRef.current) {
                    geocoderRef.current.geocode({ location: newLocation }, (results, status) => {
                        if (status === 'OK' && results && results[0]) {
                            setFormData(prev => ({ ...prev, address: results[0].formatted_address }));
                        }
                    });
                }
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
                setLocationStatus({ message, type: 'error' });
            }
        );
    };

    const handleAddressChange = (address: string) => {
        setFormData(prev => ({ ...prev, address }));
        
        if (!address || !geocoderRef.current) return;

        setLocationStatus({ message: 'Finding address...', type: 'warning' });

        geocoderRef.current.geocode({ address }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
                const location = results[0].geometry.location;
                const lat = location.lat();
                const lng = location.lng();
                const distance = calculateDistance(centerLocation.lat, centerLocation.lng, lat, lng);

                if (distance > 50) {
                    setLocationStatus({ 
                        message: `Location too far (${Math.round(distance)} miles). We service within 50 miles.`, 
                        type: 'error' 
                    });
                    setFormData(prev => ({ ...prev, address: '' }));
                    return;
                }

                const newLocation = { lat, lng };
                setCurrentLocation(newLocation);
                updateMapLocation(newLocation);
                setLocationStatus({ 
                    message: `Address verified! ${Math.round(distance)} miles from our center.`, 
                    type: 'success' 
                });
            } else {
                setLocationStatus({ message: 'Address not found. Please try a different address.', type: 'error' });
            }
        });
    };

    const checkAvailability = async (date: string, time: string) => {
        try {
            const bookingsRef = collection(db, "bookings");
            const q = query(
                bookingsRef, 
                where("appointmentDate", "==", date), 
                where("appointmentTime", "==", time),
                where("status", "!=", "cancelled")
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.empty;
        } catch (error) {
            console.error('Error checking availability:', error);
            return true;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (!selectedService) {
            setErrorMessage('Please select a service.');
            return;
        }

        if (!formData.address) {
            setErrorMessage('Please enter your address or use current location.');
            return;
        }

        const phoneRegex = /[\d\(\)\-\s]{10,}/;
        if (!phoneRegex.test(formData.phone)) {
            setErrorMessage('Please enter a valid phone number.');
            return;
        }

        setIsLoading(true);

        try {
            const isAvailable = await checkAvailability(formData.date, formData.time);

            if (!isAvailable) {
                setErrorMessage('This time slot is already booked. Please select a different time.');
                setIsLoading(false);
                return;
            }

            const bookingData = {
                // Service Information
                service: selectedService.name,
                serviceId: selectedService.id,
                servicePrice: selectedService.price,
                serviceDuration: selectedService.duration,
                serviceDescription: selectedService.description,
                
                // Appointment Details
                appointmentDate: formData.date,
                appointmentTime: formData.time,
                
                // Customer Information
                customerName: formData.name,
                customerPhone: formData.phone,
                customerEmail: formData.email || '',
                
                // Location Details
                serviceAddress: formData.address,
                locationLatitude: currentLocation.lat,
                locationLongitude: currentLocation.lng,
                distanceFromCenter: calculateDistance(
                    centerLocation.lat,
                    centerLocation.lng,
                    currentLocation.lat,
                    currentLocation.lng
                ),
                
                // Additional Information
                specialRequests: formData.notes,
                
                // Booking Status
                status: 'pending', // pending, confirmed, in-progress, completed, cancelled
                paymentStatus: 'unpaid', // unpaid, paid, refunded
                
                // Timestamps
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                
                // Metadata
                bookingSource: 'web',
                version: '1.0'
            };

            await addDoc(collection(db, "bookings"), bookingData);

            const formatDate = (dateString: string) => {
                const date = new Date(dateString);
                return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            };

            const formatTime = (time: string) => {
                const [hours, minutes] = time.split(':');
                const hour = parseInt(hours);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const displayHour = hour % 12 || 12;
                return `${displayHour}:${minutes} ${ampm}`;
            };

            setSuccessMessage(`Booking confirmed! We'll see you on ${formatDate(formData.date)} at ${formatTime(formData.time)}. We'll call ${formData.phone} to confirm.`);

            setTimeout(() => {
                setFormData({ date: '', time: '', name: '', phone: '', email: '', notes: '', address: '' });
                setSelectedService(null);
                setErrorMessage('');
                setSuccessMessage('');
            }, 5000);

        } catch (error) {
            console.error('Booking error:', error);
            setErrorMessage('Failed to create booking. Please try again or contact us directly.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="app">
            {/* Hero Section */}
            <header className="hero">
                <div className="container">
                    <h1 className="hero-title">AP Details</h1>
                    <p className="hero-subtitle">Premium Mobile Detailing at Your Location</p>
                </div>
            </header>

            {/* Booking Section - No separate services section */}
            <section className="booking-section">
                {/* Split Layout: Map Left, Form Right */}
                <div className="booking-layout">
                    {/* Left Side - Map */}
                    <div className="map-side">
                        <div ref={mapRef} className="map-container"></div>
                        {locationStatus.message && (
                            <div className={`location-status ${locationStatus.type}`}>
                                {locationStatus.message}
                            </div>
                        )}
                    </div>

                    {/* Right Side - Multi-Step Form */}
                    <div className="form-side">
                        <form onSubmit={handleSubmit} className="booking-form">
                            {/* Step 1: Service Selection */}
                            {formStep === 1 && (
                                <>
                                    <h3 className="form-title">Select Your Service</h3>
                                    <p className="form-subtitle">Choose the detailing package that's right for you</p>
                                    
                                    <div className="services-grid-form">
                                        {services.map(service => (
                                            <div
                                                key={service.id}
                                                className={`service-card-form ${selectedService?.id === service.id ? 'selected' : ''}`}
                                                onClick={() => setSelectedService(service)}
                                            >
                                                <h4 className="service-name-form">{service.name}</h4>
                                                <div className="service-price-form">${service.price}</div>
                                                <div className="service-duration-form">{service.duration}</div>
                                                <p className="service-description-form">{service.description}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {errorMessage && (
                                        <div className="error-message show">{errorMessage}</div>
                                    )}

                                    <button 
                                        type="button" 
                                        className="btn-primary" 
                                        onClick={() => {
                                            if (!selectedService) {
                                                setErrorMessage('Please select a service to continue.');
                                                return;
                                            }
                                            setErrorMessage('');
                                            setFormStep(2);
                                        }}
                                    >
                                        Continue to Booking
                                    </button>
                                </>
                            )}

                            {/* Step 2: Booking Details */}
                            {formStep === 2 && (
                                <>
                                    <div className="form-header-with-back">
                                        <button 
                                            type="button" 
                                            className="btn-back" 
                                            onClick={() => setFormStep(1)}
                                        >
                                            ← Back
                                        </button>
                                        <h3 className="form-title">Booking Details</h3>
                                    </div>

                                    {selectedService && (
                                        <div className="selected-service-summary">
                                            <strong>{selectedService.name}</strong> - ${selectedService.price}
                                        </div>
                                    )}
                                    
                                    {/* Location Input */}
                                    <div className="input-group">
                                        <label htmlFor="addressInput">Service Address</label>
                                        <input
                                            type="text"
                                            id="addressInput"
                                            placeholder="Enter your address"
                                            className="form-input"
                                            value={formData.address}
                                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                            onBlur={(e) => handleAddressChange(e.target.value)}
                                            ref={addressInputRef}
                                        />
                                    </div>

                                    <button onClick={handleUseCurrentLocation} className="btn-secondary" type="button">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                                            <circle cx="12" cy="12" r="3"/>
                                        </svg>
                                        Use Current Location
                                    </button>

                                    <div className="form-divider"></div>

                                    <div className="form-row-two">
                                        <div className="input-group">
                                            <label htmlFor="dateInput">Date</label>
                                            <input
                                                type="date"
                                                id="dateInput"
                                                className="form-input"
                                                min={today}
                                                value={formData.date}
                                                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label htmlFor="timeInput">Time</label>
                                            <select
                                                id="timeInput"
                                                className="form-input"
                                                value={formData.time}
                                                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                                                required
                                            >
                                                <option value="">Select time</option>
                                                {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(time => (
                                                    <option key={time} value={time}>
                                                        {time.split(':')[0] > '12' ? `${parseInt(time.split(':')[0]) - 12}:00 PM` : `${time} ${time.split(':')[0] === '12' ? 'PM' : 'AM'}`}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-row-two">
                                        <div className="input-group">
                                            <label htmlFor="nameInput">Full Name</label>
                                            <input
                                                type="text"
                                                id="nameInput"
                                                className="form-input"
                                                placeholder="John Doe"
                                                value={formData.name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label htmlFor="phoneInput">Phone Number</label>
                                            <input
                                                type="tel"
                                                id="phoneInput"
                                                className="form-input"
                                                placeholder="(555) 123-4567"
                                                value={formData.phone}
                                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="input-group">
                                        <label htmlFor="emailInput">Email (Optional)</label>
                                        <input
                                            type="email"
                                            id="emailInput"
                                            className="form-input"
                                            placeholder="john.doe@example.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        />
                                    </div>

                                    <div className="input-group">
                                        <label htmlFor="notesInput">Additional Notes (Optional)</label>
                                        <textarea
                                            id="notesInput"
                                            className="form-input"
                                            rows={4}
                                            placeholder="Special requests, vehicle details, etc."
                                            value={formData.notes}
                                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                        />
                                    </div>

                                    {errorMessage && (
                                        <div className="error-message show">{errorMessage}</div>
                                    )}
                                    {successMessage && (
                                        <div className="success-message show">{successMessage}</div>
                                    )}

                                    <button type="submit" className="btn-primary" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="spinner-icon" />
                                                Processing...
                                            </>
                                        ) : (
                                            'Book Appointment'
                                        )}
                                    </button>
                                </>
                            )}
                        </form>
                    </div>
                </div>
            </section>

            {/* Loading Overlay */}
            {isLoading && (
                <div className="loading-overlay show">
                    <div className="spinner"></div>
                </div>
            )}
        </div>
    );
}
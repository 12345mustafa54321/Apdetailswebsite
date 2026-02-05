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
import { Loader2, MapPin, Calendar, Clock, User, Phone, Mail, MessageSquare } from 'lucide-react';
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
    const [selectedService, setSelectedService] = useState<any>(services[0]); // Pre-select Basic Wash
    const [currentLocation, setCurrentLocation] = useState(centerLocation);
    const [formStep, setFormStep] = useState(1);
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
    const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
    const geocoderRef = useRef<google.maps.Geocoder | null>(null);
    const placeAutocompleteRef = useRef<HTMLElement | null>(null);
    const addressInputRef = useRef<HTMLInputElement>(null);

    // Initialize Google Maps
    useEffect(() => {
        const initMap = async () => {
            if (!mapRef.current || !window.google?.maps) return;

            try {
                const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
                const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
                const { Geocoder } = await google.maps.importLibrary("geocoding") as google.maps.GeocodingLibrary;

                geocoderRef.current = new Geocoder();

                mapInstanceRef.current = new Map(mapRef.current, {
                    center: centerLocation,
                    zoom: 12,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                    clickableIcons: false,
                    gestureHandling: 'greedy',
                    mapId: 'AP_DETAILS_MAP', // Required for AdvancedMarkerElement
                    styles: [
                        { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
                        { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
                        { elementType: "labels.text.fill", stylers: [{ color: "#666666" }] },
                        { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
                        { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#e0e0e0" }] },
                        { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#999999" }] },
                        { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#ffffff" }] },
                        { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#999999" }] },
                        { featureType: "water", elementType: "geometry", stylers: [{ color: "#e8e8e8" }] },
                        { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#999999" }] }
                    ]
                });

                // Create custom marker element
                const markerElement = document.createElement('div');
                markerElement.style.width = '20px';
                markerElement.style.height = '20px';
                markerElement.style.borderRadius = '50%';
                markerElement.style.backgroundColor = '#ff6b9d';
                markerElement.style.border = '2px solid #ffffff';
                markerElement.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';

                markerRef.current = new AdvancedMarkerElement({
                    map: mapInstanceRef.current,
                    position: centerLocation,
                    content: markerElement,
                    title: 'Service Location'
                });
                
                // Initialize Place Autocomplete Element
                if (addressInputRef.current) {
                    const { PlaceAutocompleteElement } = await google.maps.importLibrary("places") as google.maps.PlacesLibrary;
                    
                    const placeAutocomplete = new PlaceAutocompleteElement({
                        componentRestrictions: { country: 'us' }
                    });
                    
                    placeAutocomplete.addEventListener('gmp-placeselect', async (event: any) => {
                        const place = event.place;
                        
                        if (place && place.location) {
                            const lat = place.location.lat();
                            const lng = place.location.lng();
                            const distance = calculateDistance(centerLocation.lat, centerLocation.lng, lat, lng);

                            if (distance > 50) {
                                setLocationStatus({ 
                                    message: `Location is ${Math.round(distance)} miles away. We service within 50 miles.`, 
                                    type: 'error' 
                                });
                                setFormData(prev => ({ ...prev, address: '' }));
                                return;
                            }

                            const newLocation = { lat, lng };
                            setCurrentLocation(newLocation);
                            updateMapLocation(newLocation);
                            setLocationStatus({ 
                                message: `Perfect! ${Math.round(distance)} miles from our center.`, 
                                type: 'success' 
                            });
                            
                            if (place.formattedAddress) {
                                setFormData(prev => ({ ...prev, address: place.formattedAddress! }));
                                if (addressInputRef.current) {
                                    addressInputRef.current.value = place.formattedAddress;
                                }
                            }
                        }
                    });

                    // Style the autocomplete element
                    placeAutocomplete.style.width = '100%';
                    placeAutocomplete.style.zIndex = '1';
                    placeAutocomplete.style.position = 'relative';
                    
                    // Replace input with autocomplete element
                    const container = addressInputRef.current.parentElement;
                    if (container) {
                        addressInputRef.current.style.display = 'none';
                        container.insertBefore(placeAutocomplete, addressInputRef.current);
                        placeAutocompleteRef.current = placeAutocomplete;
                    }
                }
            } catch (error) {
                console.error('Error initializing Google Maps:', error);
            }
        };

        if (window.google?.maps?.importLibrary) {
            initMap();
        } else {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAxB2l_nyQR0aitOR9H8JHAEzmFkThFU48&libraries=places&loading=async&callback=Function.prototype`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
                // Wait a bit for Google Maps to fully initialize
                setTimeout(() => initMap(), 100);
            };
            document.head.appendChild(script);
        }
    }, []);

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
                        message: `You're ${Math.round(distance)} miles away. We service within 50 miles.`, 
                        type: 'error' 
                    });
                    return;
                }

                const newLocation = { lat: userLat, lng: userLng };
                setCurrentLocation(newLocation);
                updateMapLocation(newLocation);
                setLocationStatus({ 
                    message: `Perfect! You are ${Math.round(distance)} miles from our center.`, 
                    type: 'success' 
                });

                if (geocoderRef.current) {
                    geocoderRef.current.geocode({ location: newLocation }, (results, status) => {
                        if (status === 'OK' && results && results[0]) {
                            setFormData(prev => ({ ...prev, address: results[0].formatted_address }));
                            if (addressInputRef.current) {
                                addressInputRef.current.value = results[0].formatted_address;
                            }
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
                        message: `Location is ${Math.round(distance)} miles away. We service within 50 miles.`, 
                        type: 'error' 
                    });
                    setFormData(prev => ({ ...prev, address: '' }));
                    return;
                }

                const newLocation = { lat, lng };
                setCurrentLocation(newLocation);
                updateMapLocation(newLocation);
                setLocationStatus({ 
                    message: `Perfect! ${Math.round(distance)} miles from our center.`, 
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
                service: selectedService.name,
                serviceId: selectedService.id,
                servicePrice: selectedService.price,
                serviceDuration: selectedService.duration,
                serviceDescription: selectedService.description,
                appointmentDate: formData.date,
                appointmentTime: formData.time,
                customerName: formData.name,
                customerPhone: formData.phone,
                customerEmail: formData.email || '',
                serviceAddress: formData.address,
                locationLatitude: currentLocation.lat,
                locationLongitude: currentLocation.lng,
                distanceFromCenter: calculateDistance(
                    centerLocation.lat,
                    centerLocation.lng,
                    currentLocation.lat,
                    currentLocation.lng
                ),
                specialRequests: formData.notes,
                status: 'pending',
                paymentStatus: 'unpaid',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
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

            setSuccessMessage(`Booking confirmed! We'll see you on ${formatDate(formData.date)} at ${formatTime(formData.time)}.`);

            setTimeout(() => {
                setFormData({ date: '', time: '', name: '', phone: '', email: '', notes: '', address: '' });
                setSelectedService(null);
                setFormStep(1);
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
            {/* Navigation */}
            <nav className="nav">
                <div className="nav-content">
                    <div className="nav-logo">AP Details</div>
                    <div className="nav-links">
                        <a href="#services">Services</a>
                        <a href="#contact">Contact Us</a>
                        <a href="#booking" className="nav-link-accent">Book Now</a>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <div className="trust-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        Trusted by over 70 clients
                    </div>
                    {/* Desktop: Logo/Text */}
                    <h1 className="hero-title">
                        Premium mobile detailing<br />
                        at <span className="text-accent">your location</span>
                    </h1>
                    {/* Mobile: Same text */}
                    <h1 className="hero-title hero-title-mobile">
                        Premium mobile detailing<br />
                        at <span className="text-accent">your location</span>
                    </h1>
                    <p className="hero-subtitle">
                        Professional car care that comes to you. Servicing within 50 miles.
                    </p>
                </div>
            </section>

            {/* Services Section */}
            <section className="services" id="services">
                <div className="services-intro">
                    <h2 className="section-heading">Choose your <span className="text-accent">service</span></h2>
                    <p className="section-subheading">Select the package that's right for your vehicle</p>
                </div>
                
                <div className="services-list">
                    {services.map((service, index) => (
                        <div 
                            key={service.id} 
                            className={`service-item ${selectedService?.id === service.id ? 'selected' : ''}`}
                            onClick={() => {
                                setSelectedService(service);
                                setFormStep(1);
                            }}
                        >
                            <div className="service-header">
                                <span className="service-number">{String(index + 1).padStart(2, '0')}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <h3 className="service-name">{service.name}</h3>
                                        {service.id === 'ultimate-package' && (
                                            <span className="best-deal-badge">Best deal</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="service-details">
                                <span className="service-price">${service.price}</span>
                                <span className="service-duration">{service.duration}</span>
                            </div>
                            <p className="service-description">{service.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Booking Section with Map */}
            <section className="booking-section" id="booking">
                <div className="booking-container">
                    {/* Form on the LEFT */}
                    <div className="booking-form-wrapper">
                        <form onSubmit={handleSubmit} className="booking-form">
                            {formStep === 1 && (
                                <>
                                    <div className="form-header">
                                        <h2 className="form-title text-[rgb(255,255,255)]">Book your <span className="text-accent">appointment</span></h2>
                                        {selectedService && (
                                            <div className="selected-service">
                                                <span className="selected-label">Selected:</span>
                                                <span className="selected-name">{selectedService.name}</span>
                                                <span className="selected-price">${selectedService.price}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label text-[rgb(255,255,255)]">
                                            <MapPin size={18} />
                                            Service address
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter your address"
                                            className="form-input"
                                            value={formData.address}
                                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                            onBlur={(e) => handleAddressChange(e.target.value)}
                                            ref={addressInputRef}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={handleUseCurrentLocation} 
                                            className="location-btn"
                                        >
                                            Use my current location
                                        </button>
                                        {locationStatus.message && (
                                            <div className={`location-status ${locationStatus.type}`}>
                                                {locationStatus.message}
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label text-[rgb(255,255,255)]">
                                                <Calendar size={18} />
                                                Date
                                            </label>
                                            <input
                                                type="date"
                                                className="form-input"
                                                min={today}
                                                value={formData.date}
                                                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label text-[rgb(255,255,255)]">
                                                <Clock size={18} />
                                                Time
                                            </label>
                                            <select
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

                                    <button 
                                        type="button" 
                                        className="btn-primary" 
                                        onClick={() => {
                                            if (!selectedService) {
                                                setErrorMessage('Please select a service first.');
                                                return;
                                            }
                                            if (!formData.address || !formData.date || !formData.time) {
                                                setErrorMessage('Please fill in all required fields.');
                                                return;
                                            }
                                            setErrorMessage('');
                                            setFormStep(2);
                                        }}
                                    >
                                        Continue
                                    </button>

                                    {errorMessage && (
                                        <div className="error-message">{errorMessage}</div>
                                    )}
                                </>
                            )}

                            {formStep === 2 && (
                                <>
                                    <div className="form-header">
                                        <button 
                                            type="button" 
                                            className="back-btn" 
                                            onClick={() => setFormStep(1)}
                                        >
                                            ← Back
                                        </button>
                                        <h2 className="form-title">Your <span className="text-accent">details</span></h2>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">
                                                <User size={18} />
                                                Full name
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="John Doe"
                                                className="form-input"
                                                value={formData.name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">
                                                <Phone size={18} />
                                                Phone number
                                            </label>
                                            <input
                                                type="tel"
                                                placeholder="(555) 123-4567"
                                                className="form-input"
                                                value={formData.phone}
                                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            <Mail size={18} />
                                            Email <span className="optional">(optional)</span>
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="john@example.com"
                                            className="form-input"
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            <MessageSquare size={18} />
                                            Special requests <span className="optional">(optional)</span>
                                        </label>
                                        <textarea
                                            rows={4}
                                            placeholder="Any specific requests or vehicle details..."
                                            className="form-input"
                                            value={formData.notes}
                                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                        />
                                    </div>

                                    {errorMessage && (
                                        <div className="error-message">{errorMessage}</div>
                                    )}
                                    {successMessage && (
                                        <div className="success-message">{successMessage}</div>
                                    )}

                                    <button type="submit" className="btn-primary" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="spinner" size={20} />
                                                Processing...
                                            </>
                                        ) : (
                                            'Confirm booking'
                                        )}
                                    </button>
                                </>
                            )}
                        </form>
                    </div>

                    {/* Map on the RIGHT - Full Width */}
                    <div className="map-wrapper">
                        <div ref={mapRef} className="map"></div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer" id="contact">
                <div className="footer-content">
                    <div className="footer-brand">
                        <h3 className="footer-logo">AP Details</h3>
                        <p className="footer-tagline">Premium mobile detailing</p>
                    </div>
                    <div className="footer-social">
                        <a 
                            href="https://www.instagram.com/ap.details.ntx/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="social-link"
                            aria-label="Follow us on Instagram"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                        </a>
                        <a 
                            href="https://www.tiktok.com/@ap.details.ntx" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="social-link"
                            aria-label="Follow us on TikTok"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                            </svg>
                        </a>
                    </div>
                    <p className="footer-copyright">© 2026 AP Details. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
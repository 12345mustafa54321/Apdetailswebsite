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
import heroLogo from 'figma:asset/8ac00dbb913d177c7d2a825d140dd19b9b5b29e2.png';
import faviconLogo from 'figma:asset/e5204a642a70c248c8ecda621f114752fa1a9498.png';

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
    const [isAppLoading, setIsAppLoading] = useState(true);
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
    const [submissionSuccess, setSubmissionSuccess] = useState(false);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const markerRef = useRef<google.maps.Marker | null>(null);
    const geocoderRef = useRef<google.maps.Geocoder | null>(null);
    const placeAutocompleteRef = useRef<HTMLElement | null>(null);
    const addressInputRef = useRef<HTMLInputElement>(null);

    // Set favicon and page title
    useEffect(() => {
        // Set page title
        document.title = 'AP Details | North Texas';
        
        // Set favicon
        const favicon = document.querySelector('#favicon-placeholder') as HTMLLinkElement;
        const appleIcon = document.querySelector('#apple-touch-icon-placeholder') as HTMLLinkElement;
        if (favicon) {
            favicon.href = faviconLogo;
        }
        if (appleIcon) {
            appleIcon.href = faviconLogo;
        }
    }, []);

    // Loading screen
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsAppLoading(false);
        }, 1500); // 1.5 seconds loading time

        return () => clearTimeout(timer);
    }, []);

    // Initialize Google Maps - only after loading screen is done
    useEffect(() => {
        if (isAppLoading) return; // Don't initialize until loading is done

        const initMap = async () => {
            console.log('Initializing map...');
            console.log('Map ref exists:', !!mapRef.current);
            console.log('Google maps exists:', !!window.google?.maps);

            if (!mapRef.current) {
                console.error('Map ref not ready');
                return;
            }

            if (!window.google?.maps) {
                console.error('Google Maps not loaded');
                return;
            }

            try {
                console.log('Loading Google Maps libraries...');
                const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
                const { Marker } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
                const { Geocoder } = await google.maps.importLibrary("geocoding") as google.maps.GeocodingLibrary;

                console.log('Libraries loaded, creating geocoder...');
                geocoderRef.current = new Geocoder();

                console.log('Creating map instance...');
                mapInstanceRef.current = new Map(mapRef.current, {
                    center: centerLocation,
                    zoom: 12,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                    clickableIcons: false,
                    gestureHandling: 'greedy',
                    mapTypeId: 'roadmap'
                });

                console.log('Map created, adding marker...');
                // Create classic marker with custom icon
                markerRef.current = new Marker({
                    map: mapInstanceRef.current,
                    position: centerLocation,
                    title: 'Service Location',
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: '#ff6b9d',
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 2
                    }
                });

                console.log('Marker added successfully!');
                
                // Initialize Place Autocomplete Element
                if (addressInputRef.current) {
                    console.log('Setting up autocomplete...');
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
                                console.log('Setting address from place select:', place.formattedAddress);
                                setFormData(prev => ({ ...prev, address: place.formattedAddress! }));
                                if (addressInputRef.current) {
                                    addressInputRef.current.value = place.formattedAddress;
                                }
                            }
                        }
                    });

                    // Listen for any input changes to capture manually typed addresses
                    placeAutocomplete.addEventListener('input', (event: any) => {
                        const inputValue = event.target?.value || '';
                        console.log('Address input changed:', inputValue);
                        setFormData(prev => ({ ...prev, address: inputValue }));
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

                    console.log('Autocomplete setup complete');
                }
            } catch (error) {
                console.error('Error initializing Google Maps:', error);
            }
        };

        // Load Google Maps script if not already loaded
        if (!window.google?.maps) {
            console.log('Loading Google Maps script...');
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAxB2l_nyQR0aitOR9H8JHAEzmFkThFU48&libraries=places,geocoding,marker&loading=async`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
                console.log('Google Maps script loaded');
                // Wait a bit for Google Maps to fully initialize
                setTimeout(() => initMap(), 300);
            };
            script.onerror = () => {
                console.error('Failed to load Google Maps script');
            };
            document.head.appendChild(script);
        } else {
            console.log('Google Maps already loaded, initializing...');
            // Give the DOM a moment to render the map div
            setTimeout(() => initMap(), 100);
        }
    }, [isAppLoading]); // Only run when loading screen finishes

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
        setIsLoadingLocation(true);

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
                    setIsLoadingLocation(false);
                    return;
                }

                const newLocation = { lat: userLat, lng: userLng };
                setCurrentLocation(newLocation);
                updateMapLocation(newLocation);
                setLocationStatus({ 
                    message: `Perfect! You are ${Math.round(distance)} miles from our center.`, 
                    type: 'success' 
                });
                setIsLoadingLocation(false);

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
                setIsLoadingLocation(false);
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
            // Simplified query to avoid composite index requirement
            // We'll filter cancelled bookings in memory instead
            const q = query(
                bookingsRef, 
                where("appointmentDate", "==", date), 
                where("appointmentTime", "==", time)
            );
            const querySnapshot = await getDocs(q);
            
            // Filter out cancelled bookings in memory
            const activeBookings = querySnapshot.docs.filter(doc => doc.data().status !== 'cancelled');
            return activeBookings.length === 0;
        } catch (error) {
            console.error('Error checking availability:', error);
            return true; // Allow booking if there's an error checking availability
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
                setSubmissionSuccess(true);
            }, 5000);

        } catch (error) {
            console.error('Booking error:', error);
            setErrorMessage('Failed to create booking. Please try again or contact us directly.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Loading Screen */}
            {isAppLoading && (
                <div className="loading-screen">
                    <div className="loading-content">
                        <h1 className="loading-title">AP DETAILS</h1>
                        <p className="loading-subtitle">The best detailing in North Texas</p>
                    </div>
                </div>
            )}

            {!isAppLoading && (
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
                    <button 
                        type="button"
                        className="mobile-menu-toggle"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 6h16M4 12h16M4 18h16"/>
                        </svg>
                    </button>
                </div>
                {isMobileMenuOpen && (
                    <div className="mobile-menu">
                        <a href="#services" onClick={() => setIsMobileMenuOpen(false)}>Services</a>
                        <a href="#contact" onClick={() => setIsMobileMenuOpen(false)}>Contact Us</a>
                        <a href="#booking" className="nav-link-accent" onClick={() => setIsMobileMenuOpen(false)}>Book Now</a>
                    </div>
                )}
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
                    {/* Logo Image for both Desktop and Mobile */}
                    <img src={heroLogo} alt="AP Details Car Services" className="hero-logo-img" />
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
                        <div className="booking-form">
                            {!submissionSuccess ? (
                                <>
                                    {formStep === 1 && (
                                        <>
                                            <div className="form-header">
                                                <div className="form-step-indicator">
                                                    <div className="step-dots">
                                                        <div className="step-dot active"></div>
                                                        <div className="step-dot"></div>
                                                    </div>
                                                    <span className="step-text">Step 1 of 2</span>
                                                </div>
                                                <h2 className="form-title">Let's plan your<br/>perfect detail</h2>
                                                {selectedService && (
                                                    <div className="selected-service-card">
                                                        <div className="service-card-content">
                                                            <span className="service-card-name">{selectedService.name}</span>
                                                            <span className="service-card-price">${selectedService.price}</span>
                                                        </div>
                                                        <button 
                                                            type="button"
                                                            className="change-service-btn"
                                                            onClick={() => {
                                                                setSelectedService(null);
                                                                document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                                                            }}
                                                        >
                                                            Change
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="form-content">
                                                {/* Address Input */}
                                                <div className="form-field">
                                                    <label className="field-label">
                                                        <MapPin size={18} />
                                                        Service Location
                                                    </label>
                                                    <div className="input-wrapper">
                                                        <input
                                                            ref={addressInputRef}
                                                            type="text"
                                                            className="modern-input"
                                                            placeholder="Enter your address"
                                                        />
                                                    </div>
                                                    <button 
                                                        type="button"
                                                        onClick={handleUseCurrentLocation}
                                                        disabled={isLoadingLocation}
                                                        className="link-button"
                                                    >
                                                        {isLoadingLocation ? (
                                                            <>
                                                                <Loader2 size={14} className="spinner" />
                                                                Getting location...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <MapPin size={14} />
                                                                Use current location
                                                            </>
                                                        )}
                                                    </button>
                                                    {locationStatus.message && (
                                                        <div className={`location-feedback ${locationStatus.type}`}>
                                                            {locationStatus.message}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Date & Time Row */}
                                                <div className="form-grid">
                                                    <div className="form-field">
                                                        <label className="field-label">
                                                            <Calendar size={18} />
                                                            Date
                                                        </label>
                                                        <input
                                                            type="date"
                                                            className="modern-input"
                                                            min={today}
                                                            value={formData.date}
                                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                        />
                                                    </div>

                                                    <div className="form-field">
                                                        <label className="field-label">
                                                            <Clock size={18} />
                                                            Time
                                                        </label>
                                                        <select
                                                            className="modern-input"
                                                            value={formData.time}
                                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                                        >
                                                            <option value="">Select time</option>
                                                            {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map(time => (
                                                                <option key={time} value={time}>
                                                                    {time.split(':')[0] > '12' ? `${parseInt(time.split(':')[0]) - 12}:00 PM` : `${time} ${time.split(':')[0] === '12' ? 'PM' : 'AM'}`}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                <button 
                                                    type="button" 
                                                    className="modern-btn-primary" 
                                                    onClick={() => {
                                                        console.log('Continue button clicked');
                                                        console.log('Selected Service:', selectedService);
                                                        console.log('Form Data:', formData);
                                                        console.log('Address value:', formData.address);
                                                        console.log('Address length:', formData.address?.length);
                                                        
                                                        if (!selectedService) {
                                                            setErrorMessage('Please select a service first.');
                                                            return;
                                                        }
                                                        
                                                        // Check each field individually for better error messages
                                                        if (!formData.address || formData.address.trim() === '') {
                                                            setErrorMessage('Please enter your service address or use current location.');
                                                            return;
                                                        }
                                                        if (!formData.date) {
                                                            setErrorMessage('Please select a date.');
                                                            return;
                                                        }
                                                        if (!formData.time) {
                                                            setErrorMessage('Please select a time.');
                                                            return;
                                                        }
                                                        
                                                        setErrorMessage('');
                                                        setFormStep(2);
                                                    }}
                                                >
                                                    Continue to contact details
                                                </button>

                                                {errorMessage && (
                                                    <div className="error-feedback">{errorMessage}</div>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    {formStep === 2 && (
                                        <>
                                            <div className="form-header">
                                                <button 
                                                    type="button"
                                                    onClick={() => setFormStep(1)}
                                                    className="back-link"
                                                >
                                                    ← Back
                                                </button>
                                                <div className="form-step-indicator">
                                                    <div className="step-dots">
                                                        <div className="step-dot completed"></div>
                                                        <div className="step-dot active"></div>
                                                    </div>
                                                    <span className="step-text">Step 2 of 2</span>
                                                </div>
                                                <h2 className="form-title">Your contact<br/>information</h2>
                                            </div>

                                            <div className="form-content">
                                                {/* Name */}
                                                <div className="form-field">
                                                    <label className="field-label">
                                                        <User size={18} />
                                                        Full Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="modern-input"
                                                        placeholder="John Smith"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        required
                                                    />
                                                </div>

                                                {/* Phone & Email Row */}
                                                <div className="form-grid">
                                                    <div className="form-field">
                                                        <label className="field-label">
                                                            <Phone size={18} />
                                                            Phone
                                                        </label>
                                                        <input
                                                            type="tel"
                                                            className="modern-input"
                                                            placeholder="(555) 123-4567"
                                                            value={formData.phone}
                                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                            required
                                                        />
                                                    </div>

                                                    <div className="form-field">
                                                        <label className="field-label">
                                                            <Mail size={18} />
                                                            Email
                                                            <span className="optional-badge">Optional</span>
                                                        </label>
                                                        <input
                                                            type="email"
                                                            className="modern-input"
                                                            placeholder="john@example.com"
                                                            value={formData.email}
                                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Notes */}
                                                <div className="form-field">
                                                    <label className="field-label">
                                                        <MessageSquare size={18} />
                                                        Special Requests
                                                        <span className="optional-badge">Optional</span>
                                                    </label>
                                                    <textarea
                                                        className="modern-input modern-textarea"
                                                        placeholder="Any special requests or notes..."
                                                        rows={4}
                                                        value={formData.notes}
                                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                    />
                                                </div>

                                                <button 
                                                    type="button"
                                                    onClick={handleSubmit}
                                                    disabled={isLoading}
                                                    className="modern-btn-primary"
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <Loader2 size={20} className="spinner" />
                                                            Confirming booking...
                                                        </>
                                                    ) : (
                                                        'Confirm booking'
                                                    )}
                                                </button>

                                                {errorMessage && (
                                                    <div className="error-feedback">{errorMessage}</div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="success-state">
                                    <div className="success-icon">
                                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                            <polyline points="22 4 12 14.01 9 11.01"/>
                                        </svg>
                                    </div>
                                    <h2 className="success-title">Booking confirmed!</h2>
                                    <p className="success-message">
                                        Thank you! We've received your booking and will contact you shortly to confirm the details.
                                    </p>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setSubmissionSuccess(false);
                                            setFormStep(1);
                                            setSelectedService(null);
                                            setFormData({ address: '', date: '', time: '', name: '', phone: '', email: '', notes: '' });
                                            setErrorMessage('');
                                        }}
                                        className="modern-btn-secondary"
                                    >
                                        Book another service
                                    </button>
                                </div>
                            )}
                        </div>
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
            )}
        </>
    );
}
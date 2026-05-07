import { useState, useEffect } from 'react';
import { 
    Star, 
    Shield, 
    MapPin, 
    ArrowRight, 
    CheckCircle2, 
    Instagram, 
    Phone,
    Mail,
    ChevronRight,
    Car,
    Sparkles,
    Calendar,
    Award,
    Music2,
    Clock,
    Zap,
    Heart,
    Plus,
    Minus
} from 'lucide-react';
import heroLogo from './assets/8ac00dbb913d177c7d2a825d140dd19b9b5b29e2.png';
import faviconLogo from './assets/e5204a642a70c248c8ecda621f114752fa1a9498.png';

const SETMORE_URL = "https://apdetails.setmore.com/";

const services = [
    {
        id: 'premium-package',
        name: 'The Full Restore',
        price: 199.99,
        description: 'Our flagship showroom treatment for North Texas vehicles. Complete interior restoration and exterior paint decontamination with premium ceramic protection.',
        features: ['Full Interior Restoration', 'Ceramic Sealant', 'Engine Bay Detail', 'Iron Decontamination'],
        badge: 'MOST POPULAR'
    },
    {
        id: 'interior-specialist',
        name: 'Interior Elite',
        price: 119.99,
        description: 'Advanced mobile steam cleaning and extraction in McKinney. We remove deep stains and odors to make your cabin feel brand new again.',
        features: ['Deep Extraction', 'Leather Conditioning', 'Ozone Treatment', 'Pet Hair Removal']
    },
    {
        id: 'exterior-glow',
        name: 'Exterior Ceramic',
        price: 99.99,
        description: 'Professional clay bar treatment followed by a high-grade ceramic wax for a mirror-like finish and incredible water beading protection.',
        features: ['Clay Bar Treatment', 'Ceramic Wax', 'Wheel Detail', 'Tire Dressing']
    }
];

const faqs = [
    {
        q: "What areas do you serve?",
        a: "We are a fully mobile service serving McKinney, Frisco, Plano, Prosper, Celina, Anna, Fairview, and surrounding North Texas areas. We come directly to your home or office!"
    },
    {
        q: "How long does a detailing take?",
        a: "Depending on the package, a detail can take anywhere from 2 to 6 hours. 'The Full Restore' typically takes about 5 hours for a complete transformation."
    },
    {
        q: "Do you need access to water or electricity?",
        a: "Yes, we currently require access to a water spigot and a standard power outlet at your location to provide our premium detailing services."
    }
];

export default function App() {
    const [scrolled, setScrolled] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        
        const favicon = document.querySelector('#favicon-placeholder') as HTMLLinkElement;
        const appleIcon = document.querySelector('#apple-touch-icon-placeholder') as HTMLLinkElement;
        if (favicon) favicon.href = faviconLogo;
        if (appleIcon) appleIcon.href = faviconLogo;

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#050505] selection:bg-accent/30 selection:text-white">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full" />
            </div>

            {/* Navigation */}
            <nav className={`nav glass ${scrolled ? 'py-4 shadow-2xl bg-black/80' : 'py-6'} transition-all duration-500 fixed top-0 w-full z-[1000] border-b border-white/5 px-6 md:px-12 flex justify-between items-center`}>
                <a href="#" className="flex items-center gap-3 no-underline group">
                    <img src={faviconLogo} alt="Logo" className="w-8 h-8 object-contain group-hover:rotate-12 transition-transform" />
                    <span className="font-heading text-xl font-black tracking-tighter text-white">AP<span className="text-accent">DETAILS</span></span>
                </a>
                
                <div className="hidden md:flex gap-10 items-center">
                    <a href="#services" className="text-silver hover:text-white no-underline font-medium transition-colors text-sm uppercase tracking-widest">Services</a>
                    <a href="#process" className="text-silver hover:text-white no-underline font-medium transition-colors text-sm uppercase tracking-widest">Process</a>
                    <a href="#faq" className="text-silver hover:text-white no-underline font-medium transition-colors text-sm uppercase tracking-widest">FAQ</a>
                    <a href={SETMORE_URL} target="_blank" rel="noopener noreferrer" className="btn-premium py-3 px-8 text-[10px]">
                        Book Appointment
                    </a>
                </div>

                <a href={SETMORE_URL} target="_blank" rel="noopener noreferrer" className="md:hidden btn-premium py-2 px-6 text-[10px]">
                    Book Now
                </a>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
                <div className="relative z-20 text-center px-6 max-w-5xl">
                    <div className="animate-logo inline-block mb-12 animate-float">
                        <img src={heroLogo} alt="AP Details" className="max-w-[280px] md:max-w-[500px] drop-shadow-[0_0_80px_rgba(255,107,157,0.3)]" />
                    </div>
                    <div className="space-y-6">
                        <span className="animate-fade-up text-accent font-heading font-bold tracking-[0.5em] text-xs block">EST. 2024 • NORTH TEXAS</span>
                        <h1 className="animate-fade-up [animation-delay:0.2s] text-4xl md:text-8xl font-black mb-6 leading-[0.95] tracking-tighter uppercase">
                            AP DETAILS: THE #1 <br /> <span className="text-gradient">MOBILE DETAILING</span>
                        </h1>
                        <p className="animate-fade-up [animation-delay:0.4s] text-silver text-lg md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed font-light">
                            Premium automotive restoration delivered to your doorstep. 
                            Serving McKinney, Frisco, Plano, and the surrounding areas with showroom-quality excellence.
                        </p>
                        <div className="animate-fade-up [animation-delay:0.6s] flex flex-col md:flex-row gap-6 justify-center items-center">
                            <a href={SETMORE_URL} target="_blank" rel="noopener noreferrer" className="btn-premium group w-full md:w-auto px-12 py-5 text-sm">
                                Secure Your Date <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                            </a>
                            <a href="#services" className="btn-outline w-full md:w-auto px-12 py-5 text-sm">
                                Explore Services
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Bar */}
            <div className="border-y border-white/5 bg-black/40 backdrop-blur-md py-12">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
                    <div className="flex flex-col items-center gap-2 text-center group cursor-pointer">
                        <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-accent group-hover:scale-110 transition-transform"><Star fill="currentColor" size={24} /></div>
                        <span className="font-heading font-black text-sm tracking-widest mt-2">5-STAR RATED</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 text-center group cursor-pointer">
                        <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-accent group-hover:scale-110 transition-transform"><Shield size={24} /></div>
                        <span className="font-heading font-black text-sm tracking-widest mt-2">FULLY INSURED</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 text-center group cursor-pointer">
                        <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-accent group-hover:scale-110 transition-transform"><MapPin size={24} /></div>
                        <span className="font-heading font-black text-sm tracking-widest mt-2">MOBILE SERVICE</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 text-center group cursor-pointer">
                        <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-accent group-hover:scale-110 transition-transform"><Award size={24} /></div>
                        <span className="font-heading font-black text-sm tracking-widest mt-2">CERAMIC PRO</span>
                    </div>
                </div>
            </div>

            {/* Process Section */}
            <section id="process" className="section-container">
                <div className="text-center mb-24">
                    <span className="text-accent font-heading font-bold tracking-[0.4em] text-xs block mb-4 uppercase">HOW IT WORKS</span>
                    <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase mb-6">THE AP <span className="text-gradient">PROCESS</span></h2>
                    <p className="text-silver max-w-xl mx-auto font-light text-lg">Three simple steps to a brand new looking vehicle.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-12 relative">
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />
                    {[
                        { icon: <Calendar />, title: "BOOK ONLINE", desc: "Choose your package and secure your date in seconds." },
                        { icon: <Car />, title: "WE ARRIVE", desc: "We come to your location with all professional tools ready." },
                        { icon: <Sparkles />, title: "ENJOY", desc: "Drive a showroom-ready vehicle without leaving home." }
                    ].map((step, i) => (
                        <div key={i} className="glass-heavy rounded-[40px] p-12 text-center relative z-10 hover:border-accent/30 transition-all group">
                            <div className="w-20 h-20 rounded-3xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mx-auto mb-8 group-hover:scale-110 transition-transform">
                                {step.icon}
                            </div>
                            <h3 className="font-heading font-black text-xl mb-4">{step.title}</h3>
                            <p className="text-silver font-light leading-relaxed">{step.desc}</p>
                            <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full glass flex items-center justify-center font-heading font-black text-accent text-sm border-accent/20">0{i+1}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="section-container bg-[#080808]">
                <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
                    <div className="max-w-2xl">
                        <span className="text-accent font-heading font-bold tracking-[0.4em] text-xs block mb-4 uppercase">OUR PACKAGES</span>
                        <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase mb-6">ELITE VEHICLE <br /><span className="text-gradient">RESTORATION</span></h2>
                    </div>
                    <div className="text-right">
                        <p className="text-silver max-w-md font-light leading-relaxed mb-6 ml-auto">
                            Serving McKinney, Frisco, Plano, Prosper, and beyond with premium chemicals and professional techniques.
                        </p>
                        <div className="flex justify-end gap-4 text-xs font-heading font-black tracking-widest text-accent">
                            <span className="flex items-center gap-2"><Clock size={14} /> 2-6 HOUR SERVICE</span>
                            <span className="flex items-center gap-2"><Zap size={14} /> INSTANT QUOTE</span>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {services.map((service) => (
                        <div key={service.id} className="group glass-heavy rounded-[48px] p-12 flex flex-col hover:border-accent/30 transition-all duration-700 hover:-translate-y-6 relative overflow-hidden">
                            {service.badge && (
                                <div className="absolute top-0 right-0 bg-accent text-white font-heading text-[10px] py-3 px-8 rounded-bl-[24px] font-black tracking-widest">
                                    {service.badge}
                                </div>
                            )}
                            
                            <h2 className="text-3xl font-black mb-6 tracking-tight uppercase">{service.name}</h2>
                            <p className="text-silver font-light text-sm mb-10 leading-relaxed min-h-[60px]">
                                {service.description}
                            </p>
                            
                            <div className="space-y-5 mb-12 flex-grow">
                                {service.features.map(f => (
                                    <div key={f} className="flex items-center gap-4 text-sm font-medium group/feat">
                                        <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20 group-hover/feat:bg-accent/20 transition-colors">
                                            <CheckCircle2 size={14} className="text-accent" />
                                        </div>
                                        {f}
                                    </div>
                                ))}
                            </div>

                            <div className="pt-10 border-t border-white/5 mt-auto">
                                <div className="flex justify-between items-center mb-10">
                                    <div>
                                        <span className="text-white/30 text-[10px] font-heading block mb-2 uppercase tracking-widest">STARTING AT</span>
                                        <span className="text-4xl font-black tracking-tighter text-white">${service.price}</span>
                                    </div>
                                    <div className="w-14 h-14 rounded-2xl border border-white/10 flex items-center justify-center group-hover:border-accent group-hover:bg-accent/5 transition-all">
                                        <ChevronRight size={24} className="group-hover:text-accent transition-colors" />
                                    </div>
                                </div>
                                <a href={SETMORE_URL} target="_blank" rel="noopener noreferrer" className="btn-premium w-full justify-center py-5 rounded-3xl text-sm">
                                    Book This Package
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="section-container">
                <div className="grid md:grid-cols-2 gap-24 items-start">
                    <div>
                        <span className="text-accent font-heading font-bold tracking-[0.4em] text-xs block mb-4 uppercase">COMMON QUESTIONS</span>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-8">FREQUENTLY <br /> <span className="text-gradient">ASKED</span></h2>
                        <p className="text-silver text-xl font-light leading-relaxed mb-12">
                            Everything you need to know about our mobile detailing process in North Texas.
                        </p>
                        <a href={SETMORE_URL} target="_blank" rel="noopener noreferrer" className="btn-outline px-10 py-4 group">
                            Still have questions? <Phone size={18} className="ml-2 group-hover:rotate-12 transition-transform" />
                        </a>
                    </div>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="glass rounded-[32px] overflow-hidden transition-all duration-500 border-white/5 hover:border-white/10">
                                <button 
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full p-8 flex justify-between items-center text-left cursor-pointer bg-transparent border-none outline-none group"
                                >
                                    <span className="font-heading font-black text-sm md:text-base text-white group-hover:text-accent transition-colors uppercase tracking-tight">{faq.q}</span>
                                    <div className="text-accent transition-transform duration-500">
                                        {openFaq === i ? <Minus size={20} /> : <Plus size={20} />}
                                    </div>
                                </button>
                                <div className={`transition-all duration-500 ease-in-out ${openFaq === i ? 'max-h-[500px] opacity-100 p-8 pt-0' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                    <p className="text-silver font-light leading-relaxed text-sm md:text-base border-t border-white/5 pt-6">
                                        {faq.a}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="section-container pt-0">
                <div className="bg-accent-gradient rounded-[80px] p-12 md:p-32 text-center relative overflow-hidden group shadow-[0_0_100px_rgba(255,107,157,0.2)]">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-8xl font-black mb-12 text-white tracking-tighter uppercase leading-[0.9]">READY FOR THE <br /> SHOWROOM LOOK?</h2>
                        <p className="text-white/80 text-xl md:text-2xl max-w-2xl mx-auto mb-16 font-light">
                            Join 100+ happy clients in North Texas who trust AP Details for their premium car care needs.
                        </p>
                        <a href={SETMORE_URL} target="_blank" rel="noopener noreferrer" className="bg-white text-black py-6 px-16 rounded-full font-heading font-black text-sm tracking-[0.2em] hover:scale-110 hover:shadow-2xl transition-all inline-flex items-center gap-4 no-underline cursor-pointer uppercase">
                            BOOK YOUR SPOT <ChevronRight size={24} />
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer id="contact" className="bg-[#020202] pt-32 pb-12 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-16 mb-24">
                        <div className="col-span-2">
                            <a href="#" className="flex items-center gap-3 no-underline mb-10 group">
                                <img src={faviconLogo} alt="Logo" className="w-12 h-12 object-contain group-hover:rotate-12 transition-transform" />
                                <span className="font-heading text-3xl font-black tracking-tighter text-white uppercase">AP<span className="text-accent">DETAILS</span></span>
                            </a>
                            <p className="text-silver max-w-sm font-light text-lg leading-relaxed mb-10">
                                AP Details provides premium mobile car detailing services across North Texas. We bring professional showroom-quality care to your doorstep in McKinney, Frisco, Plano, Prosper, Celina, and Anna.
                            </p>
                            <div className="flex gap-6">
                                <a href="https://www.instagram.com/apdetailsntx/" target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-2xl glass flex items-center justify-center hover:border-accent hover:bg-accent/10 transition-all hover:-translate-y-2 text-white" aria-label="Instagram"><Instagram size={24} /></a>
                                <a href="https://www.tiktok.com/@apdetailsntx" target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-2xl glass flex items-center justify-center hover:border-accent hover:bg-accent/10 transition-all hover:-translate-y-2 text-white" aria-label="TikTok"><Music2 size={24} /></a>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-heading font-black text-xs tracking-[0.4em] mb-10 text-white/30 uppercase">CONTACT INFO</h4>
                            <div className="space-y-8">
                                <div className="flex items-start gap-5 text-silver group">
                                    <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-accent group-hover:scale-110 transition-transform"><Phone size={18} /></div>
                                    <div>
                                        <span className="block text-[10px] font-heading font-black text-white/20 mb-1 tracking-widest uppercase">Phone</span>
                                        <span className="text-lg font-medium group-hover:text-white transition-colors">(214) 555-0123</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-5 text-silver group">
                                    <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-accent group-hover:scale-110 transition-transform"><Mail size={18} /></div>
                                    <div>
                                        <span className="block text-[10px] font-heading font-black text-white/20 mb-1 tracking-widest uppercase">Email</span>
                                        <span className="text-lg font-medium group-hover:text-white transition-colors">info@apdetailsntx.com</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-heading font-black text-xs tracking-[0.4em] mb-10 text-white/30 uppercase">QUICK LINKS</h4>
                            <div className="space-y-6">
                                <a href="#services" className="block text-silver hover:text-accent no-underline transition-all text-sm font-bold tracking-widest uppercase hover:translate-x-2">Services</a>
                                <a href="#process" className="block text-silver hover:text-accent no-underline transition-all text-sm font-bold tracking-widest uppercase hover:translate-x-2">Our Process</a>
                                <a href={SETMORE_URL} target="_blank" rel="noopener noreferrer" className="block text-white bg-accent/10 py-3 px-6 rounded-xl border border-accent/20 text-center no-underline hover:bg-accent hover:text-white transition-all text-xs font-black tracking-widest uppercase">Book Now</a>
                            </div>
                        </div>
                    </div>

                    <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-heading font-black tracking-[0.3em] text-white/10 uppercase">
                        <p>&copy; {new Date().getFullYear()} AP DETAILS NORTH TEXAS. ALL RIGHTS RESERVED.</p>
                        <div className="flex gap-12">
                            <a href="#" className="no-underline text-inherit hover:text-white transition-colors">PRIVACY</a>
                            <a href="#" className="no-underline text-inherit hover:text-white transition-colors">TERMS</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Custom Styles */}
            <style>{`
                .nav.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
                .nav.py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
                .flex { display: flex; }
                .hidden { display: none; }
                .md\\:flex { display: flex; }
                @media (max-width: 767px) { .md\\:flex { display: none; } .md\\:hidden { display: flex; } }
                .items-center { align-items: center; }
                .justify-between { justify-content: space-between; }
                .justify-center { justify-content: center; }
                .gap-3 { gap: 0.75rem; }
                .gap-10 { gap: 2.5rem; }
                .gap-6 { gap: 1.5rem; }
                .gap-12 { gap: 3rem; }
                .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
                .px-12 { padding-left: 3rem; padding-right: 3rem; }
                .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
                .py-5 { padding-top: 1.25rem; padding-bottom: 1.25rem; }
                .py-12 { padding-top: 3rem; padding-bottom: 3rem; }
                .relative { position: relative; }
                .absolute { position: absolute; }
                .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
                .z-0 { z-index: 0; }
                .z-10 { z-index: 10; }
                .z-20 { z-index: 20; }
                .text-center { text-align: center; }
                .mx-auto { margin-left: auto; margin-right: auto; }
                .max-w-5xl { max-width: 64rem; }
                .max-w-7xl { max-width: 80rem; }
                .mb-12 { margin-bottom: 3rem; }
                .mb-24 { margin-bottom: 6rem; }
                .mb-10 { margin-bottom: 2.5rem; }
                .grid { display: grid; }
                .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
                @media (max-width: 767px) { 
                    .grid-cols-2 { grid-template-columns: 1fr; } 
                    .grid-cols-4 { grid-template-columns: 1fr; }
                    .text-8xl { font-size: 3.5rem; }
                }
                .selection\\:bg-accent\\/30 ::selection { background-color: rgba(255, 107, 157, 0.3); color: white; }
            `}</style>
        </div>
    );
}
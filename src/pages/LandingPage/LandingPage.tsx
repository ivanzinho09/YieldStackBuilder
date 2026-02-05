import './LandingPage.css';
import { Header } from '../../components/Header';
import { Hero } from '../../components/Hero';
import { TrustStrip } from '../../components/TrustStrip';
import { Features } from '../../components/Features';
import { Strategies } from '../../components/Strategies';
import { CTA } from '../../components/CTA';
import { Footer } from '../../components/Footer';

export function LandingPage() {
    return (
        <>
            {/* Guide Lines */}
            <div className="guide-line left"></div>
            <div className="guide-line right"></div>

            <div className="container">
                <Header />
                <Hero />
                <TrustStrip />
                <Features />
                <Strategies />
                <CTA />
                <Footer />
            </div>

            {/* Corner Decorations */}
            <div className="corner-decoration bottom-right"></div>
            <div className="corner-decoration top-left"></div>
        </>
    );
}

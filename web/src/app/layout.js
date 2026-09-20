import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
    title: 'Vastra - Custom Tailoring Marketplace | Find Tailors Across India',
    description: 'Connect with skilled local tailors across India. Browse designs, order custom-tailored clothing, and get it delivered to your doorstep at affordable prices.',
    keywords: 'tailoring, custom clothing, tailor near me, Indian fashion, bespoke, kurta, lehenga, sherwani, blouse stitching',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <AuthProvider>
                    <Navbar />
                    <main>{children}</main>
                    <Footer />
                </AuthProvider>
            </body>
        </html>
    );
}

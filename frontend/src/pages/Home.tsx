import React from 'react';
import Hero from '../components/Hero';

const Home: React.FC = () => {
    return (
        <div className="relative min-h-screen bg-transparent overflow-hidden">
            <main className="relative z-10 w-full pt-16">
                <Hero />
            </main>

        </div>
    );
};

export default Home;

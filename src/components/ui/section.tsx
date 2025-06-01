import React from 'react';

interface SectionProps {
    children: React.ReactNode;
    className?: string;
    bgColor?: 'white' | 'light' | 'primary' | 'dark';
    spacing?: 'sm' | 'md' | 'lg' | 'xl';
}

const Section: React.FC<SectionProps> = ({
    children,
    className = '',
    bgColor = 'white',
    spacing = 'lg',
}) => {
    const bgColors = {
        white: 'bg-white',
        light: 'bg-gray-50',
        primary: 'bg-blue-50',
        dark: 'bg-gray-900 text-white'
    };

    const spacings = {
        sm: 'py-8',
        md: 'py-12',
        lg: 'py-16',
        xl: 'py-24'
    };

    return (
        <section className={`${bgColors[bgColor]} ${spacings[spacing]} ${className}`}>
            <div className="container mx-auto px-4 md:px-6">
                {children}
            </div>
        </section>
    );
};

export const SectionHeader: React.FC<{
    title: string;
    subtitle?: string;
    centered?: boolean;
    className?: string;
}> = ({ title, subtitle, centered = false, className = '' }) => {
    const alignment = centered ? 'text-center' : '';

    return (
        <div className={`mb-12 ${alignment} ${className}`}>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
            {subtitle && <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>}
        </div>
    );
};

export default Section;
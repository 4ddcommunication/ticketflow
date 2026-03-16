interface Props {
    size?: 'sm' | 'md';
}

export function BrandLogo({ size = 'md' }: Props) {
    const isSm = size === 'sm';
    const fontSize = isSm ? 16 : 20;
    const dotSize = isSm ? 4 : 5;

    return (
        <span style={{ display: 'inline-flex', alignItems: 'baseline', fontSize, letterSpacing: '-0.5px' }}>
            <span style={{ fontWeight: 300, color: '#a1a1aa' }}>klein</span>
            <span style={{ fontWeight: 900, color: '#18181b' }}>books</span>
            <span style={{
                display: 'inline-block',
                width: dotSize,
                height: dotSize,
                background: '#6366f1',
                borderRadius: '50%',
                marginLeft: 2,
                position: 'relative',
                top: -1,
            }} />
        </span>
    );
}

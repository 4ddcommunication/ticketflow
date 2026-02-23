interface Props {
    name: string;
    size?: 'sm' | 'md' | 'lg';
}

const sizes = {
    sm: 'tf-w-6 tf-h-6 tf-text-xs',
    md: 'tf-w-8 tf-h-8 tf-text-sm',
    lg: 'tf-w-10 tf-h-10 tf-text-base',
};

const colors = [
    'tf-bg-blue-500', 'tf-bg-green-500', 'tf-bg-purple-500',
    'tf-bg-pink-500', 'tf-bg-indigo-500', 'tf-bg-teal-500',
];

export function Avatar({ name, size = 'md' }: Props) {
    const initials = name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const colorIdx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;

    return (
        <div
            className={`${sizes[size]} ${colors[colorIdx]} tf-rounded-full tf-flex tf-items-center tf-justify-center tf-text-white tf-font-medium tf-shrink-0`}
        >
            {initials}
        </div>
    );
}

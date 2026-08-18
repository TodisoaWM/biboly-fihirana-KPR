import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'book'
  | 'sun'
  | 'moon'
  | 'music'
  | 'heart'
  | 'heart-filled'
  | 'chevron-right'
  | 'chevron-left'
  | 'arrow-right'
  | 'bookmark'
  | 'bookmark-filled'
  | 'search'
  | 'menu'
  | 'bell'
  | 'globe'
  | 'info'
  | 'edit'
  | 'play'
  | 'volume'
  | 'format'
  | 'pray'
  | 'hash'
  | 'book-search'
  | 'music-search'
  | 'sunrise';

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  fill?: string;
};

export function Icon({ name, size = 24, color = '#232020', strokeWidth = 1.8, fill = 'none' }: Props) {
  const stroke = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };

  const body = () => {
    switch (name) {
      case 'book':
        return (
          <>
            <Path {...stroke} d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H6a2 2 0 0 0-2 1.2z" />
            <Path {...stroke} d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5a2 2 0 0 1 2 1.2z" />
          </>
        );
      case 'sun':
        return (
          <>
            <Circle {...stroke} cx={12} cy={12} r={4} />
            <Path
              {...stroke}
              d="M12 3v1.5M12 19.5V21M4.9 4.9l1.1 1.1M18 18l1.1 1.1M3 12h1.5M19.5 12H21M4.9 19.1 6 18M18 6l1.1-1.1"
            />
          </>
        );
      case 'sunrise':
        return (
          <>
            <Circle {...stroke} cx={12} cy={12} r={4} />
            <Path
              {...stroke}
              d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
            />
          </>
        );
      case 'moon':
        return <Path {...stroke} d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8z" />;
      case 'music':
        return (
          <>
            <Path {...stroke} d="M9 17V4l10-1.5V14" />
            <Circle {...stroke} cx={6} cy={17} r={3} />
            <Circle {...stroke} cx={16} cy={14} r={3} />
          </>
        );
      case 'heart':
        return (
          <Path
            {...stroke}
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          />
        );
      case 'heart-filled':
        return (
          <Path
            fill={color}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          />
        );
      case 'chevron-right':
        return <Path {...stroke} strokeWidth={strokeWidth} d="M9 6l6 6-6 6" />;
      case 'chevron-left':
        return <Path {...stroke} d="M15 6l-6 6 6 6" />;
      case 'arrow-right':
        return <Path {...stroke} d="M5 12h13M13 6l6 6-6 6" />;
      case 'bookmark':
        return <Path {...stroke} d="M6 4h12v17l-6-4-6 4z" />;
      case 'bookmark-filled':
        return <Path fill={color} stroke={color} strokeWidth={strokeWidth} d="M6 4h12v17l-6-4-6 4z" />;
      case 'search':
        return (
          <>
            <Circle {...stroke} cx={11} cy={11} r={7} />
            <Path {...stroke} d="M20 20l-3.2-3.2" />
          </>
        );
      case 'menu':
        return <Path {...stroke} d="M4 7h16M4 12h11M4 17h16" />;
      case 'bell':
        return (
          <>
            <Path {...stroke} d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <Path {...stroke} d="M13.7 21a2 2 0 0 1-3.4 0" />
          </>
        );
      case 'globe':
        return (
          <>
            <Circle {...stroke} cx={12} cy={12} r={9} />
            <Path {...stroke} d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
          </>
        );
      case 'info':
        return (
          <>
            <Circle {...stroke} cx={12} cy={12} r={9} />
            <Path {...stroke} d="M12 16v-4M12 8h.01" />
          </>
        );
      case 'edit':
        return (
          <>
            <Path {...stroke} d="M12 20h8" />
            <Path {...stroke} d="M16 4l4 4L8 20H4v-4z" />
          </>
        );
      case 'play':
        return <Path fill={fill === 'none' ? color : fill} d="M8 5v14l11-7z" />;
      case 'volume':
        return (
          <>
            <Path {...stroke} d="M11 5 6 9H3v6h3l5 4z" />
            <Path {...stroke} d="M15.5 8.5a5 5 0 0 1 0 7" />
          </>
        );
      case 'format':
        return (
          <>
            <Path {...stroke} d="M4 7V5h16v2M9 5v14M6 19h6" />
            <Path {...stroke} d="M16 12h4M18 10v10M15 20h6" />
          </>
        );
      case 'pray':
        return (
          <>
            {/* main gauche */}
            <Path {...stroke} d="M12 21.5V6.4c0-1.1-.5-2.2-1.4-2.9l-.4-.3c-.5-.4-1.2-.3-1.6.2-.3.4-.4.9-.2 1.4l1 2.6-3.1 2.8c-.8.7-1.3 1.8-1.3 2.9v2.2c0 .7.3 1.4.9 1.9l2.6 2.3" />
            {/* main droite (miroir) */}
            <Path {...stroke} d="M12 21.5V6.4c0-1.1.5-2.2 1.4-2.9l.4-.3c.5-.4 1.2-.3 1.6.2.3.4.4.9.2 1.4l-1 2.6 3.1 2.8c.8.7 1.3 1.8 1.3 2.9v2.2c0 .7-.3 1.4-.9 1.9l-2.6 2.3" />
          </>
        );
      case 'hash':
        return <Path {...stroke} d="M10 4 8 20M16 4l-2 16M5 9h15M4 15h15" />;
      case 'book-search':
        return (
          <>
            {/* couverture du livre (dos arrondi à gauche) — remplit la zone */}
            <Path {...stroke} d="M5 2.5H15V18H5A1.5 1.5 0 0 1 3.5 16.5V4A1.5 1.5 0 0 1 5 2.5Z" />
            {/* marque-page */}
            <Path {...stroke} d="M9 2.5V8L10.75 6.5 12.5 8V2.5" />
            {/* loupe */}
            <Circle {...stroke} cx={16} cy={15.5} r={4.1} />
            <Path {...stroke} d="M19 18.6 22 21.6" />
          </>
        );
      case 'music-search':
        return (
          <>
            {/* note de musique (en haut à gauche) */}
            <Path {...stroke} d="M8 12.5V3.5L14 2.3V11" />
            <Circle {...stroke} cx={5.7} cy={12.5} r={2.3} />
            <Circle {...stroke} cx={11.7} cy={11} r={2.3} />
            {/* loupe (en bas à droite) */}
            <Circle {...stroke} cx={16.5} cy={16} r={4} />
            <Path {...stroke} d="M19.4 19 22 21.6" />
          </>
        );
      default:
        return <Rect x={2} y={2} width={20} height={20} rx={4} {...stroke} />;
    }
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {body()}
    </Svg>
  );
}

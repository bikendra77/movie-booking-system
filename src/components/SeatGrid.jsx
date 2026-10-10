import React from 'react';
import { Monitor, Check } from 'lucide-react';
import { formatNPR } from '../utils/currency';

// Seating tier configurations
export const SEAT_TIERS = {
  VIP: { name: 'Front section', price: 700, color: '#f59e0b', rows: ['A'] },
  PREMIUM: { name: 'Centre section', price: 600, color: '#818cf8', rows: ['B', 'C', 'D'] },
  STANDARD: { name: 'Rear section', price: 500, color: '#38bdf8', rows: ['E', 'F', 'G'] }
};

const ROWS = [
  { letter: 'A', tier: 'VIP' },
  { letter: 'B', tier: 'PREMIUM' },
  { letter: 'C', tier: 'PREMIUM' },
  { letter: 'D', tier: 'PREMIUM' },
  { letter: 'E', tier: 'STANDARD' },
  { letter: 'F', tier: 'STANDARD' },
  { letter: 'G', tier: 'STANDARD' }
];

const SEATS_PER_ROW = 10;
const AISLE_AFTER = 5; // Aisle after seat 5

export const SeatGrid = ({ bookedSeatIds = [], selectedSeats = [], onToggleSeat, basePrice = 450 }) => {
  // Determine tier pricing relative to showtime base price
  const getTierPrice = (tierKey) => {
    if (tierKey === 'VIP') return Math.round(basePrice * 1.35);
    if (tierKey === 'PREMIUM') return Math.round(basePrice * 1.15);
    return Math.round(basePrice);
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto', padding: '1rem 0' }}>
      <div style={{ minWidth: '600px', maxWidth: '820px', margin: '0 auto' }}>
        
        {/* Curved Screen Indicator */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              height: '8px',
              width: '80%',
              margin: '0 auto 12px',
              background: 'linear-gradient(90deg, transparent, #e50914, #f43f5e, #e50914, transparent)',
              borderRadius: '50% 50% 0 0',
              boxShadow: '0 4px 25px rgba(229, 9, 20, 0.65)'
            }}
          />
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-dim)',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase'
          }}>
            <Monitor size={14} /> Cinema Screen / All Eyes This Way
          </div>
        </div>

        {/* Rows Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem' }}>
          {ROWS.map(({ letter, tier }) => {
            const tierConfig = SEAT_TIERS[tier];
            const price = getTierPrice(tier);

            return (
              <div
                key={letter}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {/* Row Letter indicator Left */}
                <div style={{
                  width: '28px',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)'
                }}>
                  {letter}
                </div>

                {/* Seat buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {Array.from({ length: SEATS_PER_ROW }, (_, idx) => {
                    const seatNum = idx + 1;
                    const seatId = `${letter}${seatNum}`;
                    const isBooked = bookedSeatIds.includes(seatId);
                    const isSelected = selectedSeats.some(s => s.id === seatId);

                    const seatObj = {
                      id: seatId,
                      row: letter,
                      number: seatNum,
                      tier: tierConfig.name,
                      tierCode: tier,
                      price
                    };

                    let bgColor = 'rgba(255, 255, 255, 0.07)';
                    let borderColor = 'rgba(255, 255, 255, 0.15)';
                    let textColor = 'var(--text-muted)';
                    let cursor = 'pointer';

                    if (isBooked) {
                      bgColor = '#1e293b';
                      borderColor = 'transparent';
                      textColor = '#475569';
                      cursor = 'not-allowed';
                    } else if (isSelected) {
                      bgColor = '#10b981'; // Emerald glow for chosen seat
                      borderColor = '#34d399';
                      textColor = '#ffffff';
                    }

                    return (
                      <React.Fragment key={seatId}>
                        <button
                          type="button"
                          disabled={isBooked}
                          onClick={() => onToggleSeat(seatObj)}
                          aria-label={`${seatId}, ${tierConfig.name}, ${formatNPR(price)}, ${isBooked ? 'booked' : isSelected ? 'selected' : 'available'}`}
                          aria-pressed={isSelected}
                          title={`${seatId} - ${tierConfig.name} (${formatNPR(price)}) ${isBooked ? '(Booked)' : ''}`}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px 8px 4px 4px',
                            backgroundColor: bgColor,
                            border: `1.5px solid ${borderColor}`,
                            color: textColor,
                            fontSize: '0.75rem',
                            fontWeight: isSelected ? 700 : 500,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor,
                            position: 'relative',
                            transition: 'all 0.15s ease',
                            boxShadow: isSelected ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'none'
                          }}
                          onMouseEnter={(e) => {
                            if (!isBooked && !isSelected) {
                              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.18)';
                              e.currentTarget.style.borderColor = tierConfig.color;
                              e.currentTarget.style.transform = 'translateY(-2px)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isBooked && !isSelected) {
                              e.currentTarget.style.backgroundColor = bgColor;
                              e.currentTarget.style.borderColor = borderColor;
                              e.currentTarget.style.transform = 'none';
                            }
                          }}
                        >
                          {isSelected ? <Check size={14} /> : seatNum}
                        </button>

                        {/* Central Aisle separator */}
                        {seatNum === AISLE_AFTER && (
                          <div style={{ width: '24px' }} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Row Letter indicator Right */}
                <div style={{
                  width: '28px',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)'
                }}>
                  {letter}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          padding: '1rem',
          backgroundColor: 'rgba(20, 29, 48, 0.6)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.82rem'
        }}>
          {/* Available */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }} />
            <span style={{ color: 'var(--text-muted)' }}>Available</span>
          </div>

          {/* Selected */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '4px',
              backgroundColor: '#10b981',
              boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)'
            }} />
            <span style={{ color: '#fff', fontWeight: 600 }}>Selected</span>
          </div>

          {/* Booked */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '4px',
              backgroundColor: '#1e293b'
            }} />
            <span style={{ color: 'var(--text-dim)' }}>Booked</span>
          </div>

          <div style={{ height: '14px', width: '1px', backgroundColor: 'var(--border-subtle)' }} />

          {/* Tiers prices */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>● Front section (A):</span>
            <span style={{ color: 'var(--text-muted)' }}>{formatNPR(getTierPrice('VIP'))}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ color: '#818cf8', fontWeight: 600 }}>● Centre section (B–D):</span>
            <span style={{ color: 'var(--text-muted)' }}>{formatNPR(getTierPrice('PREMIUM'))}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>● Rear section (E–G):</span>
            <span style={{ color: 'var(--text-muted)' }}>{formatNPR(getTierPrice('STANDARD'))}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

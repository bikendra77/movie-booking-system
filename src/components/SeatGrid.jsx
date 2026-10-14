import React from 'react';
import { Monitor, Check, Ban } from 'lucide-react';
import { formatNPR } from '../utils/currency';
import { priceForSeat } from '../utils/pricing';

export const SEAT_TIERS = {
  VIP: { name: 'Front section', color: '#f59e0b', rows: ['A'] },
  PREMIUM: { name: 'Centre section', color: '#38bdf8', rows: ['B', 'C', 'D'] },
  STANDARD: { name: 'Rear section', color: '#94a3b8', rows: ['E', 'F', 'G', 'H'] }
};

const ROWS = [
  { letter: 'A', tier: 'VIP' },
  { letter: 'B', tier: 'PREMIUM' },
  { letter: 'C', tier: 'PREMIUM' },
  { letter: 'D', tier: 'PREMIUM' },
  { letter: 'E', tier: 'STANDARD' },
  { letter: 'F', tier: 'STANDARD' },
  { letter: 'G', tier: 'STANDARD' },
  { letter: 'H', tier: 'STANDARD' }
];

const SEATS_PER_ROW = 12;
const AISLES_AFTER = [3, 9];
export const INACCESSIBLE_SEATS = ['H6', 'H7'];

export const SeatGrid = ({ bookedSeatIds = [], selectedSeats = [], onToggleSeat, basePrice = 450 }) => {
  const getTierPrice = (tierKey) => {
    if (tierKey === 'VIP') return priceForSeat('A1', basePrice);
    if (tierKey === 'PREMIUM') return priceForSeat('B1', basePrice);
    return priceForSeat('E1', basePrice);
  };

  return (
    <div className="seat-map-wrap">
      <div className="seat-map">
        <div className="seat-screen-block">
          <div className="seat-screen-curve" aria-hidden="true" />
          <div className="seat-screen-label">
            <Monitor size={16} /> Screen
          </div>
        </div>

        <div className="seat-rows">
          {ROWS.map(({ letter, tier }) => {
            const tierConfig = SEAT_TIERS[tier];
            const price = getTierPrice(tier);

            return (
              <div key={letter} className="seat-row">
                <div className="seat-row-label" aria-hidden="true">{letter}</div>

                <div className="seat-row-seats">
                  {Array.from({ length: SEATS_PER_ROW }, (_, idx) => {
                    const seatNum = idx + 1;
                    const seatId = `${letter}${seatNum}`;
                    const isInaccessible = INACCESSIBLE_SEATS.includes(seatId);
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

                    let stateClass = 'seat-available';
                    if (isInaccessible) stateClass = 'seat-inaccessible';
                    else if (isBooked) stateClass = 'seat-booked';
                    else if (isSelected) stateClass = 'seat-selected';

                    return (
                      <React.Fragment key={seatId}>
                        <button
                          type="button"
                          className={`seat-btn ${stateClass}`}
                          disabled={isBooked || isInaccessible}
                          onClick={() => onToggleSeat(seatObj)}
                          aria-label={`${seatId}, ${tierConfig.name}, ${formatNPR(price)}, ${
                            isInaccessible ? 'inaccessible' : isBooked ? 'booked' : isSelected ? 'selected' : 'available'
                          }`}
                          aria-pressed={isSelected}
                          title={`${seatId} · ${tierConfig.name} · ${formatNPR(price)}${
                            isInaccessible ? ' (Inaccessible)' : isBooked ? ' (Booked)' : ''
                          }`}
                        >
                          {isInaccessible ? <Ban size={16} /> : isSelected ? <Check size={18} /> : seatNum}
                        </button>
                        {AISLES_AFTER.includes(seatNum) && <div className="seat-aisle" aria-hidden="true" />}
                      </React.Fragment>
                    );
                  })}
                </div>

                <div className="seat-row-label" aria-hidden="true">{letter}</div>
              </div>
            );
          })}
        </div>

        <div className="seat-legend">
          <div className="seat-legend-item">
            <span className="seat-swatch seat-available" /> Available
          </div>
          <div className="seat-legend-item">
            <span className="seat-swatch seat-selected" /> Selected
          </div>
          <div className="seat-legend-item">
            <span className="seat-swatch seat-booked" /> Booked
          </div>
          <div className="seat-legend-item">
            <span className="seat-swatch seat-inaccessible" /> Inaccessible
          </div>
          <div className="seat-legend-divider" />
          <div className="seat-legend-item">
            <span style={{ color: '#f59e0b', fontWeight: 700 }}>Front (A)</span>
            <span>{formatNPR(getTierPrice('VIP'))}</span>
          </div>
          <div className="seat-legend-item">
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>Centre (B–D)</span>
            <span>{formatNPR(getTierPrice('PREMIUM'))}</span>
          </div>
          <div className="seat-legend-item">
            <span style={{ color: '#94a3b8', fontWeight: 700 }}>Rear (E–H)</span>
            <span>{formatNPR(getTierPrice('STANDARD'))}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

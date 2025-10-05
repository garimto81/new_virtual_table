// ===================================
// Utility Functions
// ===================================

/**
 * Format chip amounts (1000 → "1K")
 * @param {number} chips - Chip amount
 * @returns {string} Formatted chip display
 */
export function formatChips(chips) {
  return chips >= 1000
    ? (chips / 1000).toFixed(0) + 'K'
    : chips.toString();
}

/**
 * Extract first name from full name
 * @param {string} fullName - Full name (e.g., "John Doe")
 * @returns {string} First name only (e.g., "John")
 */
export function getFirstName(fullName) {
  return fullName.trim().split(/\s+/)[0];
}

/**
 * Generate table number abbreviation
 * @param {string|number} tableNo - Table number
 * @returns {string} Abbreviated form (e.g., "T3")
 */
export function getTableNumberAbbr(tableNo) {
  return tableNo ? `T${tableNo}` : '';
}

/**
 * Render player card (Minimal Design)
 * @param {Object} player - Player object
 * @param {number} index - Array index
 * @param {Object} options - Rendering options
 * @param {string} options.onClick - Click handler function name
 * @param {number} options.selectedIndex - Currently selected player index
 * @param {string} options.additionalButton - Additional button HTML
 * @returns {string} Player card HTML
 */
export function renderPlayerCard(player, index, options = {}) {
  const { onClick, selectedIndex, additionalButton = '' } = options;

  const firstName = getFirstName(player.name);
  const chipDisplay = formatChips(player.chips);
  const isSelected = selectedIndex === index;

  return `
    <div class="player-card ${player.isKeyPlayer ? 'key-player' : ''} ${isSelected ? 'selected' : ''}"
         onclick="${onClick}(${index})"
         style="
           display: flex;
           align-items: center;
           justify-content: space-between;
           padding: 8px 12px;
           margin-bottom: 8px;
           background: ${isSelected ? '#e3f2fd' : player.isKeyPlayer ? '#fffbea' : 'white'};
           border-radius: 8px;
           cursor: pointer;
           min-height: 48px;
           border-left: 3px solid ${player.isKeyPlayer ? '#ffd700' : 'transparent'};
         ">
      <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
        <div style="font-size: 14px; color: #666; min-width: 30px;">
          #${player.seatNo}
        </div>
        <div style="font-size: 14px; font-weight: 500; flex: 1;">
          ${firstName} ${player.isKeyPlayer ? '⭐' : ''}
        </div>
        <div style="font-size: 14px; color: #28a745; font-weight: 600;">
          ${chipDisplay}
        </div>
      </div>
      ${additionalButton}
    </div>
  `;
}

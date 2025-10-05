// ===================================
// UI & Modal Management
// ===================================

/**
 * Open a modal by adding 'active' class
 * @param {string} modalId - Modal element ID
 */
export function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

/**
 * Close a modal by removing 'active' class
 * @param {string} modalId - Modal element ID
 */
export function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

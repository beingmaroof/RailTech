// ============================================================
// ENGINEERING SERVICE — AI PRIORITIZATION & WORK PROGRESSION
// ============================================================
import { storageService } from './storageService.js';

const ENGINEERING_STORE_KEY = 'engineering_tasks_v1';

export const engineeringService = {
  /**
   * AI Prioritization calculation formula (Section 37)
   * Priority Score = Criticality (40%) + Urgency (30%) + Safety Risk (20%) + Asset Importance (10%)
   * Output normalized to 0–100
   */
  calculatePriorityScore(request) {
    const priority = request.priority || 'Medium';
    const maintenanceType = request.maintenanceType || request.workType || '';
    const duration = parseFloat(request.durationHours || (request.duration ? request.duration / 60 : 2));

    let criticality = 50;
    let urgency = 50;
    let safetyRisk = 50;
    let assetImportance = 60;

    if (priority === 'Critical') {
      criticality = 95;
      urgency = 90;
      safetyRisk = 92;
      assetImportance = 88;
    } else if (priority === 'High') {
      criticality = 82;
      urgency = 80;
      safetyRisk = 78;
      assetImportance = 80;
    } else if (priority === 'Medium') {
      criticality = 60;
      urgency = 55;
      safetyRisk = 50;
      assetImportance = 65;
    } else {
      criticality = 35;
      urgency = 30;
      safetyRisk = 25;
      assetImportance = 40;
    }

    // Fine-tune based on maintenance type
    if (/rail joint|fracture|crack|geometry|turnout/i.test(maintenanceType)) {
      safetyRisk = Math.min(100, safetyRisk + 10);
      criticality = Math.min(100, criticality + 8);
    }
    if (/inspection|annual|routine/i.test(maintenanceType)) {
      urgency = Math.max(20, urgency - 15);
    }
    if (duration > 4) {
      assetImportance = Math.min(100, assetImportance + 8);
    }

    const rawScore = Math.round(
      criticality * 0.40 +
      urgency * 0.30 +
      safetyRisk * 0.20 +
      assetImportance * 0.10
    );

    const score = Math.max(10, Math.min(100, rawScore));

    let label = 'Medium';
    if (score >= 85) label = 'Critical';
    else if (score >= 70) label = 'High';
    else if (score >= 45) label = 'Medium';
    else label = 'Low';

    let reason = 'Standard scheduled maintenance window with routine track inspection parameters.';
    if (label === 'Critical') {
      reason = 'High criticality and passenger safety risk detected. Immediate track possession required to prevent speed restriction (SR).';
    } else if (label === 'High') {
      reason = 'Elevated wear index on high-density trunk corridor. Scheduled attention recommended during upcoming shadow window.';
    } else if (label === 'Low') {
      reason = 'Preventive maintenance task with low traffic impact; deferrable to scheduled night maintenance slot.';
    }

    return {
      score,
      label,
      factors: {
        criticality,
        urgency,
        safetyRisk,
        assetImportance,
      },
      reason,
    };
  },

  /**
   * Format human-readable duration
   */
  formatDuration(minutes) {
    if (!minutes || minutes <= 0) return '0 min';
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hrs === 0) return `${mins} min`;
    if (mins === 0) return `${hrs} hr`;
    return `${hrs}h ${mins}m`;
  },

  /**
   * Calculate difference between two ISO timestamp strings in minutes
   */
  getDurationMinutes(startIso, endIso) {
    if (!startIso || !endIso) return null;
    const diffMs = new Date(endIso).getTime() - new Date(startIso).getTime();
    if (diffMs <= 0) return 1;
    return Math.round(diffMs / (1000 * 60));
  },
};

export default engineeringService;

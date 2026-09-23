// ============================================================
// PLANNING SERVICE — AI Simulation Engine
// ============================================================
import { maintenanceService } from './maintenanceService.js';
import { blockService } from './blockService.js';
import { PASSENGER_TRAINS, GOODS_TRAINS, GOODS_FORECAST, AI_PLAN_DEMO } from '../data/demoData.js';

// Priority score formula:
// score = criticality×0.40 + urgency×0.30 + safetyRisk×0.20 + assetImportance×0.10
function calcPriorityScore(request) {
  const criticality = { Critical: 100, High: 75, Medium: 50, Low: 25 }[request.priority] || 50;
  const urgency = request.requiredBlock === 'Immediate' ? 100
    : request.requiredBlock === 'AI Recommended' ? 80
    : request.status === 'Pending AI Review' ? 70 : 50;
  const safetyRisk = request.priority === 'Critical' ? 90 : request.priority === 'High' ? 65 : 40;
  const assetImportance = request.location === 'C101' ? 90
    : request.location === 'C102' ? 75
    : request.location === 'C103' ? 70 : 65;
  const score = (criticality * 0.40) + (urgency * 0.30) + (safetyRisk * 0.20) + (assetImportance * 0.10);
  return Math.round(score);
}

// Check if a train occupies a corridor during a time window
function hasTrainConflict(corridor, startTime, endTime, trains) {
  const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const wStart = toMin(startTime);
  const wEnd = toMin(endTime);
  return trains.filter(t => {
    if (t.corridor !== corridor) return false;
    const tStart = toMin(t.start);
    const tEnd = toMin(t.end);
    return !(wEnd <= tStart || wStart >= tEnd);
  });
}

// Check goods forecast for a corridor/time
function getGoodsForecast(corridor, startTime) {
  const forecast = GOODS_FORECAST[corridor];
  if (!forecast) return { level: 'Unknown', value: 0 };
  const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const wStart = toMin(startTime);
  let nearest = forecast[0];
  let minDiff = Infinity;
  for (const f of forecast) {
    const diff = Math.abs(toMin(f.time) - wStart);
    if (diff < minDiff) { minDiff = diff; nearest = f; }
  }
  return nearest;
}

// Check department compatibility
function areDepartmentsCompatible(depts) {
  // All three departments can work together if:
  // - They are on the same corridor
  // - Total duration fits in block
  return depts.length >= 1;
}

// Generate suitability score for a candidate option
function calcSuitabilityScore(option) {
  let score = 100;
  if (option.trainConflicts.length > 0) score -= 40 * option.trainConflicts.length;
  if (option.goodsForecast?.level === 'High') score -= 25;
  if (option.goodsForecast?.level === 'Medium') score -= 10;
  if (option.utilization < 70) score -= 15;
  if (option.departments.length >= 3) score += 10;
  if (option.departments.length === 2) score += 5;
  return Math.max(0, Math.min(100, score));
}

export const planningService = {
  // Simulate AI processing steps
  getProcessingSteps() {
    return [
      { id: 1, label: 'Loading maintenance requests', detail: 'Fetching pending and critical requests from all departments' },
      { id: 2, label: 'Calculating priority scores', detail: 'Applying criticality × 0.40 + urgency × 0.30 + safety × 0.20 + asset × 0.10' },
      { id: 3, label: 'Checking corridor availability', detail: 'Scanning available block windows across C101–C104' },
      { id: 4, label: 'Loading train timetable', detail: 'Importing passenger and goods train schedules for conflict detection' },
      { id: 5, label: 'Checking goods forecast', detail: 'Evaluating goods traffic intensity for each corridor and time window' },
      { id: 6, label: 'Detecting conflicts', detail: 'Identifying overlaps between proposed blocks and train movements' },
      { id: 7, label: 'Finding compatible activities', detail: 'Matching Engineering, S&T and Traction tasks by corridor and timing' },
      { id: 8, label: 'Creating candidate combinations', detail: 'Generating multi-department activity bundles' },
      { id: 9, label: 'Ranking options by suitability', detail: 'Scoring each option using weighted criteria' },
      { id: 10, label: 'Generating recommended plan', detail: 'Selecting optimal coordinated block plan' },
    ];
  },

  generatePlan() {
    const requests = maintenanceService.getAll()
      .filter(r => r.status === 'Pending AI Review' || r.status === 'Scheduled');

    // Score all requests
    const scored = requests.map(r => ({ ...r, priorityScore: calcPriorityScore(r) }))
      .sort((a, b) => b.priorityScore - a.priorityScore);

    // Build options
    const allTrains = [...PASSENGER_TRAINS, ...GOODS_TRAINS];

    const options = AI_PLAN_DEMO.options.map(opt => {
      const passengerConflicts = hasTrainConflict(
        opt.corridor, opt.start, opt.end, PASSENGER_TRAINS
      );
      const goodsForecast = getGoodsForecast(opt.corridor, opt.start);
      const suitabilityScore = calcSuitabilityScore({
        ...opt,
        trainConflicts: passengerConflicts,
        goodsForecast,
      });
      return {
        ...opt,
        trainConflicts: passengerConflicts.map(t => `${t.id} (${t.name})`),
        conflictCount: passengerConflicts.length,
        goodsForecast: goodsForecast.level,
        suitabilityScore,
        recommended: suitabilityScore >= 90,
      };
    });

    const recommended = options.reduce((best, o) =>
      o.suitabilityScore > best.suitabilityScore ? o : best
    , options[0]);

    const plan = {
      ...AI_PLAN_DEMO,
      id: `PLAN-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      tasksAnalyzed: scored.length,
      options,
      recommendedOption: recommended.id,
      approvalStatus: 'Pending',
      approvedBy: null,
      approvedAt: null,
      rejectionReason: null,
    };

    blockService.savePlan(plan);
    return plan;
  },

  getPriorityBreakdown() {
    const all = maintenanceService.getAll();
    const critical = all.filter(r => r.priority === 'Critical').length;
    const high = all.filter(r => r.priority === 'High').length;
    const medium = all.filter(r => r.priority === 'Medium').length;
    const low = all.filter(r => r.priority === 'Low').length;
    return { critical, high, medium, low, total: all.length };
  },
};

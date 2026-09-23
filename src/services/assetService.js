// ============================================================
// ASSET & RESOURCE SERVICE — TRACK MAINTENANCE PORTAL
// ============================================================

export const TRACK_ASSETS = [
  { id: 'TRK-101', name: 'Track 1 (Up Main Line)', corridor: 'C101', section: 'Km 40/0 - 55/0', status: 'Available', speedFit: '130 km/h', ballastHealth: '96%', lastInspection: '2026-09-21' },
  { id: 'TRK-102', name: 'Track 2 (Down Main Line)', corridor: 'C101', section: 'Km 40/0 - 55/0', status: 'Under Maintenance', speedFit: 'Caution 30 km/h', ballastHealth: '78%', lastInspection: '2026-09-20' },
  { id: 'TRK-103', name: 'Track 3 (Loop Line / Siding)', corridor: 'C101', section: 'Palwal Yard Km 52', status: 'Restricted', speedFit: '15 km/h', ballastHealth: '82%', lastInspection: '2026-09-19' },
  { id: 'TRK-201', name: 'Track 1 (Up Trunk)', corridor: 'C102', section: 'Km 12/0 - 28/0', status: 'Available', speedFit: '110 km/h', ballastHealth: '92%', lastInspection: '2026-09-22' },
  { id: 'TRK-202', name: 'Track 2 (Down Trunk)', corridor: 'C102', section: 'Km 12/0 - 28/0', status: 'Available', speedFit: '110 km/h', ballastHealth: '89%', lastInspection: '2026-09-21' },
  { id: 'TRK-301', name: 'Track 1 (Ghat Incline Up)', corridor: 'C103', section: 'Km 85/0 - 102/0', status: 'Available', speedFit: '90 km/h', ballastHealth: '91%', lastInspection: '2026-09-20' },
  { id: 'TRK-401', name: 'Track 1 (High Speed Section)', corridor: 'C104', section: 'Km 05/0 - 32/0', status: 'Available', speedFit: '130 km/h', ballastHealth: '97%', lastInspection: '2026-09-22' },
];

export const MACHINERY_ASSETS = [
  { id: 'MCH-01', name: 'Duomatic Tamping Machine (CSU-09)', type: 'Tamping', status: 'Available', baseDepot: 'Tughlakabad (TKD)', fuelLevel: '85%', operator: 'S. K. Yadav' },
  { id: 'MCH-02', name: 'Ballast Cleaning Machine (BCM-300)', type: 'Ballast Cleaning', status: 'Assigned', baseDepot: 'Mathura Junction', fuelLevel: '92%', operator: 'R. N. Meena' },
  { id: 'MCH-03', name: 'Motorized Inspection Trolley (MIT-04)', type: 'Inspection', status: 'Available', baseDepot: 'Palwal SSE Depot', fuelLevel: '100%', operator: 'V. Prakash' },
  { id: 'MCH-04', name: 'Dynamic Track Stabilizer (DTS-11)', type: 'Stabilizer', status: 'Available', baseDepot: 'Agra Cantt', fuelLevel: '76%', operator: 'M. Ali' },
  { id: 'MCH-05', name: 'Rail Grinding Machine (RGM-72)', type: 'Grinding', status: 'Under Maintenance', baseDepot: 'Delhi Central', fuelLevel: '40%', operator: 'Workshop' },
];

export const STAFF_RESOURCES = [
  { gangId: 'GANG-01', gangName: 'P-Way Sectional Gang #1', leader: 'Mohan Lal (Mate)', totalStaff: 18, availableStaff: 16, assignedStaff: 2, section: 'C101 Km 40-48' },
  { gangId: 'GANG-02', gangName: 'P-Way Sectional Gang #2', leader: 'Harish Chandra (Mate)', totalStaff: 20, availableStaff: 18, assignedStaff: 2, section: 'C101 Km 48-56' },
  { gangId: 'GANG-03', gangName: 'Track Machine Operator Crew', leader: 'D. K. Mishra (JE/TM)', totalStaff: 8, availableStaff: 8, assignedStaff: 0, section: 'Divisional Pool' },
  { gangId: 'GANG-04', gangName: 'Welding & Joint Gang (Alumino-Thermic)', leader: 'Kishan Kumar', totalStaff: 6, availableStaff: 6, assignedStaff: 0, section: 'Mobile Depot' },
];

export const assetService = {
  getSummary() {
    const totalTracks = TRACK_ASSETS.length;
    const availableTracks = TRACK_ASSETS.filter(t => t.status === 'Available').length;
    const trackPercent = Math.round((availableTracks / totalTracks) * 100);

    const totalMachinery = MACHINERY_ASSETS.length;
    const availableMachinery = MACHINERY_ASSETS.filter(m => m.status === 'Available').length;
    const machineryPercent = Math.round((availableMachinery / totalMachinery) * 100);

    const totalStaff = STAFF_RESOURCES.reduce((acc, g) => acc + g.totalStaff, 0);
    const availableStaff = STAFF_RESOURCES.reduce((acc, g) => acc + g.availableStaff, 0);
    const staffPercent = Math.round((availableStaff / totalStaff) * 100);

    return {
      trackAvailability: trackPercent,
      machineryAvailability: machineryPercent,
      staffAvailability: staffPercent,
      overallReadiness: trackPercent >= 80 && machineryPercent >= 60 && staffPercent >= 75 ? 'Ready' : 'Restricted',
      counts: {
        tracksTotal: totalTracks,
        tracksAvailable: availableTracks,
        machineryTotal: totalMachinery,
        machineryAvailable: availableMachinery,
        staffTotal: totalStaff,
        staffAvailable: availableStaff,
      },
    };
  },

  getTrackAssets() {
    return TRACK_ASSETS;
  },

  getMachineryAssets() {
    return MACHINERY_ASSETS;
  },

  getStaffResources() {
    return STAFF_RESOURCES;
  },

  /**
   * Pre-execution Resource Check for Engineering Work
   * Section 31: Evaluates Track, Machinery, Staff readiness before clicking START
   */
  checkResourceReadiness(task) {
    if (!task) {
      return {
        overall: 'CANNOT START',
        isReady: false,
        trackStatus: 'Unknown',
        machineryStatus: 'Unknown',
        staffStatus: 'Unknown',
        reasons: ['No task selected.'],
      };
    }

    const corridor = task.location || task.section || 'C101';
    const matchingTrack = TRACK_ASSETS.find(t => corridor.includes(t.corridor) || t.name.includes(task.trackNumber || 'Track 1')) || TRACK_ASSETS[0];
    const isTrackOk = matchingTrack.status === 'Available' || matchingTrack.status === 'Under Maintenance'; // Under maintenance is ok if it's the target block

    const requestedMachine = (task.machinery || '').toLowerCase();
    const matchingMachine = MACHINERY_ASSETS.find(m => requestedMachine.includes(m.type.toLowerCase()) || requestedMachine.includes('tamper') && m.type === 'Tamping') || MACHINERY_ASSETS[0];
    const isMachineOk = matchingMachine.status === 'Available' || matchingMachine.status === 'Assigned';

    const requiredStaff = task.manpower || task.staffCount || 10;
    const totalAvailStaff = STAFF_RESOURCES.reduce((acc, g) => acc + g.availableStaff, 0);
    const isStaffOk = totalAvailStaff >= requiredStaff;

    const reasons = [];
    if (!isTrackOk) reasons.push(`Track ${matchingTrack.name} status is ${matchingTrack.status}.`);
    if (!isMachineOk) reasons.push(`Required machinery (${matchingMachine.name}) is ${matchingMachine.status}.`);
    if (!isStaffOk) reasons.push(`Required ${requiredStaff} trackmen, but only ${totalAvailStaff} available in shift.`);

    const isReady = isTrackOk && isMachineOk && isStaffOk;

    return {
      overall: isReady ? 'READY TO START' : 'CANNOT START',
      isReady,
      trackStatus: isTrackOk ? 'Available' : matchingTrack.status,
      trackName: matchingTrack.name,
      machineryStatus: isMachineOk ? 'Available' : matchingMachine.status,
      machineryName: matchingMachine.name,
      staffStatus: isStaffOk ? 'Available' : 'Insufficient',
      staffCount: `${requiredStaff} Staff Required (${totalAvailStaff} on duty)`,
      reasons: reasons.length > 0 ? reasons : ['All required track, machine and sectional crew are in position.'],
    };
  },
};

export default assetService;

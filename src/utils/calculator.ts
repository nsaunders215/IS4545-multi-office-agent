import { PatientRecord, CalculatedKPIs, DistinctComment } from '../types';

export function calculateKPIs(records: PatientRecord[]): CalculatedKPIs {
  const totalRecords = records.length;

  if (totalRecords === 0) {
    return {
      totalRecords: 0,
      avgSatisfaction: 0,
      avgCommunication: 0,
      followupComplianceRate: 0,
      portalUsageRate: 0,
      satisfactionByServiceLine: {},
      satisfactionByYear: {},
      satisfactionByPersona: {},
      satisfactionByVisitType: {},
      readmissionRiskCounts: { Low: 0, Moderate: 0, High: 0 },
      aiRiskFlagCounts: {},
      distinctComments: []
    };
  }

  let totalSat = 0;
  let totalComm = 0;
  let followupCount = 0;
  let portalCount = 0;

  const satByService: Record<string, { sumSat: number; sumComm: number; count: number }> = {};
  const satByYear: Record<string, { sumSat: number; count: number }> = {};
  const satByPersona: Record<string, { sumSat: number; count: number }> = {};
  const satByVisit: Record<string, { sumSat: number; count: number }> = {};
  const readmissionCounts = { Low: 0, Moderate: 0, High: 0 };
  const flagCounts: Record<string, number> = {};

  // For distinct comments aggregation
  const commentMap = new Map<string, {
    comment: string;
    count: number;
    commSum: number;
    flags: Record<string, number>;
    recordIds: string[];
  }>();

  records.forEach((rec) => {
    const sat = Number(rec.Patient_Satisfaction) || 0;
    const comm = Number(rec.Communication_Rating) || 0;
    const follow = Number(rec.Followup_Compliance) === 1 ? 1 : 0;
    const portal = Number(rec.Portal_Usage) === 1 ? 1 : 0;

    totalSat += sat;
    totalComm += comm;
    followupCount += follow;
    portalCount += portal;

    // Service line
    const sLine = rec.Service_Line || 'Unknown';
    if (!satByService[sLine]) satByService[sLine] = { sumSat: 0, sumComm: 0, count: 0 };
    satByService[sLine].sumSat += sat;
    satByService[sLine].sumComm += comm;
    satByService[sLine].count += 1;

    // Year
    const yearStr = String(rec.Year || 'Unknown');
    if (!satByYear[yearStr]) satByYear[yearStr] = { sumSat: 0, count: 0 };
    satByYear[yearStr].sumSat += sat;
    satByYear[yearStr].count += 1;

    // Persona
    const persona = rec.Patient_Persona || 'General';
    if (!satByPersona[persona]) satByPersona[persona] = { sumSat: 0, count: 0 };
    satByPersona[persona].sumSat += sat;
    satByPersona[persona].count += 1;

    // Visit type
    const vType = rec.Visit_Type || 'Other';
    if (!satByVisit[vType]) satByVisit[vType] = { sumSat: 0, count: 0 };
    satByVisit[vType].sumSat += sat;
    satByVisit[vType].count += 1;

    // Readmission risk
    if (rec.Readmission_Risk === 'High') readmissionCounts.High += 1;
    else if (rec.Readmission_Risk === 'Moderate') readmissionCounts.Moderate += 1;
    else readmissionCounts.Low += 1;

    // AI Risk Flag
    const flag = rec.AI_Risk_Flag || 'Standard Review';
    flagCounts[flag] = (flagCounts[flag] || 0) + 1;

    // Grouping distinct comment
    const commentText = (rec.Comment || '').trim();
    if (commentText) {
      if (!commentMap.has(commentText)) {
        commentMap.set(commentText, {
          comment: commentText,
          count: 0,
          commSum: 0,
          flags: {},
          recordIds: []
        });
      }
      const item = commentMap.get(commentText)!;
      item.count += 1;
      item.commSum += comm;
      item.flags[flag] = (item.flags[flag] || 0) + 1;
      item.recordIds.push(rec.id);
    }
  });

  const distinctComments: DistinctComment[] = Array.from(commentMap.entries()).map(([_, val], idx) => {
    const id = `C${String(idx + 1).padStart(2, '0')}`;
    return {
      id,
      comment: val.comment,
      count: val.count,
      avgCommunicationRating: Number((val.commSum / val.count).toFixed(2)),
      aiRiskFlagCounts: val.flags,
      recordIds: val.recordIds
    };
  });

  // Calculate averages
  const satisfactionByServiceLine: Record<string, { avgSat: number; count: number; avgComm: number }> = {};
  for (const [key, val] of Object.entries(satByService)) {
    satisfactionByServiceLine[key] = {
      avgSat: Number((val.sumSat / val.count).toFixed(2)),
      avgComm: Number((val.sumComm / val.count).toFixed(2)),
      count: val.count
    };
  }

  const satisfactionByYear: Record<string, { avgSat: number; count: number }> = {};
  for (const [key, val] of Object.entries(satByYear)) {
    satisfactionByYear[key] = {
      avgSat: Number((val.sumSat / val.count).toFixed(2)),
      count: val.count
    };
  }

  const satisfactionByPersona: Record<string, { avgSat: number; count: number }> = {};
  for (const [key, val] of Object.entries(satByPersona)) {
    satisfactionByPersona[key] = {
      avgSat: Number((val.sumSat / val.count).toFixed(2)),
      count: val.count
    };
  }

  const satisfactionByVisitType: Record<string, { avgSat: number; count: number }> = {};
  for (const [key, val] of Object.entries(satByVisit)) {
    satisfactionByVisitType[key] = {
      avgSat: Number((val.sumSat / val.count).toFixed(2)),
      count: val.count
    };
  }

  return {
    totalRecords,
    avgSatisfaction: Number((totalSat / totalRecords).toFixed(2)),
    avgCommunication: Number((totalComm / totalRecords).toFixed(2)),
    followupComplianceRate: Number(((followupCount / totalRecords) * 100).toFixed(1)),
    portalUsageRate: Number(((portalCount / totalRecords) * 100).toFixed(1)),
    satisfactionByServiceLine,
    satisfactionByYear,
    satisfactionByPersona,
    satisfactionByVisitType,
    readmissionRiskCounts: readmissionCounts,
    aiRiskFlagCounts: flagCounts,
    distinctComments
  };
}

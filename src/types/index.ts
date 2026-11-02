export interface PatientRecord {
  id: string;
  Patient_Persona: string;
  Age_Group: string;
  Visit_Type: string;
  Service_Line: string;
  Year: number;
  Patient_Satisfaction: number; // 1-5
  Communication_Rating: number; // 1-5
  Followup_Compliance: number; // 0 or 1
  Portal_Usage: number; // 0 or 1
  Readmission_Risk: 'Low' | 'Moderate' | 'High';
  AI_Risk_Flag: 'Standard Review' | 'Human Review Required' | 'Hallucination Risk' | 'Bias Review' | string;
  Comment: string;
}

export interface DistinctComment {
  id: string;
  comment: string;
  count: number;
  avgCommunicationRating: number;
  aiRiskFlagCounts: Record<string, number>;
  recordIds: string[];
}

export interface CalculatedKPIs {
  totalRecords: number;
  avgSatisfaction: number;
  avgCommunication: number;
  followupComplianceRate: number; // 0 - 100 percentage
  portalUsageRate: number; // 0 - 100 percentage
  satisfactionByServiceLine: Record<string, { avgSat: number; count: number; avgComm: number }>;
  satisfactionByYear: Record<string, { avgSat: number; count: number }>;
  satisfactionByPersona: Record<string, { avgSat: number; count: number }>;
  satisfactionByVisitType: Record<string, { avgSat: number; count: number }>;
  readmissionRiskCounts: {
    Low: number;
    Moderate: number;
    High: number;
  };
  aiRiskFlagCounts: Record<string, number>;
  distinctComments: DistinctComment[];
}

export type AgentKey = 'agent4_plan' | 'agent1' | 'agent2' | 'agent3' | 'agent6' | 'agent5' | 'agent4_decision';

export type AgentStatus = 'pending' | 'running' | 'waiting_review' | 'completed' | 'skipped' | 'failed';

export type RunMode = 'auto' | 'step_by_step';

// Agent 4 Plan
export interface AgentPlanOutput {
  goal: string;
  agents: Array<{
    agent: string;
    run: boolean;
    task: string;
    reason: string;
  }>;
}

// Agent 1 Feedback Insight
export interface Agent1Output {
  comments: Array<{
    id: string;
    theme: string;
    sentiment: string;
    reasoning: string;
    operational_issue: string;
    risk_or_bias_concern: string;
    recommended_action: string;
  }>;
  summary: string;
}

// Agent 2 Monitoring
export interface Agent2Output {
  patterns: Array<{
    pattern: string;
    evidence: string;
  }>;
  operational_issues: string[];
  equity_concerns: Array<{
    group: string;
    concern: string;
    evidence: string;
  }>;
  risk: {
    patient_safety: string;
    reputational: string;
    compliance: string;
    equity: string;
  };
  recommendation: string;
  additional_information_needed: string;
}

// Agent 3 Triage
export interface Agent3Output {
  complaints: Array<{
    id: string;
    primary_category: string;
    secondary_categories: string[];
    severity_level: number;
    severity_reasoning: string;
    risks: Array<{
      risk: string;
      why: string;
    }>;
    route_to: string;
    human_review_required: boolean;
    human_review_reason: string;
  }>;
  summary: string;
}

// Agent 6 Communication Evaluator
export interface Agent6Output {
  evaluations: Array<{
    id: string;
    purpose: string;
    purpose_rationale: string;
    scores: {
      clarity: string | number;
      completeness: string | number;
      empathy: string | number;
      patient_centeredness: string | number;
      actionability: string | number;
    };
    health_literacy_concern: string;
    risk: string;
    risk_reason: string;
    improvements: string[];
  }>;
  improved_patient_message: string;
  executive_summary: {
    overall_quality: string;
    major_strengths: string;
    major_weaknesses: string;
    highest_risk: string;
    most_important_improvement: string;
  };
}

// Agent 5 Analytics
export interface Agent5Output {
  headline: string;
  satisfaction_insights: string[];
  top_themes: string[];
  hidden_problems: Array<{
    problem: string;
    evidence: string;
  }>;
  ai_risk_monitoring: {
    hallucination_trap: string[];
    bias_related: string[];
    human_review: string[];
  };
  top_priorities: string[];
  quick_wins: string[];
  long_term_ai_opportunities: string[];
  additional_information_needed: string;
}

// Agent 4 Final Decision
export interface Agent4DecisionOutput {
  top_alert: string;
  answer: string;
  priority: string; // 'Low' | 'Medium' | 'High'
  priority_reason: string;
  recommended_actions: Array<{
    action: string;
    owner: string;
    timeframe: string;
  }>;
  human_review: Array<{
    item: string;
    reason: string;
  }>;
}

export interface AgentWorkflowState {
  currentStep: number; // 0: not started, 1: plan, 2: specialists, 3: analytics, 4: final decision, 5: all done
  statuses: Record<AgentKey, AgentStatus>;
  errors: Record<AgentKey, string | null>;
  inputs: Record<AgentKey, any>;
  outputs: {
    agent4_plan: AgentPlanOutput | null;
    agent1: Agent1Output | null;
    agent2: Agent2Output | null;
    agent3: Agent3Output | null;
    agent6: Agent6Output | null;
    agent5: Agent5Output | null;
    agent4_decision: Agent4DecisionOutput | null;
  };
}

export interface AgentInfo {
  id: AgentKey;
  number: number;
  code: string;
  name: string;
  title: string;
  shortDesc: string;
  role: string;
  color: string;
  accentClass: string;
  borderClass: string;
  badgeClass: string;
  iconName: string;
  step: 1 | 2 | 3 | 4;
}

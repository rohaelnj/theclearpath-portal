export type PlanName = 'Intensive Weekly' | 'Weekly' | 'Bi-weekly';

export type IntakeAnswers = {
  anxiety?: string;
  sleep?: string;
  risk?: string;
  goal?: string;
  therapistGender?: string;
};

export type PlanRecommendation = {
  name: PlanName;
  features: string[];
};

export function decodeIntakeCookie(cookieValue: string | undefined | null): IntakeAnswers {
  if (!cookieValue) return {};

  try {
    return JSON.parse(cookieValue) as IntakeAnswers;
  } catch {
    return {};
  }
}

export function selectPlan(answers: IntakeAnswers): PlanRecommendation {
  if (answers.risk === 'yes' || ['often', 'always'].includes(answers.anxiety ?? '')) {
    return {
      name: 'Intensive Weekly',
      features: [
        '1:1 therapy sessions every week',
        'Dedicated clinician for high-support concerns',
        'Priority messaging between sessions',
        'Weekly progress tracking and adjustments',
      ],
    };
  }

  if (['poor', 'very_poor'].includes(answers.sleep ?? '')) {
    return {
      name: 'Weekly',
      features: [
        'Four sessions per month with flexible scheduling',
        'Personalised sleep hygiene guidance',
        'Goal tracking dashboard inside the portal',
        'Therapist check-ins to keep momentum',
      ],
    };
  }

  return {
    name: 'Bi-weekly',
    features: [
      'Two sessions per month focused on steady progress',
      'Action plans between sessions',
      'Self-guided resources aligned with your goals',
      'Easy rescheduling inside the portal',
    ],
  };
}

export function buildRationale(planName: PlanName, answers: IntakeAnswers): string {
  const reasons: string[] = [];

  if (answers.anxiety && ['often', 'always'].includes(answers.anxiety)) {
    reasons.push('you noted experiencing frequent anxiety');
  }
  if (answers.sleep && ['poor', 'very_poor'].includes(answers.sleep)) {
    reasons.push('your sleep quality could use structured support');
  }
  if (answers.risk === 'yes') {
    reasons.push('we prioritised high-touch care to keep you safe and supported');
  }
  if (answers.therapistGender && answers.therapistGender !== 'no_preference') {
    reasons.push(`we will match you with a ${answers.therapistGender} therapist per your preference`);
  }
  if (answers.goal) {
    reasons.push(`and we’ll focus sessions on "${answers.goal}"`);
  }

  if (!reasons.length) {
    return `${planName} balances steady progress with flexibility—ideal for continuing your wellbeing journey.`;
  }

  return `We recommended ${planName.toLowerCase()} care because ${formatReasons(reasons)}.`;
}

function formatReasons(reasons: string[]): string {
  if (reasons.length === 1) {
    return reasons[0];
  }
  const last = reasons.pop();
  return `${reasons.join(', ')} and ${last}`;
}

export function buildContext(lead: any) {
  const industry = lead.Industry || 'your industry';
  const city = lead.City || 'your area';
  const businessName = lead.BusinessName || 'your business';
  
  // Dynamic pain points based on industry if needed, but defaults for now
  const painPoints = [
    "missed inbound leads due to slow response",
    "manual follow-up eating up staff time",
    "dropping the ball on interested prospects"
  ];

  return {
    businessName,
    industry,
    city,
    painPoints,
    offerAngle: "AI-driven autonomous sales engagement",
    tone: "professional yet conversational",
    localReference: city !== 'your area' ? `businesses in ${city}` : 'local businesses'
  };
}
